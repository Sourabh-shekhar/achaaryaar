import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { isValidObjectId } from "mongoose";

import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/mongodb";
import { getCoupon } from "@/lib/coupons";

import Order from "@/models/Order";
import Product from "@/models/Product";

import {
  sendAdminOrderNotification,
  sendOrderConfirmation,
} from "@/lib/sendEmail";

import { processShipmozoOrder } from "@/lib/processShipmozoOrder";

// ======================================================
// HELPERS
// ======================================================

function normalizeEmail(email: string) {
  return String(email || "")
    .trim()
    .toLowerCase();
}

function normalizePhone(phone: string) {
  return String(phone || "")
    .replace(/\D/g, "")
    .replace(/^91/, "");
}

// ======================================================
// COUPON VALIDATION
// ======================================================

async function resolveCoupon(
  email: string,
  phone: string,
  rawCode?: string
) {
  const code = String(rawCode || "")
    .trim()
    .toUpperCase();

  if (!code) {
    return {
      code: "",
      percent: 0,
      error: null as string | null,
    };
  }

  const coupon = await getCoupon(code);

  if (!coupon) {
    return {
      code: "",
      percent: 0,
      error: "That coupon code isn't valid.",
    };
  }

  const normalizedEmail = normalizeEmail(email);
  const normalizedPhone = normalizePhone(phone);

  // ----------------------------------------------------
  // CHECK IF THIS COUPON WAS ALREADY USED
  // ----------------------------------------------------

  const alreadyUsed = await Order.findOne({
    couponCode: code,
    $or: [
      {
        email: normalizedEmail,
      },
      {
        normalizedPhone,
      },
    ],
  });

  if (alreadyUsed) {
    return {
      code: "",
      percent: 0,
      error: `You've already used ${code} on a previous order.`,
    };
  }

  // ----------------------------------------------------
  // FIRST ORDER COUPON
  // ----------------------------------------------------

  if (coupon.firstOrderOnly) {
    const anyPriorOrder = await Order.findOne({
      $or: [
        {
          email: normalizedEmail,
        },
        {
          normalizedPhone,
        },
      ],
    });

    if (anyPriorOrder) {
      return {
        code: "",
        percent: 0,
        error: `${code} is only valid on your first order.`,
      };
    }
  }

  return {
    code,
    percent: coupon.percent,
    error: null as string | null,
  };
}

// ======================================================
// CREATE ORDER
// ======================================================

export async function POST(req: Request) {
  try {
    await connectDB();

    // --------------------------------------------------
    // GET LOGGED-IN USER
    // --------------------------------------------------

    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        {
          success: false,
          message: "Please login before placing an order.",
        },
        {
          status: 401,
        }
      );
    }

    const body = await req.json();

    const email = normalizeEmail(session.user.email);
    const phone = String(body.phone || "").trim();
    const normalizedPhone = normalizePhone(phone);

    // --------------------------------------------------
    // BASIC VALIDATION
    // --------------------------------------------------

    if (!body.fullName) {
      return NextResponse.json(
        {
          success: false,
          message: "Full name is required.",
        },
        {
          status: 400,
        }
      );
    }

    if (!phone) {
      return NextResponse.json(
        {
          success: false,
          message: "Phone number is required.",
        },
        {
          status: 400,
        }
      );
    }

    if (!body.address) {
      return NextResponse.json(
        {
          success: false,
          message: "Address is required.",
        },
        {
          status: 400,
        }
      );
    }

    if (!body.city) {
      return NextResponse.json(
        {
          success: false,
          message: "City is required.",
        },
        {
          status: 400,
        }
      );
    }

    if (!body.pincode) {
      return NextResponse.json(
        {
          success: false,
          message: "Pincode is required.",
        },
        {
          status: 400,
        }
      );
    }

    if (!Array.isArray(body.items) || body.items.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Your cart is empty.",
        },
        {
          status: 400,
        }
      );
    }

    // ==================================================
    // STEP 0: COUPON
    // ==================================================

    const coupon = await resolveCoupon(
      email,
      phone,
      body.couponCode
    );

    if (coupon.error) {
      return NextResponse.json(
        {
          success: false,
          message: coupon.error,
        },
        {
          status: 400,
        }
      );
    }

    // ==================================================
    // STEP 1: VALIDATE & RESERVE STOCK
    // ==================================================

    const decrementedItems: {
      _id: string;
      selectedVariant?: string;
      quantity: number;
      isCombo?: boolean;
      comboVariant?: string;
    }[] = [];

    const outOfStockItems: string[] = [];

    for (const item of body.items) {
      // -----------------------------------------------
      // INVALID PRODUCT ID
      // -----------------------------------------------

      if (!isValidObjectId(item._id)) {
        console.error(
          "Invalid product ID received:",
          item._id
        );

        outOfStockItems.push(String(item._id));
        continue;
      }

      const quantity = Math.max(
        1,
        Number(item.quantity) || 1
      );

      let updatedProduct = null;

      // ===============================================
      // COMBO PRODUCT
      // ===============================================

      if (item.isCombo) {
        /*
          New combo system:

          comboVariants:
          [
            {
              unitWeight: "120g",
              price: 500,
              stock: 10
            },
            ...
          ]

          The selected variant normally comes from
          item.selectedVariant.

          We support both:

          item.selectedVariant = "120g"

          OR

          item.comboVariant = "120g"
        */

        const selectedComboVariant =
          String(
            item.selectedVariant ||
              item.comboVariant ||
              ""
          ).trim();

        if (selectedComboVariant) {
          updatedProduct =
            await Product.findOneAndUpdate(
              {
                _id: item._id,
                isCombo: true,

                comboVariants: {
                  $elemMatch: {
                    unitWeight: selectedComboVariant,
                    stock: {
                      $gte: quantity,
                    },
                  },
                },
              },
              {
                $inc: {
                  "comboVariants.$[variant].stock":
                    -quantity,
                },
              },
              {
                arrayFilters: [
                  {
                    "variant.unitWeight":
                      selectedComboVariant,
                  },
                ],
                new: true,
              }
            );

          if (updatedProduct) {
            decrementedItems.push({
              _id: String(item._id),
              selectedVariant:
                selectedComboVariant,
              comboVariant:
                selectedComboVariant,
              quantity,
              isCombo: true,
            });
          }
        } else {
          // -------------------------------------------
          // LEGACY COMBO SUPPORT
          // -------------------------------------------

          updatedProduct =
            await Product.findOneAndUpdate(
              {
                _id: item._id,
                isCombo: true,
                comboStock: {
                  $gte: quantity,
                },
              },
              {
                $inc: {
                  comboStock: -quantity,
                },
              },
              {
                new: true,
              }
            );

          if (updatedProduct) {
            decrementedItems.push({
              _id: String(item._id),
              quantity,
              isCombo: true,
            });
          }
        }
      }

      // ===============================================
      // NORMAL PRODUCT
      // ===============================================

      else {
        const selectedVariant = String(
          item.selectedVariant || ""
        ).trim();

        if (!selectedVariant) {
          console.error(
            "Missing selectedVariant:",
            item
          );

          outOfStockItems.push(String(item._id));
          continue;
        }

        updatedProduct =
          await Product.findOneAndUpdate(
            {
              _id: item._id,

              weights: {
                $elemMatch: {
                  size: selectedVariant,
                  stock: {
                    $gte: quantity,
                  },
                },
              },
            },
            {
              $inc: {
                "weights.$[elem].stock":
                  -quantity,
              },
            },
            {
              arrayFilters: [
                {
                  "elem.size":
                    selectedVariant,
                },
              ],
              new: true,
            }
          );

        if (updatedProduct) {
          decrementedItems.push({
            _id: String(item._id),
            selectedVariant,
            quantity,
            isCombo: false,
          });
        }
      }

      // -----------------------------------------------
      // STOCK UPDATE FAILED
      // -----------------------------------------------

      if (!updatedProduct) {
        console.error(
          "Unable to reserve stock for product:",
          item._id,
          "variant:",
          item.selectedVariant
        );

        outOfStockItems.push(String(item._id));
      }
    }

    // ==================================================
    // STEP 1B: ROLLBACK IF ANY ITEM FAILED
    // ==================================================

    if (outOfStockItems.length > 0) {
      console.log(
        "Rolling back reserved stock..."
      );

      for (const item of decrementedItems) {
        try {
          // -------------------------------------------
          // COMBO
          // -------------------------------------------

          if (item.isCombo) {
            const comboVariant =
              item.comboVariant ||
              item.selectedVariant;

            if (comboVariant) {
              await Product.updateOne(
                {
                  _id: item._id,
                  "comboVariants.unitWeight":
                    comboVariant,
                },
                {
                  $inc: {
                    "comboVariants.$.stock":
                      item.quantity,
                  },
                }
              );
            } else {
              // Legacy combo
              await Product.updateOne(
                {
                  _id: item._id,
                },
                {
                  $inc: {
                    comboStock: item.quantity,
                  },
                }
              );
            }
          }

          // -------------------------------------------
          // NORMAL PRODUCT
          // -------------------------------------------

          else if (item.selectedVariant) {
            await Product.updateOne(
              {
                _id: item._id,
                "weights.size":
                  item.selectedVariant,
              },
              {
                $inc: {
                  "weights.$.stock":
                    item.quantity,
                },
              }
            );
          }
        } catch (rollbackError) {
          console.error(
            "Stock rollback failed:",
            rollbackError
          );
        }
      }

      return NextResponse.json(
        {
          success: false,
          message:
            "Some items in your cart are no longer in stock.",
          outOfStockItems,
        },
        {
          status: 409,
        }
      );
    }

    // ==================================================
    // STEP 2: CALCULATE PRICE
    // ==================================================

    const subtotal =
      Number(body.subtotal) || 0;

    const shipping =
      subtotal >= 499 ? 0 : 50;

    const discount = Math.round(
      (subtotal * coupon.percent) / 100
    );

    const total = Math.max(
      0,
      subtotal - discount + shipping
    );

    // ==================================================
    // STEP 3: CREATE ORDER
    // ==================================================

    let order;

    try {
      order = await Order.create({
        ...body,

        // NEVER trust email from browser.
        email,

        // Store both original and normalized phone.
        phone,
        normalizedPhone,

        // Server-calculated values.
        subtotal,
        shipping,
        couponCode: coupon.code,
        discount,
        total,

        // Payment.
        paymentStatus: "Paid",

        // Shipmozo initial values.
        courierName: "",
        trackingNumber: "",
        estimatedDelivery: "",
        shipmozoOrderId: "",
        shippingStatus: "Pending",
        trackingUrl: "",

        // Initial order status.
        status: "Processing",
      });
    } catch (orderCreationError) {
      // -----------------------------------------------
      // IMPORTANT:
      // If MongoDB order creation fails, return stock.
      // -----------------------------------------------

      console.error(
        "Order creation failed:",
        orderCreationError
      );

      for (const item of decrementedItems) {
        try {
          if (item.isCombo) {
            const comboVariant =
              item.comboVariant ||
              item.selectedVariant;

            if (comboVariant) {
              await Product.updateOne(
                {
                  _id: item._id,
                  "comboVariants.unitWeight":
                    comboVariant,
                },
                {
                  $inc: {
                    "comboVariants.$.stock":
                      item.quantity,
                  },
                }
              );
            } else {
              await Product.updateOne(
                {
                  _id: item._id,
                },
                {
                  $inc: {
                    comboStock:
                      item.quantity,
                  },
                }
              );
            }
          } else if (item.selectedVariant) {
            await Product.updateOne(
              {
                _id: item._id,
                "weights.size":
                  item.selectedVariant,
              },
              {
                $inc: {
                  "weights.$.stock":
                    item.quantity,
                },
              }
            );
          }
        } catch (rollbackError) {
          console.error(
            "Order failure stock rollback failed:",
            rollbackError
          );
        }
      }

      return NextResponse.json(
        {
          success: false,
          message:
            "Failed to save order. Your stock has been restored.",
        },
        {
          status: 500,
        }
      );
    }

    // ==================================================
    // STEP 4: EMAILS
    // ==================================================

    try {
      await sendOrderConfirmation(
        email,
        body.fullName,
        order._id.toString()
      );

      await sendAdminOrderNotification({
        _id: order._id.toString(),
        fullName: body.fullName,
        email,
        phone,
        total,
        paymentMethod:
          body.paymentMethod,
      });
    } catch (emailError) {
      // Email failure must NOT cancel order.
      console.error(
        "Order email failed. Order still placed:",
        emailError
      );
    }

    // ==================================================
    // STEP 5: SHIPMOZO
    // ==================================================

    let finalOrder = order;

    try {
      console.log(
        "Processing Shipmozo order:",
        order._id.toString()
      );

      finalOrder =
        await processShipmozoOrder(order);

      console.log(
        "Shipmozo order processed successfully:",
        {
          orderId:
            finalOrder._id?.toString(),

          shipmozoOrderId:
            finalOrder.shipmozoOrderId,

          courierName:
            finalOrder.courierName,

          trackingNumber:
            finalOrder.trackingNumber,

          status:
            finalOrder.status,

          shippingStatus:
            finalOrder.shippingStatus,
        }
      );

      // Make sure we return the latest MongoDB version.
      finalOrder =
        (await Order.findById(
          order._id
        )) || finalOrder;
    } catch (shipmozoError) {
      // Shipmozo failure MUST NOT cancel order.
      console.error(
        "Shipmozo processing failed:",
        shipmozoError
      );

      await Order.findByIdAndUpdate(
        order._id,
        {
          status: "Processing",
          shippingStatus: "Pending",
        },
        {
          new: true,
        }
      );

      finalOrder =
        (await Order.findById(
          order._id
        )) || order;
    }

    // ==================================================
    // STEP 6: RETURN SUCCESS
    // ==================================================

    return NextResponse.json({
      success: true,
      order: finalOrder,
    });
  } catch (error) {
    console.error(
      "Create order error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to create order",
      },
      {
        status: 500,
      }
    );
  }
}

// ======================================================
// GET ORDERS
// ======================================================
//
// ADMIN:
//   Returns ALL orders.
//
// CUSTOMER:
//   Returns ONLY their own orders.
//

export async function GET() {
  try {
    // --------------------------------------------------
    // AUTH
    // --------------------------------------------------

    const session =
      await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Please login first.",
        },
        {
          status: 401,
        }
      );
    }

    // --------------------------------------------------
    // DATABASE
    // --------------------------------------------------

    await connectDB();

    const sessionEmail =
      normalizeEmail(
        session.user.email || ""
      );

    if (!sessionEmail) {
      return NextResponse.json(
        {
          success: false,
          message:
            "User email not found.",
        },
        {
          status: 400,
        }
      );
    }

    const user =
      session.user as typeof session.user & {
        id?: string;
        role?: string;
      };

    let orders;

    // ==================================================
    // ADMIN
    // ==================================================

    if (user.role === "admin") {
      console.log(
        "GET /api/orders -> ADMIN"
      );

      orders =
        await Order.find({})
          .sort({
            createdAt: -1,
          })
          .lean();
    }

    // ==================================================
    // CUSTOMER
    // ==================================================

    else {
      console.log(
        "GET /api/orders -> CUSTOMER:",
        sessionEmail
      );

      orders =
        await Order.find({
          email: sessionEmail,
        })
          .sort({
            createdAt: -1,
          })
          .lean();
    }

    console.log(
      `Returning ${orders.length} orders`
    );

    return NextResponse.json({
      success: true,
      orders,
    });
  } catch (error) {
    console.error(
      "Fetch orders error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to fetch orders",
      },
      {
        status: 500,
      }
    );
  }
}