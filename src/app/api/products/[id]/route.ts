import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import mongoose from "mongoose";

import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/mongodb";
import Product from "@/models/Product";
import { sendBackInStockNotifications } from "@/lib/stockNotificationEmail";

/* =========================================================
   CONSTANTS
========================================================= */

const ALLOWED_SIZES = ["120g", "220g", "330g", "430g"];

const ALLOWED_COMBO_SIZES = [2, 3, 4];

const ALLOWED_COMBO_UNIT_WEIGHTS = [
  "120g",
  "220g",
  "330g",
  "430g",
];

const ALLOWED_ORIGIN = "https://www.achaaryaar.com";

/* =========================================================
   SLUG HELPERS
========================================================= */

function createSlug(text: string) {
  return String(text || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Creates a unique slug.
 *
 * excludeId is important when PATCHing an existing product.
 * Otherwise the product's own slug can cause "-2" to be created.
 */
async function createUniqueSlug(
  nameOrSlug: string,
  excludeId?: mongoose.Types.ObjectId | string
) {
  const baseSlug = createSlug(nameOrSlug);

  if (!baseSlug) {
    return "";
  }

  const query: any = {
    slug: baseSlug,
  };

  if (excludeId) {
    query._id = { $ne: excludeId };
  }

  const baseExists = await Product.exists(query);

  if (!baseExists) {
    return baseSlug;
  }

  let counter = 2;

  while (true) {
    const candidate = `${baseSlug}-${counter}`;

    const candidateQuery: any = {
      slug: candidate,
    };

    if (excludeId) {
      candidateQuery._id = { $ne: excludeId };
    }

    const exists = await Product.exists(candidateQuery);

    if (!exists) {
      return candidate;
    }

    counter++;
  }
}

/* =========================================================
   WEIGHT NORMALIZATION
========================================================= */

function normalizeWeights(weights: any[] = []) {
  const seen = new Set<string>();

  if (!Array.isArray(weights)) {
    return [];
  }

  return weights
    .map((weight) => {
      const rawSize =
        weight?.size ??
        weight?.quantity ??
        weight?.weight ??
        "";

      // Backward compatibility with old 500g products.
      const size =
        String(rawSize).trim() === "500g"
          ? "430g"
          : String(rawSize).trim();

      const price = Number(weight?.price);

      const stock = Number(weight?.stock ?? 0);

      return {
        size,
        price,
        stock: Number.isFinite(stock)
          ? Math.max(0, Math.floor(stock))
          : 0,
      };
    })
    .filter((weight) => {
      if (!ALLOWED_SIZES.includes(weight.size)) {
        return false;
      }

      if (
        !Number.isFinite(weight.price) ||
        weight.price <= 0
      ) {
        return false;
      }

      if (seen.has(weight.size)) {
        return false;
      }

      seen.add(weight.size);

      return true;
    });
}

/* =========================================================
   COMBO ITEM NORMALIZATION
========================================================= */

function normalizeComboItems(
  comboItems: any[] = [],
  comboSize: number
) {
  if (!Array.isArray(comboItems)) {
    return null;
  }

  const items = comboItems
    .filter(
      (item) =>
        item &&
        item.productId &&
        item.name
    )
    .map((item) => ({
      productId: String(item.productId),

      name: String(item.name),

      image:
        typeof item.image === "string"
          ? item.image
          : "",

      videos:
        Array.isArray(item.videos)
          ? item.videos.filter(
              (video: any) =>
                typeof video === "string" &&
                video.trim().length > 0
            )
          : [],

      quantity: Math.max(
        1,
        Number(item.quantity) || 1
      ),
    }));

  if (items.length !== comboSize) {
    return null;
  }

  return items;
}

/* =========================================================
   IMAGE NORMALIZATION
========================================================= */

function normalizeImages(
  images: any[] = [],
  fallbackCover?: string
) {
  const cleaned = (
    Array.isArray(images) ? images : []
  )
    .filter(
      (url) =>
        typeof url === "string" &&
        url.trim().length > 0
    )
    .map((url) => url.trim());

  const cover =
    typeof fallbackCover === "string"
      ? fallbackCover.trim()
      : "";

  if (
    cover &&
    !cleaned.includes(cover)
  ) {
    return [cover, ...cleaned];
  }

  return cleaned;
}

/* =========================================================
   VIDEO NORMALIZATION
========================================================= */

function normalizeVideos(videos: any[] = []) {
  if (!Array.isArray(videos)) {
    return [];
  }

  return videos
    .filter(
      (url) =>
        typeof url === "string" &&
        url.trim().length > 0
    )
    .map((url) => url.trim());
}

/* =========================================================
   ADMIN CHECK
========================================================= */

async function requireAdmin() {
  const session =
    await getServerSession(authOptions);

  const role = (
    session?.user as
      | { role?: string }
      | undefined
  )?.role;

  return role === "admin";
}

/* =========================================================
   PRODUCT LOOKUP
   Supports:
   1. MongoDB ObjectId
   2. Saved slug
   3. Legacy products without slug
   4. Unique partial legacy slug
========================================================= */

async function findProductByIdOrSlug(
  idOrSlug: string,
  lean = false
) {
  const cleanValue = decodeURIComponent(
    idOrSlug
  ).trim();

  /* -------------------------------------------------------
     1. MongoDB ID
  ------------------------------------------------------- */

  if (
    mongoose.Types.ObjectId.isValid(
      cleanValue
    )
  ) {
    const byId = Product.findById(
      cleanValue
    );

    if (lean) {
      const result = await byId.lean();

      if (result) {
        return result;
      }
    } else {
      const result = await byId;

      if (result) {
        return result;
      }
    }
  }

  /* -------------------------------------------------------
     2. Exact saved slug
  ------------------------------------------------------- */

  const exactSlugQuery =
    Product.findOne({
      slug: cleanValue,
    });

  if (lean) {
    const result =
      await exactSlugQuery.lean();

    if (result) {
      return result;
    }
  } else {
    const result =
      await exactSlugQuery;

    if (result) {
      return result;
    }
  }

  /* -------------------------------------------------------
     3. Legacy products without slug
  ------------------------------------------------------- */

  const legacyProducts =
    await Product.find({
      $or: [
        {
          slug: {
            $exists: false,
          },
        },
        {
          slug: "",
        },
        {
          slug: null,
        },
      ],
    })
      .select(
        "_id name slug description shortDescription category image images videos weights isCombo comboSize comboUnitWeight comboVariants comboItems comboPrice comboStock featured rating reviewsCount createdAt updatedAt"
      )
      .lean();

  const exactGeneratedMatches =
    legacyProducts.filter(
      (product: any) =>
        product.name &&
        createSlug(
          String(product.name)
        ) === cleanValue
    );

  if (
    exactGeneratedMatches.length === 1
  ) {
    const product =
      exactGeneratedMatches[0];

    const generatedSlug = createSlug(
      String(product.name)
    );

    const slugExists =
      await Product.exists({
        slug: generatedSlug,
        _id: {
          $ne: product._id,
        },
      });

    const finalSlug = slugExists
      ? await createUniqueSlug(
          String(product.name),
          product._id
        )
      : generatedSlug;

    await Product.findByIdAndUpdate(
      product._id,
      {
        $set: {
          slug: finalSlug,
        },
      }
    );

    return {
      ...product,
      slug: finalSlug,
    };
  }

  /* -------------------------------------------------------
     4. Legacy shortened slug

     This specifically helps old products such as:

     Full product name:
     Achaar Yaar Special – Kathal ka Achaar,
     Shahi Meetha Aam, Bharwa Mircha Achaar
     and Aam ka Achaar - 4 Jar Combo

     Requested:
     achaar-yaar-special-kathal-ka-achaar

     If exactly ONE legacy product starts with the
     requested slug, use it and permanently save the
     requested slug.
  ------------------------------------------------------- */

  const partialMatches =
    legacyProducts.filter(
      (product: any) => {
        if (!product.name) {
          return false;
        }

        const generatedSlug =
          createSlug(
            String(product.name)
          );

        return (
          generatedSlug.startsWith(
            `${cleanValue}-`
          ) ||
          generatedSlug === cleanValue
        );
      }
    );

  if (partialMatches.length === 1) {
    const product =
      partialMatches[0];

    const requestedSlug =
      createSlug(cleanValue);

    const slugExists =
      await Product.exists({
        slug: requestedSlug,
        _id: {
          $ne: product._id,
        },
      });

    if (!slugExists) {
      await Product.findByIdAndUpdate(
        product._id,
        {
          $set: {
            slug: requestedSlug,
          },
        }
      );

      return {
        ...product,
        slug: requestedSlug,
      };
    }

    const uniqueSlug =
      await createUniqueSlug(
        String(product.name),
        product._id
      );

    await Product.findByIdAndUpdate(
      product._id,
      {
        $set: {
          slug: uniqueSlug,
        },
      }
    );

    return {
      ...product,
      slug: uniqueSlug,
    };
  }

  return null;
}

/* =========================================================
   DETECT COMBO
========================================================= */

function isComboProduct(product: any) {
  return (
    product?.isCombo === true ||
    (
      Array.isArray(product?.comboItems) &&
      product.comboItems.length > 0
    ) ||
    (
      Array.isArray(
        product?.comboVariants
      ) &&
      product.comboVariants.length > 0
    ) ||
    (
      Number.isFinite(
        Number(product?.comboPrice)
      ) &&
      Number(product?.comboPrice) > 0
    )
  );
}

/* =========================================================
   STOCK MAP
========================================================= */

function getStockMap(product: any) {
  const stockMap =
    new Map<string, number>();

  const isCombo =
    isComboProduct(product);

  /* -------------------------------------------------------
     NORMAL PRODUCT
  ------------------------------------------------------- */

  if (!isCombo) {
    for (
      const weight of
      product?.weights || []
    ) {
      const size = String(
        weight?.size ??
          weight?.quantity ??
          weight?.weight ??
          ""
      ).trim();

      if (!size) {
        continue;
      }

      const stock = Number(
        weight?.stock ?? 0
      );

      stockMap.set(
        size,
        Number.isFinite(stock)
          ? Math.max(0, stock)
          : 0
      );
    }

    return stockMap;
  }

  /* -------------------------------------------------------
     NEW COMBO VARIANTS
  ------------------------------------------------------- */

  if (
    Array.isArray(
      product?.comboVariants
    ) &&
    product.comboVariants.length > 0
  ) {
    const comboSize =
      Number(product?.comboSize) || 2;

    for (
      const variant of
      product.comboVariants
    ) {
      const unitWeight =
        String(
          variant?.unitWeight || ""
        ).trim();

      if (!unitWeight) {
        continue;
      }

      const label =
        `${unitWeight} × ${comboSize} jars`;

      const stock = Number(
        variant?.stock ?? 0
      );

      stockMap.set(
        label,
        Number.isFinite(stock)
          ? Math.max(0, stock)
          : 0
      );
    }

    return stockMap;
  }

  /* -------------------------------------------------------
     LEGACY COMBO FORMAT
  ------------------------------------------------------- */

  const comboSize =
    Number(product?.comboSize) || 2;

  const label =
    product?.comboUnitWeight
      ? `${product.comboUnitWeight} × ${comboSize} jars`
      : `${comboSize}-Pack Combo`;

  const comboStock = Number(
    product?.comboStock ?? 0
  );

  stockMap.set(
    label,
    Number.isFinite(comboStock)
      ? Math.max(0, comboStock)
      : 0
  );

  return stockMap;
}

/* =========================================================
   BACK-IN-STOCK NOTIFICATIONS
========================================================= */

async function notifyVariantsThatCameBackInStock(
  oldProduct: any,
  updatedProduct: any
) {
  const oldStockMap =
    getStockMap(oldProduct);

  const newStockMap =
    getStockMap(updatedProduct);

  for (
    const [
      variant,
      newStock,
    ] of newStockMap.entries()
  ) {
    const oldStock =
      oldStockMap.get(variant) || 0;

    /* -----------------------------------------------------
       Only notify:

       OLD = 0
       NEW > 0
    ----------------------------------------------------- */

    if (
      oldStock <= 0 &&
      newStock > 0
    ) {
      try {
        await sendBackInStockNotifications(
          {
            productId: String(
              updatedProduct._id
            ),

            productName:
              updatedProduct.name,

            variant,
          }
        );

        console.log(
          `Back-in-stock notification sent: ${updatedProduct.name} - ${variant}`
        );
      } catch (error) {
        console.error(
          `Back-in-stock notification failed for ${variant}:`,
          error
        );
      }
    }
  }
}

/* =========================================================
   GET SINGLE PRODUCT
   PUBLIC

   Supports:

   /api/products/mongodb-id
   /api/products/product-slug
========================================================= */

export async function GET(
  req: Request,
  context: {
    params: Promise<{
      id: string;
    }>;
  }
) {
  try {
    await connectDB();

    const { id } =
      await context.params;

    const cleanId =
      decodeURIComponent(id).trim();

    if (!cleanId) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Product identifier is required",
        },
        {
          status: 400,
        }
      );
    }

    const product =
      await findProductByIdOrSlug(
        cleanId,
        true
      );

    if (!product) {
      return NextResponse.json(
        {
          success: false,
          message: "Product not found",
        },
        {
          status: 404,
        }
      );
    }

    const combo =
      isComboProduct(product);

    return NextResponse.json(
      {
        success: true,

        product: {
          ...product,

          isCombo: combo,

          weights: combo
            ? []
            : normalizeWeights(
                product.weights
              ),

          comboVariants:
            Array.isArray(
              product.comboVariants
            )
              ? product.comboVariants
              : [],

          comboItems:
            Array.isArray(
              product.comboItems
            )
              ? product.comboItems
              : [],

          videos:
            normalizeVideos(
              product.videos
            ),
        },
      },
      {
        headers: {
          "Cache-Control":
            "public, s-maxage=60, stale-while-revalidate=300",

          "Access-Control-Allow-Origin":
            ALLOWED_ORIGIN,
        },
      }
    );
  } catch (error) {
    console.error(
      "GET PRODUCT ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to fetch product",
      },
      {
        status: 500,
        headers: {
          "Access-Control-Allow-Origin":
            ALLOWED_ORIGIN,
        },
      }
    );
  }
}

/* =========================================================
   PATCH PRODUCT
   ADMIN ONLY
========================================================= */

export async function PATCH(
  req: Request,
  context: {
    params: Promise<{
      id: string;
    }>;
  }
) {
  try {
    /* -----------------------------------------------------
       ADMIN PROTECTION
    ----------------------------------------------------- */

    if (!(await requireAdmin())) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        {
          status: 401,
          headers: {
            "Access-Control-Allow-Origin":
              ALLOWED_ORIGIN,
          },
        }
      );
    }

    await connectDB();

    const { id } =
      await context.params;

    const cleanId =
      decodeURIComponent(id).trim();

    if (!cleanId) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Product identifier is required",
        },
        {
          status: 400,
          headers: {
            "Access-Control-Allow-Origin":
              ALLOWED_ORIGIN,
          },
        }
      );
    }

    const body = await req.json();

    /* -----------------------------------------------------
       FIND EXISTING PRODUCT
    ----------------------------------------------------- */

    const existingProduct =
      await findProductByIdOrSlug(
        cleanId,
        true
      );

    if (!existingProduct) {
      return NextResponse.json(
        {
          success: false,
          message: "Product not found",
        },
        {
          status: 404,
          headers: {
            "Access-Control-Allow-Origin":
              ALLOWED_ORIGIN,
          },
        }
      );
    }

    /* -----------------------------------------------------
       PRODUCT NAME

       PATCH normally receives the complete product,
       but we also preserve the old name if omitted.
    ----------------------------------------------------- */

    const name =
      typeof body.name === "string" &&
      body.name.trim()
        ? body.name.trim()
        : String(
            existingProduct.name || ""
          ).trim();

    if (!name) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Product name is required",
        },
        {
          status: 400,
          headers: {
            "Access-Control-Allow-Origin":
              ALLOWED_ORIGIN,
          },
        }
      );
    }

    /* -----------------------------------------------------
       IMAGES
    ----------------------------------------------------- */

    const hasImagesField =
      Object.prototype.hasOwnProperty.call(
        body,
        "images"
      );

    const hasImageField =
      Object.prototype.hasOwnProperty.call(
        body,
        "image"
      );

    let images: string[];

    if (
      hasImagesField ||
      hasImageField
    ) {
      images = normalizeImages(
        body.images,
        body.image
      );

      if (images.length === 0) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Keep at least one product photo",
          },
          {
            status: 400,
            headers: {
              "Access-Control-Allow-Origin":
                ALLOWED_ORIGIN,
            },
          }
        );
      }
    } else {
      images =
        normalizeImages(
          existingProduct.images,
          existingProduct.image
        );
    }

    /* -----------------------------------------------------
       VIDEOS
    ----------------------------------------------------- */

    const videos =
      Object.prototype.hasOwnProperty.call(
        body,
        "videos"
      )
        ? normalizeVideos(
            body.videos
          )
        : normalizeVideos(
            existingProduct.videos
          );

    /* -----------------------------------------------------
       COMBO STATUS

       If isCombo is explicitly supplied, use it.
       Otherwise preserve the existing type.
    ----------------------------------------------------- */

    const isCombo =
      typeof body.isCombo === "boolean"
        ? body.isCombo
        : isComboProduct(
            existingProduct
          );

    /* -----------------------------------------------------
       SLUG

       Priority:

       1. Explicit body.slug
       2. Existing slug
       3. Generate from product name

       This is what fixes your product.
    ----------------------------------------------------- */

    const existingSlug =
      String(
        existingProduct.slug || ""
      ).trim();

    const requestedSlug =
      typeof body.slug === "string"
        ? createSlug(body.slug)
        : "";

    let slug =
      requestedSlug ||
      existingSlug;

    if (!slug) {
      slug =
        await createUniqueSlug(
          name,
          existingProduct._id
        );
    } else {
      const slugOwner =
        await Product.findOne({
          slug,
          _id: {
            $ne: existingProduct._id,
          },
        })
          .select("_id")
          .lean();

      if (slugOwner) {
        return NextResponse.json(
          {
            success: false,
            message:
              `Slug "${slug}" is already used by another product`,
          },
          {
            status: 409,
            headers: {
              "Access-Control-Allow-Origin":
                ALLOWED_ORIGIN,
            },
          }
        );
      }
    }

    if (!slug) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Could not create product slug",
        },
        {
          status: 400,
          headers: {
            "Access-Control-Allow-Origin":
              ALLOWED_ORIGIN,
          },
        }
      );
    }

    /* -----------------------------------------------------
       NORMAL PRODUCT VARIANTS
    ----------------------------------------------------- */

    let normalizedWeights: any[] = [];

    if (isCombo) {
      normalizedWeights = [];
    } else {
      const weightsInput =
        Object.prototype.hasOwnProperty.call(
          body,
          "weights"
        )
          ? body.weights
          : existingProduct.weights;

      normalizedWeights =
        normalizeWeights(
          weightsInput
        );

      if (
        normalizedWeights.length === 0
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Add at least one valid variant: 120g, 220g, 330g, or 430g",
          },
          {
            status: 400,
            headers: {
              "Access-Control-Allow-Origin":
                ALLOWED_ORIGIN,
            },
          }
        );
      }
    }

    /* =====================================================
       COMBO DATA
    ===================================================== */

    let comboSize:
      | number
      | undefined;

    let comboVariants: any[] = [];

    let comboItems:
      | any[]
      | undefined;

    let comboUnitWeight:
      | string
      | undefined;

    let comboPrice:
      | number
      | undefined;

    let comboStock:
      | number
      | undefined;

    if (isCombo) {
      /* ---------------------------------------------------
         COMBO SIZE
      --------------------------------------------------- */

      const requestedComboSize =
        Object.prototype.hasOwnProperty.call(
          body,
          "comboSize"
        )
          ? Number(body.comboSize)
          : Number(
              existingProduct.comboSize
            );

      if (
        !ALLOWED_COMBO_SIZES.includes(
          requestedComboSize
        )
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Combo size must be 2, 3, or 4",
          },
          {
            status: 400,
            headers: {
              "Access-Control-Allow-Origin":
                ALLOWED_ORIGIN,
            },
          }
        );
      }

      comboSize =
        requestedComboSize;

      /* ---------------------------------------------------
         COMBO ITEMS
      --------------------------------------------------- */

      if (
        Object.prototype.hasOwnProperty.call(
          body,
          "comboItems"
        )
      ) {
        comboItems =
          normalizeComboItems(
            body.comboItems,
            comboSize
          ) || undefined;

        if (!comboItems) {
          return NextResponse.json(
            {
              success: false,
              message:
                `Select exactly ${comboSize} products for this combo`,
            },
            {
              status: 400,
              headers: {
                "Access-Control-Allow-Origin":
                  ALLOWED_ORIGIN,
              },
            }
          );
        }
      } else {
        comboItems =
          Array.isArray(
            existingProduct.comboItems
          )
            ? existingProduct.comboItems
            : [];
      }

      /* ---------------------------------------------------
         COMBO VARIANTS

         New format:

         comboVariants: [
           {
             unitWeight: "120g",
             price: 489,
             stock: 14
           }
         ]
      --------------------------------------------------- */

      let rawComboVariants: any[];

      if (
        Object.prototype.hasOwnProperty.call(
          body,
          "comboVariants"
        )
      ) {
        rawComboVariants =
          Array.isArray(
            body.comboVariants
          )
            ? body.comboVariants
            : [];
      } else if (
        Array.isArray(
          existingProduct.comboVariants
        ) &&
        existingProduct.comboVariants
          .length > 0
      ) {
        rawComboVariants =
          existingProduct.comboVariants;
      } else {
        /* -------------------------------------------------
           Convert old combo format into new format.
        ------------------------------------------------- */

        const oldUnitWeight =
          String(
            body.comboUnitWeight ??
              existingProduct.comboUnitWeight ??
              ""
          ).trim();

        const oldPrice =
          Number(
            body.comboPrice ??
              existingProduct.comboPrice
          );

        const oldStock =
          Number(
            body.comboStock ??
              existingProduct.comboStock ??
              0
          );

        rawComboVariants =
          oldUnitWeight &&
          Number.isFinite(oldPrice) &&
          oldPrice > 0
            ? [
                {
                  unitWeight:
                    oldUnitWeight,
                  price: oldPrice,
                  stock: oldStock,
                },
              ]
            : [];
      }

      /* ---------------------------------------------------
         NORMALIZE COMBO VARIANTS
      --------------------------------------------------- */

      const normalizedComboVariants =
        rawComboVariants
          .map((variant: any) => {
            const unitWeight =
              String(
                variant?.unitWeight ||
                  ""
              ).trim();

            const price =
              Number(
                variant?.price
              );

            const stock =
              Number(
                variant?.stock ?? 0
              );

            return {
              unitWeight,
              price,
              stock,
            };
          })
          .filter(
            (variant: any) =>
              ALLOWED_COMBO_UNIT_WEIGHTS.includes(
                variant.unitWeight
              ) &&
              Number.isFinite(
                variant.price
              ) &&
              variant.price > 0 &&
              Number.isFinite(
                variant.stock
              ) &&
              variant.stock >= 0
          )
          .map(
            (variant: any) => ({
              unitWeight:
                variant.unitWeight,

              price:
                variant.price,

              stock: Math.max(
                0,
                Math.floor(
                  variant.stock
                )
              ),
            })
          );

      /* ---------------------------------------------------
         REMOVE DUPLICATE WEIGHTS
      --------------------------------------------------- */

      const seenComboWeights =
        new Set<string>();

      comboVariants =
        normalizedComboVariants.filter(
          (variant: any) => {
            if (
              seenComboWeights.has(
                variant.unitWeight
              )
            ) {
              return false;
            }

            seenComboWeights.add(
              variant.unitWeight
            );

            return true;
          }
        );

      if (
        comboVariants.length === 0
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Enter at least one valid combo variant",
          },
          {
            status: 400,
            headers: {
              "Access-Control-Allow-Origin":
                ALLOWED_ORIGIN,
            },
          }
        );
      }

      /* ---------------------------------------------------
         LEGACY FIELDS

         Keep these synchronized with the first variant
         for backward compatibility.
      --------------------------------------------------- */

      comboUnitWeight =
        comboVariants[0]
          ?.unitWeight;

      comboPrice =
        comboVariants[0]
          ?.price;

      comboStock =
        comboVariants[0]
          ?.stock ?? 0;
    }

    /* =====================================================
       BUILD UPDATE
    ===================================================== */

    const updateData: any = {
      name,

      slug,

      description:
        typeof body.description ===
        "string"
          ? body.description
          : existingProduct.description,

      shortDescription:
        typeof body.shortDescription ===
        "string"
          ? body.shortDescription
          : existingProduct.shortDescription ||
            "",

      category:
        typeof body.category ===
        "string"
          ? body.category
          : existingProduct.category,

      image: images[0],

      images,

      videos,

      featured:
        typeof body.featured ===
        "boolean"
          ? body.featured
          : Boolean(
              existingProduct.featured
            ),

      isCombo,

      weights:
        isCombo
          ? []
          : normalizedWeights,
    };

    /* =====================================================
       COMBO UPDATE
    ===================================================== */

    if (isCombo) {
      updateData.comboSize =
        comboSize;

      updateData.comboVariants =
        comboVariants;

      updateData.comboItems =
        comboItems || [];

      updateData.comboUnitWeight =
        comboUnitWeight;

      updateData.comboPrice =
        comboPrice;

      updateData.comboStock =
        comboStock;
    } else {
      /* ---------------------------------------------------
         Clear combo fields when converting a combo
         back into a normal product.
      --------------------------------------------------- */

      updateData.comboSize =
        undefined;

      updateData.comboUnitWeight =
        undefined;

      updateData.comboVariants =
        [];

      updateData.comboItems =
        [];

      updateData.comboPrice =
        undefined;

      updateData.comboStock =
        undefined;
    }

    /* =====================================================
       UPDATE DATABASE
    ===================================================== */

    const updatedProduct =
      await Product.findByIdAndUpdate(
        existingProduct._id,
        {
          $set: updateData,

          $unset: !isCombo
            ? {
                comboSize: "",
                comboUnitWeight: "",
                comboPrice: "",
                comboStock: "",
              }
            : {},
        },
        {
          new: true,
          runValidators: true,
        }
      );

    if (!updatedProduct) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Failed to update product",
        },
        {
          status: 500,
          headers: {
            "Access-Control-Allow-Origin":
              ALLOWED_ORIGIN,
          },
        }
      );
    }

    /* =====================================================
       BACK-IN-STOCK NOTIFICATIONS
    ===================================================== */

    await notifyVariantsThatCameBackInStock(
      existingProduct,
      updatedProduct.toObject()
    );

    /* =====================================================
       RESPONSE
    ===================================================== */

    return NextResponse.json(
      {
        success: true,
        product:
          updatedProduct.toObject(),
      },
      {
        headers: {
          "Access-Control-Allow-Origin":
            ALLOWED_ORIGIN,
        },
      }
    );
  } catch (error) {
    console.error(
      "PATCH /api/products/[id] error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to update product",
      },
      {
        status: 500,
        headers: {
          "Access-Control-Allow-Origin":
            ALLOWED_ORIGIN,
        },
      }
    );
  }
}

/* =========================================================
   DELETE PRODUCT
   ADMIN ONLY
========================================================= */

export async function DELETE(
  req: Request,
  context: {
    params: Promise<{
      id: string;
    }>;
  }
) {
  try {
    /* -----------------------------------------------------
       ADMIN PROTECTION
    ----------------------------------------------------- */

    if (!(await requireAdmin())) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        {
          status: 401,
          headers: {
            "Access-Control-Allow-Origin":
              ALLOWED_ORIGIN,
          },
        }
      );
    }

    await connectDB();

    const { id } =
      await context.params;

    const cleanId =
      decodeURIComponent(id).trim();

    if (!cleanId) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Product identifier is required",
        },
        {
          status: 400,
          headers: {
            "Access-Control-Allow-Origin":
              ALLOWED_ORIGIN,
          },
        }
      );
    }

    /* -----------------------------------------------------
       FIND PRODUCT BY ID OR SLUG
    ----------------------------------------------------- */

    const product =
      await findProductByIdOrSlug(
        cleanId,
        false
      );

    if (!product) {
      return NextResponse.json(
        {
          success: false,
          message: "Product not found",
        },
        {
          status: 404,
          headers: {
            "Access-Control-Allow-Origin":
              ALLOWED_ORIGIN,
          },
        }
      );
    }

    /* -----------------------------------------------------
       DELETE USING REAL MONGODB ID
    ----------------------------------------------------- */

    await Product.findByIdAndDelete(
      product._id
    );

    return NextResponse.json(
      {
        success: true,
        message:
          "Product deleted successfully",
      },
      {
        headers: {
          "Access-Control-Allow-Origin":
            ALLOWED_ORIGIN,
        },
      }
    );
  } catch (error) {
    console.error(
      "DELETE /api/products/[id] error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to delete product",
      },
      {
        status: 500,
        headers: {
          "Access-Control-Allow-Origin":
            ALLOWED_ORIGIN,
        },
      }
    );
  }
}

/* =========================================================
   OPTIONS / CORS
========================================================= */

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,

    headers: {
      "Access-Control-Allow-Origin":
        ALLOWED_ORIGIN,

      "Access-Control-Allow-Methods":
        "GET, PATCH, DELETE, OPTIONS",

      "Access-Control-Allow-Headers":
        "Content-Type, Authorization",
    },
  });
}