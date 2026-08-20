// import mongoose, { Schema, models, model } from "mongoose";

// const ComboItemSchema = new Schema(
//   {
//     productId: {
//       type: Schema.Types.ObjectId,
//       ref: "Product",
//       required: true,
//     },
//     name: {
//       type: String,
//       required: true,
//     },
//     image: {
//       type: String,
//     },
//     videos: {
//   type: [String],
//   default: [],
// },
//     quantity: {
//       type: Number,
//       default: 1,
//       min: 1,
//     },
//   },
//   { _id: false }
// );

// const ProductSchema = new Schema(
//   {
//     name: {
//       type: String,
//       required: true,
//     },

//     description: {
//       type: String,
//       required: true,
//     },
//     shortDescription: {
//       type: String,
//       required: false,
//     },

//     category: {
//       type: String,
//       required: true,
//     },

//     // Cover image — kept for anything that still expects a single image
//     // (e.g. combo item previews, cart line items).
//     image: {
//       type: String,
//       required: true,
//     },

//     // Full photo set for the product's swipeable gallery. Falls back to
//     // just [image] on the frontend for any product saved before this field
//     // existed, so it's optional here rather than required.
//     images: {
//       type: [String],
//       default: [],
//     },

//     weights: [
//       {
//         size: {
//           type: String,
//           enum: ["120g", "220g", "330g", "430g"],
//           required: true,
//         },

//         price: {
//           type: Number,
//           required: true,
//         },

//         stock: {
//           type: Number,
//           default: 0,
//         },
//       },
//     ],

//     // Combo pack support — a combo is a product made of other fixed
//     // products bundled at one price (e.g. "3-pack combo").
//     // When isCombo is true, `weights` is not used; comboPrice/comboStock
//     // and comboItems drive pricing, stock and contents instead.
//     isCombo: {
//       type: Boolean,
//       default: false,
//     },

//     comboSize: {
//       type: Number,
//       enum: [2,  4],
//     },

//     comboUnitWeight: {
//       type: String,
//       // A combo can use any of the jar sizes sold on the site.  Keeping this
//       // optional also preserves older combo records that were created before
//       // the per-jar-size field existed.
//       enum: ["120g", "220g", "330g", "430g"],
//     },
// comboVariants: {
//       type: [
//         {
//           unitWeight: {
//             type: String,
//             enum: ["120g", "220g", "330g", "430g"],
//             required: true,
//           },
//           price: {
//             type: Number,
//             required: true,
//           },
//           stock: {
//             type: Number,
//             default: 0,
//           },
//         },
//       ],
//       default: undefined,
//     },
//     comboItems: {
//       type: [ComboItemSchema],
//       default: undefined,
//     },

//     comboPrice: {
//       type: Number,
//     },

//     comboStock: {
//       type: Number,
//       default: 0,
//     },

//     featured: {
//       type: Boolean,
//       default: false,
//     },

//     rating: {
//       type: Number,
//       default: 0,
//     },

//     reviewsCount: {
//       type: Number,
//       default: 0,
//     },
//   },
//   {
//     timestamps: true,
//   }
// );

// const Product =
//   models.Product || model("Product", ProductSchema);

// export default Product;

import mongoose, { Schema, models, model } from "mongoose";

const ComboItemSchema = new Schema(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    name: {
      type: String,
      required: true,
    },

    image: {
      type: String,
    },

    videos: {
      type: [String],
      default: [],
    },

    quantity: {
      type: Number,
      default: 1,
      min: 1,
    },
  },
  { _id: false }
);

const ComboVariantSchema = new Schema(
  {
    unitWeight: {
      type: String,
      enum: ["120g", "220g", "330g", "430g"],
      required: true,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    stock: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { _id: false }
);

const ProductSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },

    description: {
      type: String,
      required: true,
    },

    shortDescription: {
      type: String,
      required: false,
    },

    category: {
      type: String,
      required: true,
    },

    // Main cover image
    image: {
      type: String,
      required: true,
    },

    // All product images
    images: {
      type: [String],
      default: [],
    },

    // Product videos
    videos: {
      type: [String],
      default: [],
    },

    // Normal product variants
    weights: [
      {
        size: {
          type: String,
          enum: ["120g", "220g", "330g", "430g"],
          required: true,
        },

        price: {
          type: Number,
          required: true,
          min: 0,
        },

        stock: {
          type: Number,
          default: 0,
          min: 0,
        },
      },
    ],

    // ================= COMBO =================

    isCombo: {
      type: Boolean,
      default: false,
    },

    // Supports 2, 3 and 4 jar combos
    comboSize: {
      type: Number,
      enum: [2, 3, 4],
    },

    // Old legacy combo unit weight
    comboUnitWeight: {
      type: String,
      enum: ["120g", "220g", "330g", "430g"],
    },

    // New combo variants
    comboVariants: {
      type: [ComboVariantSchema],
      default: [],
    },

    // Products included in combo
    comboItems: {
      type: [ComboItemSchema],
      default: [],
    },

    // Legacy fields for backward compatibility
    comboPrice: {
      type: Number,
      min: 0,
    },

    comboStock: {
      type: Number,
      default: 0,
      min: 0,
    },

    // ================= OTHER =================

    featured: {
      type: Boolean,
      default: false,
    },

    rating: {
      type: Number,
      default: 0,
    },

    reviewsCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const Product =
  models.Product || model("Product", ProductSchema);

export default Product;