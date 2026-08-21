// import crypto from "crypto";
// import { NextResponse } from "next/server";
// import { getServerSession } from "next-auth";
// import { isValidObjectId } from "mongoose";

// import { authOptions } from "@/app/api/auth/[...nextauth]/route";
// import { connectDB } from "@/lib/mongodb";
// import { getCoupon } from "@/lib/coupons";
// import Order from "@/models/Order";

// import {
//   sendAdminOrderNotification,
//   sendOrderConfirmation,
// } from "@/lib/sendEmail";

// import { processShipmozoOrder } from "@/lib/processShipmozoOrder";

// type CartItem = {
//   _id: string;
//   selectedVariant?: string;
//   quantity: number;
//   isCombo?: boolean;
// };

// /**
//  * --------------------------------------------------------
//  * COUPON VALIDATION
//  * --------------------------------------------------------
//  */
// async function resolveCoupon(
//   email: string,
//   rawCode: string | undefined
// ) {
//   const code = (rawCode || "").trim().toUpperCase();

//   if (!code) {
//     return {
//       code: "",
//       percent: 0,
//       error: null as string | null,
//     };
//   }

//   const coupon = await getCoupon(code);

//   if (!coupon) {
//     return {
//       code: "",
//       percent: 0,
//       error: "That coupon code isn't valid.",
//     };
//   }

//   const alreadyUsed = await Order.findOne({
//     email,
//     couponCode: code,
//   });

//   if (alreadyUsed) {
//     return {
//       code: "",
//       percent: 0,
//       error: `You've already used ${code} on a previous order.`,
//     };
//   }

//   if (coupon.firstOrderOnly) {
//     const anyPriorOrder = await Order.findOne({
//       email,
//     });

//     if (anyPriorOrder) {
//       return {
//         code: "",
//         percent: 0,
//         error: `${code} is only valid on your first order.`,
//       };
//     }
//   }

//   return {
//     code,
//     percent: coupon.percent,
//     error: null as string | null,
//   };
// }

// /**
//  * --------------------------------------------------------
//  * RESERVE STOCK ATOMICALLY
//  * --------------------------------------------------------
//  */
// async function reserveStock(items: CartItem[]) {
//   const decrementedItems: CartItem[] = [];
//   const outOfStockItems: string[] = [];

//   for (const item of items || []) {
//     if (!isValidObjectId(item._id)) {
//       outOfStockItems.push(item._id);
//       continue;
//     }

//     const quantity = Math.max(
//       1,
//       Number(item.quantity) || 1
//     );

//     let updatedProduct;

//     /**
//      * COMBO
//      */
//     if (item.isCombo) {
//       const Product = (
//         await import("@/models/Product")
//       ).default;

//       updatedProduct =
//         await Product.findOneAndUpdate(
//           {
//             _id: item._id,
//             isCombo: true,
//             comboStock: {
//               $gte: quantity,
//             },
//           },
//           {
//             $inc: {
//               comboStock: -quantity,
//             },
//           },
//           {
//             new: true,
//           }
//         );
//     }

//     /**
//      * NORMAL PRODUCT
//      */
//     else {
//       if (!item.selectedVariant) {
//         outOfStockItems.push(item._id);
//         continue;
//       }

//       const Product = (
//         await import("@/models/Product")
//       ).default;

//       updatedProduct =
//         await Product.findOneAndUpdate(
//           {
//             _id: item._id,
//             weights: {
//               $elemMatch: {
//                 size: item.selectedVariant,
//                 stock: {
//                   $gte: quantity,
//                 },
//               },
//             },
//           },
//           {
//             $inc: {
//               "weights.$[elem].stock": -quantity,
//             },
//           },
//           {
//             arrayFilters: [
//               {
//                 "elem.size":
//                   item.selectedVariant,
//               },
//             ],
//             new: true,
//           }
//         );
//     }

//     if (!updatedProduct) {
//       outOfStockItems.push(item._id);
//     } else {
//       decrementedItems.push({
//         ...item,
//         quantity,
//       });
//     }
//   }

//   return {
//     decrementedItems,
//     outOfStockItems,
//   };
// }

// /**
//  * --------------------------------------------------------
//  * ROLLBACK STOCK
//  * --------------------------------------------------------
//  */
// async function rollbackStock(
//   items: CartItem[]
// ) {
//   const Product = (
//     await import("@/models/Product")
//   ).default;

//   for (const item of items) {
//     const quantity = Math.max(
//       1,
//       Number(item.quantity) || 1
//     );

//     /**
//      * COMBO
//      */
//     if (item.isCombo) {
//       await Product.updateOne(
//         {
//           _id: item._id,
//         },
//         {
//           $inc: {
//             comboStock: quantity,
//           },
//         }
//       );
//     }

//     /**
//      * NORMAL PRODUCT
//      */
//     else if (item.selectedVariant) {
//       await Product.updateOne(
//         {
//           _id: item._id,
//           "weights.size":
//             item.selectedVariant,
//         },
//         {
//           $inc: {
//             "weights.$.stock": quantity,
//           },
//         }
//       );
//     }
//   }
// }

// /**
//  * --------------------------------------------------------
//  * POST
//  * --------------------------------------------------------
//  */
// export async function POST(
//   req: Request
// ) {
//   try {
//     // ----------------------------------------------------
//     // 1. REQUIRE LOGIN
//     // ----------------------------------------------------

//     const session =
//       await getServerSession(authOptions);

//     if (!session?.user?.email) {
//       return NextResponse.json(
//         {
//           success: false,
//           message:
//             "Please login before placing an order.",
//         },
//         {
//           status: 401,
//         }
//       );
//     }

//     const email =
//       session.user.email;

//     // ----------------------------------------------------
//     // 2. RAZORPAY SECRET
//     // ----------------------------------------------------

//     const keySecret =
//       process.env.RAZORPAY_KEY_SECRET;

//     if (!keySecret) {
//       return NextResponse.json(
//         {
//           success: false,
//           message:
//             "Razorpay secret is not configured.",
//         },
//         {
//           status: 500,
//         }
//       );
//     }

//     // ----------------------------------------------------
//     // 3. READ REQUEST
//     // ----------------------------------------------------

//     const body =
//       await req.json();

//     const {
//       razorpay_order_id,
//       razorpay_payment_id,
//       razorpay_signature,
//       orderPayload,
//     } = body;

//     if (
//       !razorpay_order_id ||
//       !razorpay_payment_id ||
//       !razorpay_signature ||
//       !orderPayload
//     ) {
//       return NextResponse.json(
//         {
//           success: false,
//           message:
//             "Missing payment verification details.",
//         },
//         {
//           status: 400,
//         }
//       );
//     }

//     // ----------------------------------------------------
//     // 4. VERIFY RAZORPAY SIGNATURE
//     // ----------------------------------------------------

//     const expectedSignature =
//       crypto
//         .createHmac(
//           "sha256",
//           keySecret
//         )
//         .update(
//           `${razorpay_order_id}|${razorpay_payment_id}`
//         )
//         .digest("hex");

//     if (
//       expectedSignature !==
//       razorpay_signature
//     ) {
//       return NextResponse.json(
//         {
//           success: false,
//           message:
//             "Payment signature verification failed.",
//         },
//         {
//           status: 400,
//         }
//       );
//     }

//     // ----------------------------------------------------
//     // 5. CONNECT DATABASE
//     // ----------------------------------------------------

//     await connectDB();

//     // ----------------------------------------------------
//     // 6. PREVENT DUPLICATE ORDER
//     // ----------------------------------------------------

//     const existingOrder =
//       await Order.findOne({
//         paymentId:
//           razorpay_payment_id,
//       });

//     if (existingOrder) {
//       return NextResponse.json({
//         success: true,
//         order: existingOrder,
//         alreadyProcessed: true,
//       });
//     }

//     // ----------------------------------------------------
//     // 7. VALIDATE COUPON
//     // ----------------------------------------------------

//     const coupon =
//       await resolveCoupon(
//         email,
//         orderPayload.couponCode
//       );

//     if (coupon.error) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: coupon.error,
//         },
//         {
//           status: 400,
//         }
//       );
//     }

//     // ----------------------------------------------------
//     // 8. GET SERVER TOTAL
//     // ----------------------------------------------------
//     //
//     // The checkout route already calculates the real
//     // price from the database.
//     //
//     // We use the values returned in orderPayload here
//     // to keep this route compatible with your current
//     // frontend payment flow.
//     //
//     // UPI / Razorpay ONLY.
//     // ----------------------------------------------------

//     const subtotal =
//       Number(
//         orderPayload.subtotal
//       ) || 0;

//     const shipping =
//       Number(
//         orderPayload.shipping
//       ) || 0;

//     const discount =
//       Math.round(
//         (subtotal *
//           coupon.percent) /
//           100
//       );

//     const total =
//       Math.max(
//         0,
//         subtotal -
//           discount +
//           shipping
//       );

//     if (total <= 0) {
//       return NextResponse.json(
//         {
//           success: false,
//           message:
//             "Invalid order total.",
//         },
//         {
//           status: 400,
//         }
//       );
//     }

//     // ----------------------------------------------------
//     // 9. RESERVE STOCK
//     // ----------------------------------------------------

//     const {
//       decrementedItems,
//       outOfStockItems,
//     } =
//       await reserveStock(
//         orderPayload.items || []
//       );

//     if (
//       outOfStockItems.length > 0
//     ) {
//       await rollbackStock(
//         decrementedItems
//       );

//       return NextResponse.json(
//         {
//           success: false,
//           message:
//             "Some items in your cart are no longer in stock. Your payment may require refund processing.",
//           outOfStockItems,
//           paymentId:
//             razorpay_payment_id,
//         },
//         {
//           status: 409,
//         }
//       );
//     }

//     // ----------------------------------------------------
//     // 10. CREATE PAID ORDER
//     // ----------------------------------------------------

//     let order;

//     try {
//       order =
//         await Order.create({
//           ...orderPayload,

//           // NEVER trust browser email
//           email,

//           // NEVER allow COD from browser
//           paymentMethod:
//             "razorpay",

//           paymentStatus:
//             "Paid",

//           paymentId:
//             razorpay_payment_id,

//           gatewayOrderId:
//             razorpay_order_id,

//           couponCode:
//             coupon.code,

//           discount,

//           subtotal,

//           shipping,

//           total,

//           status:
//             "Processing",

//           // SHIPMOZO
//           courierName: "",
//           trackingNumber: "",
//           estimatedDelivery: "",
//           shipmozoOrderId: "",
//           shippingStatus:
//             "Pending",
//           trackingUrl: "",
//         });
//     } catch (orderError) {
//       // Restore stock if database order creation fails
//       await rollbackStock(
//         decrementedItems
//       );

//       throw orderError;
//     }

//     // ----------------------------------------------------
//     // 11. SEND CUSTOMER + ADMIN EMAILS
//     // ----------------------------------------------------

//     try {
//       await sendOrderConfirmation(
//         email,
//         orderPayload.fullName,
//         order._id.toString()
//       );

//       await sendAdminOrderNotification({
//         _id:
//           order._id.toString(),

//         fullName:
//           orderPayload.fullName,

//         email,

//         phone:
//           orderPayload.phone,

//         total,

//         // UPI / RAZORPAY ONLY
//         paymentMethod:
//           "razorpay",
//       });
//     } catch (emailError) {
//       console.error(
//         "Payment order email failed. Order still placed:",
//         emailError
//       );
//     }


//     try {
//       console.log(
//         "Sending Razorpay order to Shipmozo:",
//         order._id.toString()
//       );

//       const updatedOrder =
//         await processShipmozoOrder(
//           order
//         );

//       order =
//         updatedOrder;

//       console.log(
//         "Shipmozo processing completed:",
//         {
//           shipmozoOrderId:
//             order.shipmozoOrderId,

//           courierName:
//             order.courierName,

//           trackingNumber:
//             order.trackingNumber,

//           status:
//             order.status,
//         }
//       );
//     } catch (shipmozoError) {
//       console.error(
//         "Shipmozo processing failed. Paid order remains valid:",
//         shipmozoError
//       );
//     }

//     // ----------------------------------------------------
//     // 13. GET FINAL ORDER
//     // ----------------------------------------------------

//     const finalOrder =
//       (await Order.findById(
//         order._id
//       )) || order;

//     // ----------------------------------------------------
//     // 14. SUCCESS
//     // ----------------------------------------------------

//     return NextResponse.json({
//       success: true,
//       order: finalOrder,
//     });
//   } catch (error) {
//     console.error(
//       "Razorpay verification error:",
//       error
//     );

//     return NextResponse.json(
//       {
//         success: false,
//         message:
//           "Payment verification failed.",
//       },
//       {
//         status: 500,
//       }
//     );
//   }
// }

import crypto from "crypto";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
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

type CartItem = {
  _id: string;
  selectedVariant?: string;
  quantity: number;
  isCombo?: boolean;
};

function normalizeVariant(value?: string) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

function getComboVariantLabel(
  unitWeight: string,
  comboSize: number
) {
  return `${unitWeight} × ${comboSize} jars`;
}

/**
 * --------------------------------------------------------
 * COUPON VALIDATION
 * --------------------------------------------------------
 */
async function resolveCoupon(
  email: string,
  rawCode: string | undefined
) {
  const code = (rawCode || "").trim().toUpperCase();

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

  const alreadyUsed = await Order.findOne({
    email,
    couponCode: coupon.code,
    status: {
      $nin: ["Cancelled"],
    },
  });

  if (alreadyUsed) {
    return {
      code: "",
      percent: 0,
      error: `You've already used ${coupon.code} on a previous order.`,
    };
  }

  if (coupon.firstOrderOnly) {
    const anyPriorOrder = await Order.findOne({
      email,
      status: {
        $nin: ["Cancelled"],
      },
    });

    if (anyPriorOrder) {
      return {
        code: "",
        percent: 0,
        error: `${coupon.code} is only valid on your first order.`,
      };
    }
  }

  return {
    code: coupon.code,
    percent: Number(coupon.percent) || 0,
    error: null as string | null,
  };
}

/**
 * --------------------------------------------------------
 * RESERVE STOCK ATOMICALLY
 * --------------------------------------------------------
 *
 * IMPORTANT:
 * We detect combo from product.isCombo in MongoDB.
 * We do NOT depend on item.isCombo from the browser.
 */
async function reserveStock(items: CartItem[]) {
  const decrementedItems: CartItem[] = [];
  const outOfStockItems: string[] = [];

  for (const item of items || []) {
    if (!isValidObjectId(item._id)) {
      outOfStockItems.push(item._id);
      continue;
    }

    const quantity = Math.max(
      1,
      Math.floor(Number(item.quantity) || 1)
    );

    const product = await Product.findById(item._id).lean();

    if (!product) {
      outOfStockItems.push(item._id);
      continue;
    }

    let updatedProduct = null;

    // ====================================================
    // COMBO PRODUCT
    // ====================================================

    if (product.isCombo === true) {
      const comboSize = Number(product.comboSize || 2);

      // --------------------------------------------------
      // NEW SYSTEM: comboVariants
      // --------------------------------------------------

      if (
        Array.isArray(product.comboVariants) &&
        product.comboVariants.length > 0
      ) {
        if (!item.selectedVariant) {
          outOfStockItems.push(item._id);
          continue;
        }

        const selectedVariant = normalizeVariant(
          item.selectedVariant
        );

        const matchingVariant =
          product.comboVariants.find(
            (variant: any) => {
              const label = getComboVariantLabel(
                String(variant.unitWeight),
                comboSize
              );

              return (
                normalizeVariant(label) ===
                selectedVariant
              );
            }
          );

        if (!matchingVariant) {
          outOfStockItems.push(item._id);
          continue;
        }

        updatedProduct =
          await Product.findOneAndUpdate(
            {
              _id: item._id,
              isCombo: true,
              comboVariants: {
                $elemMatch: {
                  unitWeight:
                    matchingVariant.unitWeight,
                  stock: {
                    $gte: quantity,
                  },
                },
              },
            },
            {
              $inc: {
                "comboVariants.$[elem].stock":
                  -quantity,
              },
            },
            {
              arrayFilters: [
                {
                  "elem.unitWeight":
                    matchingVariant.unitWeight,
                  "elem.stock": {
                    $gte: quantity,
                  },
                },
              ],
              new: true,
            }
          );
      }

      // --------------------------------------------------
      // OLD FALLBACK SYSTEM: comboStock
      // --------------------------------------------------

      else {
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
      }
    }

    // ====================================================
    // NORMAL PRODUCT
    // ====================================================

    else {
      if (!item.selectedVariant) {
        outOfStockItems.push(item._id);
        continue;
      }

      updatedProduct =
        await Product.findOneAndUpdate(
          {
            _id: item._id,
            isCombo: {
              $ne: true,
            },
            weights: {
              $elemMatch: {
                size: item.selectedVariant,
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
                  item.selectedVariant,
                "elem.stock": {
                  $gte: quantity,
                },
              },
            ],
            new: true,
          }
        );
    }

    if (!updatedProduct) {
      outOfStockItems.push(item._id);
    } else {
      decrementedItems.push({
        ...item,
        quantity,
      });
    }
  }

  return {
    decrementedItems,
    outOfStockItems,
  };
}

/**
 * --------------------------------------------------------
 * ROLLBACK STOCK
 * --------------------------------------------------------
 */
async function rollbackStock(items: CartItem[]) {
  for (const item of items || []) {
    if (!isValidObjectId(item._id)) {
      continue;
    }

    const quantity = Math.max(
      1,
      Math.floor(Number(item.quantity) || 1)
    );

    const product = await Product.findById(item._id).lean();

    if (!product) {
      continue;
    }

    // ====================================================
    // COMBO
    // ====================================================

    if (product.isCombo === true) {
      const comboSize = Number(product.comboSize || 2);

      // NEW comboVariants system
      if (
        Array.isArray(product.comboVariants) &&
        product.comboVariants.length > 0
      ) {
        if (!item.selectedVariant) {
          continue;
        }

        const selectedVariant = normalizeVariant(
          item.selectedVariant
        );

        const matchingVariant =
          product.comboVariants.find(
            (variant: any) => {
              const label = getComboVariantLabel(
                String(variant.unitWeight),
                comboSize
              );

              return (
                normalizeVariant(label) ===
                selectedVariant
              );
            }
          );

        if (!matchingVariant) {
          continue;
        }

        await Product.updateOne(
          {
            _id: item._id,
            isCombo: true,
          },
          {
            $inc: {
              "comboVariants.$[elem].stock":
                quantity,
            },
          },
          {
            arrayFilters: [
              {
                "elem.unitWeight":
                  matchingVariant.unitWeight,
              },
            ],
          }
        );

        continue;
      }

      // OLD comboStock system
      await Product.updateOne(
        {
          _id: item._id,
          isCombo: true,
        },
        {
          $inc: {
            comboStock: quantity,
          },
        }
      );

      continue;
    }

    // ====================================================
    // NORMAL PRODUCT
    // ====================================================

    if (item.selectedVariant) {
      await Product.updateOne(
        {
          _id: item._id,
          isCombo: {
            $ne: true,
          },
          "weights.size":
            item.selectedVariant,
        },
        {
          $inc: {
            "weights.$.stock": quantity,
          },
        }
      );
    }
  }
}

/**
 * --------------------------------------------------------
 * POST
 * --------------------------------------------------------
 */
export async function POST(req: Request) {
  try {
    // ----------------------------------------------------
    // 1. REQUIRE LOGIN
    // ----------------------------------------------------

    const session =
      await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Please login before placing an order.",
        },
        {
          status: 401,
        }
      );
    }

    const email = session.user.email
      .trim()
      .toLowerCase();

    // ----------------------------------------------------
    // 2. RAZORPAY SECRET
    // ----------------------------------------------------

    const keySecret =
      process.env.RAZORPAY_KEY_SECRET;

    if (!keySecret) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Razorpay secret is not configured.",
        },
        {
          status: 500,
        }
      );
    }

    // ----------------------------------------------------
    // 3. READ REQUEST
    // ----------------------------------------------------

    const body = await req.json();

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderPayload,
    } = body;

    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature ||
      !orderPayload
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Missing payment verification details.",
        },
        {
          status: 400,
        }
      );
    }

    // ----------------------------------------------------
    // 4. VERIFY RAZORPAY SIGNATURE
    // ----------------------------------------------------

    const expectedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(
        `${razorpay_order_id}|${razorpay_payment_id}`
      )
      .digest("hex");

    if (
      expectedSignature !== razorpay_signature
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Payment signature verification failed.",
        },
        {
          status: 400,
        }
      );
    }

    // ----------------------------------------------------
    // 5. CONNECT DATABASE
    // ----------------------------------------------------

    await connectDB();

    // ----------------------------------------------------
    // 6. PREVENT DUPLICATE ORDER
    // ----------------------------------------------------

    const existingOrder =
      await Order.findOne({
        paymentId: razorpay_payment_id,
      });

   if (existingOrder) {
  // Order already exists and was successfully pushed
  if (existingOrder.shipmozoOrderId) {
    return NextResponse.json({
      success: true,
      order: existingOrder,
      alreadyProcessed: true,
    });
  }

  // Paid order exists but Shipmozo push failed earlier.
  // Retry Shipmozo instead of permanently ignoring it.
  try {
    console.log(
      "Retrying existing order in Shipmozo:",
      existingOrder._id.toString()
    );

    const updatedOrder =
      await processShipmozoOrder(existingOrder);

    return NextResponse.json({
      success: true,
      order: updatedOrder,
      alreadyProcessed: true,
      shipmozoRetried: true,
    });
  } catch (shipmozoError) {
    console.error(
      "Shipmozo retry failed:",
      shipmozoError
    );

    return NextResponse.json({
      success: true,
      order: existingOrder,
      alreadyProcessed: true,
      shipmozoRetried: false,
      shipmozoError:
        shipmozoError instanceof Error
          ? shipmozoError.message
          : "Shipmozo retry failed",
    });
  }
}

    // ----------------------------------------------------
    // 7. VALIDATE COUPON
    // ----------------------------------------------------

    const coupon = await resolveCoupon(
      email,
      orderPayload.couponCode
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

    // ----------------------------------------------------
    // 8. PRICING
    // ----------------------------------------------------

    const subtotal =
      Number(orderPayload.subtotal) || 0;

    const shipping =
      Number(orderPayload.shipping) || 0;

    const discount = Math.round(
      (subtotal * coupon.percent) / 100
    );

    const total = Math.max(
      0,
      subtotal - discount + shipping
    );

    if (total <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid order total.",
        },
        {
          status: 400,
        }
      );
    }

    // ----------------------------------------------------
    // 9. RESERVE STOCK
    // ----------------------------------------------------

    const {
      decrementedItems,
      outOfStockItems,
    } = await reserveStock(
      orderPayload.items || []
    );

    if (outOfStockItems.length > 0) {
      await rollbackStock(decrementedItems);

      return NextResponse.json(
        {
          success: false,
          message:
            "Some items in your cart are no longer in stock. Your payment may require refund processing.",
          outOfStockItems,
          paymentId: razorpay_payment_id,
        },
        {
          status: 409,
        }
      );
    }

    // ----------------------------------------------------
    // 10. CREATE PAID ORDER
    // ----------------------------------------------------

    let order;

    try {
      order = await Order.create({
        ...orderPayload,

        email,

        paymentMethod: "razorpay",
        paymentStatus: "Paid",

        paymentId: razorpay_payment_id,
        gatewayOrderId: razorpay_order_id,

        couponCode: coupon.code,

        discount,
        subtotal,
        shipping,
        total,

        status: "Processing",

        courierName: "",
        trackingNumber: "",
        estimatedDelivery: "",
        shipmozoOrderId: "",
        shippingStatus: "Pending",
        trackingUrl: "",
      });
    } catch (orderError) {
      await rollbackStock(decrementedItems);
      throw orderError;
    }

    // ----------------------------------------------------
    // 11. SEND EMAILS
    // ----------------------------------------------------

    try {
      await sendOrderConfirmation(
        email,
        orderPayload.fullName,
        order._id.toString()
      );

      await sendAdminOrderNotification({
        _id: order._id.toString(),
        fullName: orderPayload.fullName,
        email,
        phone: orderPayload.phone,
        total,
        paymentMethod: "razorpay",
      });
    } catch (emailError) {
      console.error(
        "Payment order email failed. Order still placed:",
        emailError
      );
    }

    // ----------------------------------------------------
    // 12. SEND TO SHIPMOZO
    // ----------------------------------------------------

    try {
      console.log(
        "Sending Razorpay order to Shipmozo:",
        order._id.toString()
      );

      const updatedOrder =
        await processShipmozoOrder(order);

      order = updatedOrder;

      console.log(
        "Shipmozo processing completed:",
        {
          shipmozoOrderId:
            order.shipmozoOrderId,
          courierName:
            order.courierName,
          trackingNumber:
            order.trackingNumber,
          status:
            order.status,
        }
      );
    } catch (shipmozoError) {
      console.error(
        "Shipmozo processing failed. Paid order remains valid:",
        shipmozoError
      );
    }

    // ----------------------------------------------------
    // 13. GET FINAL ORDER
    // ----------------------------------------------------

    const finalOrder =
      (await Order.findById(order._id)) ||
      order;

    // ----------------------------------------------------
    // 14. SUCCESS
    // ----------------------------------------------------

    return NextResponse.json({
      success: true,
      order: finalOrder,
    });
  } catch (error) {
    console.error(
      "Razorpay verification error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Payment verification failed.",
      },
      {
        status: 500,
      }
    );
  }
}