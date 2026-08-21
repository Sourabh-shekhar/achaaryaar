// const SHIPMOZO_BASE_URL =
//   "https://shipping-api.com/app/api/v1";

// interface ShipmozoResponse {
//   result: string | number;
//   message: string;
//   data?: any;
// }

// interface CartonProfile {
//   code: string;
//   capacity: number;
//   length: number;
//   width: number;
//   height: number;
//   exactType?: string;
// }

// /*
// |--------------------------------------------------------------------------
// | CARTON PROFILES
// |--------------------------------------------------------------------------
// |
// | Dimensions = inches
// | Packed shipping weight/capacity = grams
// |
// | 120g x 2       -> 6 x 4 x 3.5
// | 120g x 4       -> 6 x 6 x 6
// | 220g single    -> 4 x 4 x 4
// | 220g x 2       -> 7 x 4 x 3.5
// | 330g single    -> 5 x 5 x 5
// | 330g x 2       -> 8 x 6 x 6
// | 430g single    -> 6 x 4 x 3.5
// |--------------------------------------------------------------------------
// */

// const CARTONS: CartonProfile[] = [
//   {
//     code: "120_DOUBLE",
//     capacity: 450,
//     length: 6,
//     width: 4,
//     height: 3.5,
//     exactType: "120_DOUBLE",
//   },
//   {
//     code: "120_FOUR",
//     capacity: 700,
//     length: 6,
//     width: 6,
//     height: 6,
//     exactType: "120_FOUR",
//   },
//   {
//     code: "220_SINGLE",
//     capacity: 400,
//     length: 4,
//     width: 4,
//     height: 4,
//     exactType: "220_SINGLE",
//   },
//   {
//     code: "220_DOUBLE",
//     capacity: 600,
//     length: 7,
//     width: 4,
//     height: 3.5,
//     exactType: "220_DOUBLE",
//   },
//   {
//     code: "330_SINGLE",
//     capacity: 450,
//     length: 5,
//     width: 5,
//     height: 5,
//     exactType: "330_SINGLE",
//   },
//   {
//     code: "330_DOUBLE",
//     capacity: 800,
//     length: 8,
//     width: 6,
//     height: 6,
//     exactType: "330_DOUBLE",
//   },
//   {
//     code: "430_SINGLE",
//     capacity: 600,
//     length: 6,
//     width: 4,
//     height: 3.5,
//     exactType: "430_SINGLE",
//   },
// ];

// /*
// |--------------------------------------------------------------------------
// | MIXED CARTONS
// |--------------------------------------------------------------------------
// */

// const MIXED_CARTONS: CartonProfile[] = [];

// /*
// |--------------------------------------------------------------------------
// | AUTHENTICATION
// |--------------------------------------------------------------------------
// */

// function getHeaders() {
//   const publicKey = process.env.SHIPMOZO_PUBLIC_KEY;
//   const privateKey = process.env.SHIPMOZO_PRIVATE_KEY;

//   if (!publicKey) {
//     throw new Error("SHIPMOZO_PUBLIC_KEY is missing");
//   }

//   if (!privateKey) {
//     throw new Error("SHIPMOZO_PRIVATE_KEY is missing");
//   }

//   return {
//     "Content-Type": "application/json",
//     "public-key": publicKey,
//     "private-key": privateKey,
//   };
// }

// /*
// |--------------------------------------------------------------------------
// | RESPONSE PARSER
// |--------------------------------------------------------------------------
// */

// async function parseResponse(
//   response: Response
// ): Promise<ShipmozoResponse> {
//   const text = await response.text();

//   console.log("=================================");
//   console.log("SHIPMOZO RESPONSE STATUS:", response.status);
//   console.log("SHIPMOZO RESPONSE TEXT:", text);
//   console.log("=================================");

//   let data: ShipmozoResponse;

//   try {
//     data = JSON.parse(text);
//   } catch {
//     console.error(
//       "Shipmozo returned non-JSON response:",
//       text
//     );

//     throw new Error(
//       `Shipmozo returned invalid response. HTTP ${response.status}: ${text}`
//     );
//   }

//   console.log(
//     "SHIPMOZO PARSED RESPONSE:",
//     JSON.stringify(data, null, 2)
//   );

//   if (
//     !response.ok ||
//     String(data.result) !== "1"
//   ) {
//     throw new Error(
//       `Shipmozo API failed (${response.status}): ${
//         data.message || "Unknown Shipmozo error"
//       }`
//     );
//   }

//   return data;
// }

// /*
// |--------------------------------------------------------------------------
// | NORMALIZE PRODUCT WEIGHT
// |--------------------------------------------------------------------------
// */

// function normalizeWeight(value: any): string | null {
//   if (value === undefined || value === null) {
//     return null;
//   }

//   const valueString = String(value)
//     .trim()
//     .toLowerCase();

//   if (
//     valueString === "120" ||
//     valueString === "120g"
//   ) {
//     return "120g";
//   }

//   if (
//     valueString === "220" ||
//     valueString === "220g"
//   ) {
//     return "220g";
//   }

//   if (
//     valueString === "330" ||
//     valueString === "330g"
//   ) {
//     return "330g";
//   }

//   if (
//     valueString === "430" ||
//     valueString === "430g"
//   ) {
//     return "430g";
//   }

//   return null;
// }

// /*
// |--------------------------------------------------------------------------
// | GET ITEM WEIGHT
// |--------------------------------------------------------------------------
// */

// function getItemWeight(item: any): string | null {
//   const possibleValues = [
//     item.size,
//     item.weight,
//     item.unitWeight,
//     item.comboUnitWeight,
//     item.selectedWeight,
//     item.productWeight,
//     item.selectedVariant,
//   ];

//   for (const value of possibleValues) {
//     const normalized = normalizeWeight(value);

//     if (normalized) {
//       return normalized;
//     }
//   }

//   return null;
// }

// /*
// |--------------------------------------------------------------------------
// | CHECK COMBO
// |--------------------------------------------------------------------------
// */

// function isCombo(item: any): boolean {
//   return (
//     item.isCombo === true ||
//     item.comboSize !== undefined ||
//     item.comboQuantity !== undefined ||
//     item.comboUnitWeight !== undefined ||
//     item.jarCount !== undefined ||
//     Array.isArray(item.comboItems)
//   );
// }

// /*
// |--------------------------------------------------------------------------
// | GET COMBO SIZE
// |--------------------------------------------------------------------------
// */

// function getComboSize(item: any): number {
//   const possibleValues = [
//     item.comboSize,
//     item.comboQuantity,
//     item.jarCount,
//   ];

//   for (const value of possibleValues) {
//     const numberValue = Number(value);

//     if (
//       Number.isFinite(numberValue) &&
//       numberValue > 0
//     ) {
//       return numberValue;
//     }
//   }

//   if (
//     Array.isArray(item.comboItems) &&
//     item.comboItems.length > 0
//   ) {
//     return item.comboItems.reduce(
//       (total: number, comboItem: any) =>
//         total +
//         Number(comboItem.quantity || 1),
//       0
//     );
//   }

//   return 1;
// }

// /*
// |--------------------------------------------------------------------------
// | GET PACKED SHIPPING WEIGHT
// |--------------------------------------------------------------------------
// */

// function getPackedWeight(item: any): number {
//   const size = getItemWeight(item);

//   if (!size) {
//     throw new Error(
//       `Shipping weight is missing for "${
//         item.name || "Unknown product"
//       }".`
//     );
//   }

//   const quantity = Math.max(
//     1,
//     Number(item.quantity || 1)
//   );

//   const combo = isCombo(item);

//   /*
//   |--------------------------------------------------------------------------
//   | INDIVIDUAL PRODUCTS
//   |--------------------------------------------------------------------------
//   */

//   if (!combo) {
//     if (size === "120g") {
//       throw new Error(
//         `Invalid product "${
//           item.name || "Unknown"
//         }": individual 120g products are not supported.`
//       );
//     }

//     if (size === "220g") {
//       return 400 * quantity;
//     }

//     if (size === "330g") {
//       return 450 * quantity;
//     }

//     if (size === "430g") {
//       return 600 * quantity;
//     }
//   }

//   /*
//   |--------------------------------------------------------------------------
//   | COMBOS
//   |--------------------------------------------------------------------------
//   */

//   const comboSize = getComboSize(item);

//   if (
//     size === "120g" &&
//     comboSize === 2
//   ) {
//     return 450 * quantity;
//   }

//   if (
//     size === "120g" &&
//     comboSize === 4
//   ) {
//     return 700 * quantity;
//   }

//   if (
//     size === "220g" &&
//     comboSize === 2
//   ) {
//     return 600 * quantity;
//   }

//   if (
//     size === "330g" &&
//     comboSize === 2
//   ) {
//     return 800 * quantity;
//   }

//   throw new Error(
//     `No shipping/carton profile exists for ${size} x ${comboSize}.`
//   );
// }

// /*
// |--------------------------------------------------------------------------
// | GET EXACT CARTON
// |--------------------------------------------------------------------------
// */

// function getExactCarton(
//   item: any
// ): CartonProfile | null {
//   const size = getItemWeight(item);

//   if (!size) {
//     return null;
//   }

//   const quantity = Number(item.quantity || 1);
//   const combo = isCombo(item);

//   /*
//   |--------------------------------------------------------------------------
//   | SINGLE PRODUCTS
//   |--------------------------------------------------------------------------
//   */

//   if (!combo && quantity === 1) {
//     if (size === "220g") {
//       return (
//         CARTONS.find(
//           (carton) =>
//             carton.exactType === "220_SINGLE"
//         ) || null
//       );
//     }

//     if (size === "330g") {
//       return (
//         CARTONS.find(
//           (carton) =>
//             carton.exactType === "330_SINGLE"
//         ) || null
//       );
//     }

//     if (size === "430g") {
//       return (
//         CARTONS.find(
//           (carton) =>
//             carton.exactType === "430_SINGLE"
//         ) || null
//       );
//     }
//   }

//   /*
//   |--------------------------------------------------------------------------
//   | COMBOS
//   |--------------------------------------------------------------------------
//   */

//   if (combo && quantity === 1) {
//     const comboSize = getComboSize(item);

//     if (
//       size === "120g" &&
//       comboSize === 2
//     ) {
//       return (
//         CARTONS.find(
//           (carton) =>
//             carton.exactType === "120_DOUBLE"
//         ) || null
//       );
//     }

//     if (
//       size === "120g" &&
//       comboSize === 4
//     ) {
//       return (
//         CARTONS.find(
//           (carton) =>
//             carton.exactType === "120_FOUR"
//         ) || null
//       );
//     }

//     if (
//       size === "220g" &&
//       comboSize === 2
//     ) {
//       return (
//         CARTONS.find(
//           (carton) =>
//             carton.exactType === "220_DOUBLE"
//         ) || null
//       );
//     }

//     if (
//       size === "330g" &&
//       comboSize === 2
//     ) {
//       return (
//         CARTONS.find(
//           (carton) =>
//             carton.exactType === "330_DOUBLE"
//         ) || null
//       );
//     }
//   }

//   return null;
// }

// /*
// |--------------------------------------------------------------------------
// | CREATE ORDER LINES
// |--------------------------------------------------------------------------
// */

// function getOrderLines(order: any) {
//   if (
//     !Array.isArray(order.items) ||
//     order.items.length === 0
//   ) {
//     throw new Error(
//       "Cannot calculate shipping: order has no items."
//     );
//   }

//   return order.items.map((item: any) => ({
//     item,

//     name:
//       item.name ||
//       item.productName ||
//       "AchaarYaar Product",

//     packedWeight:
//       getPackedWeight(item),

//     exactCarton:
//       getExactCarton(item),
//   }));
// }

// /*
// |--------------------------------------------------------------------------
// | FIND SMALLEST CARTON
// |--------------------------------------------------------------------------
// */

// function findSmallestCarton(
//   weight: number
// ): CartonProfile | null {
//   const allCartons = [
//     ...CARTONS,
//     ...MIXED_CARTONS,
//   ];

//   return (
//     allCartons
//       .filter(
//         (carton) =>
//           carton.capacity >= weight
//       )
//       .sort(
//         (a, b) =>
//           a.capacity - b.capacity
//       )[0] || null
//   );
// }

// /*
// |--------------------------------------------------------------------------
// | CALCULATE PACKAGES
// |--------------------------------------------------------------------------
// */

// function calculatePackages(order: any) {
//   const lines = getOrderLines(order);

//   /*
//   |--------------------------------------------------------------------------
//   | EXACT SINGLE PACKAGE
//   |--------------------------------------------------------------------------
//   */

//   if (lines.length === 1) {
//     const line = lines[0];

//     const quantity = Number(
//       line.item.quantity || 1
//     );

//     if (
//       line.exactCarton &&
//       quantity === 1
//     ) {
//       return [
//         {
//           carton: line.exactCarton,
//           weight: line.packedWeight,
//           items: [line.name],
//         },
//       ];
//     }
//   }

//   /*
//   |--------------------------------------------------------------------------
//   | MIXED / MULTIPLE ORDER
//   |--------------------------------------------------------------------------
//   */

//   const totalWeight = lines.reduce(
//     (total: number, line: any) =>
//       total + line.packedWeight,
//     0
//   );

//   console.log(
//     "Mixed order total packed weight:",
//     totalWeight,
//     "g"
//   );

//   const mixedCarton =
//     MIXED_CARTONS
//       .filter(
//         (carton) =>
//           carton.capacity >= totalWeight
//       )
//       .sort(
//         (a, b) =>
//           a.capacity - b.capacity
//       )[0];

//   if (mixedCarton) {
//     return [
//       {
//         carton: mixedCarton,
//         weight: totalWeight,
//         items: lines.map(
//           (line: any) => line.name
//         ),
//       },
//     ];
//   }

//   const currentCarton =
//     CARTONS
//       .filter(
//         (carton) =>
//           carton.capacity >= totalWeight
//       )
//       .sort(
//         (a, b) =>
//           a.capacity - b.capacity
//       )[0];

//   if (currentCarton) {
//     return [
//       {
//         carton: currentCarton,
//         weight: totalWeight,
//         items: lines.map(
//           (line: any) => line.name
//         ),
//       },
//     ];
//   }

//   /*
//   |--------------------------------------------------------------------------
//   | MULTIPLE CARTONS
//   |--------------------------------------------------------------------------
//   */

//   const sortedLines = [...lines].sort(
//     (a, b) =>
//       b.packedWeight - a.packedWeight
//   );

//   const packages: Array<{
//     carton: CartonProfile;
//     weight: number;
//     items: string[];
//   }> = [];

//   for (const line of sortedLines) {
//     let placed = false;

//     for (const pkg of packages) {
//       if (
//         pkg.weight +
//           line.packedWeight <=
//         pkg.carton.capacity
//       ) {
//         pkg.weight += line.packedWeight;
//         pkg.items.push(line.name);
//         placed = true;
//         break;
//       }
//     }

//     if (placed) {
//       continue;
//     }

//     const carton = findSmallestCarton(
//       line.packedWeight
//     );

//     if (!carton) {
//       throw new Error(
//         `No carton can hold ${line.packedWeight}g for "${line.name}".`
//       );
//     }

//     packages.push({
//       carton,
//       weight: line.packedWeight,
//       items: [line.name],
//     });
//   }

//   return packages;
// }

// /*
// |--------------------------------------------------------------------------
// | PUSH ORDER TO SHIPMOZO
// |--------------------------------------------------------------------------
// */

// export async function pushShipmozoOrder(
//   order: any
// ) {
//   const warehouseId =
//     process.env.SHIPMOZO_WAREHOUSE_ID;

//   if (!warehouseId) {
//     throw new Error(
//       "SHIPMOZO_WAREHOUSE_ID is missing"
//     );
//   }

//   const orderDate = new Date(
//     order.createdAt || Date.now()
//   )
//     .toISOString()
//     .split("T")[0];

//   /*
//   |--------------------------------------------------------------------------
//   | PRODUCTS
//   |--------------------------------------------------------------------------
//   */

//   const productDetail = (order.items || []).map(
//     (item: any) => ({
//       name:
//         item.name ||
//         item.productName ||
//         "AchaarYaar Product",

//       sku_number:
//         item._id?.toString() ||
//         item.productId?.toString() ||
//         "",

//       quantity: Number(
//         item.quantity || 1
//       ),

//       discount: "",

//       hsn: item.hsn || "",

//       unit_price: Number(
//         item.price ||
//           item.unitPrice ||
//           item.salePrice ||
//           0
//       ),

//       product_category:
//         item.productCategory || "Food",
//     })
//   );

//   /*
//   |--------------------------------------------------------------------------
//   | CALCULATE PACKAGE
//   |--------------------------------------------------------------------------
//   */

//   const packages = calculatePackages(order);

//   console.log(
//     "AchaarYaar calculated packages:",
//     JSON.stringify(packages, null, 2)
//   );

//   /*
//   |--------------------------------------------------------------------------
//   | CURRENT API SUPPORTS ONE PACKAGE
//   |--------------------------------------------------------------------------
//   */

//   if (packages.length !== 1) {
//     const summary = packages
//       .map(
//         (pkg, index) =>
//           `Carton ${index + 1}: ${pkg.weight}g | ` +
//           `${pkg.carton.length} x ` +
//           `${pkg.carton.width} x ` +
//           `${pkg.carton.height} inch | ` +
//           `${pkg.items.join(", ")}`
//       )
//       .join(" ; ");

//     throw new Error(
//       `This order requires ${packages.length} physical cartons. ${summary}. ` +
//         `Order was NOT pushed to Shipmozo because the current implementation sends one package.`
//     );
//   }

//   const shipment = packages[0];

//   /*
//   |--------------------------------------------------------------------------
//   | FINAL SHIPMOZO PAYLOAD
//   |--------------------------------------------------------------------------
//   */

//   const body = {
//     order_id: order._id.toString(),

//     order_date: orderDate,

//     order_type: "ESSENTIALS",

//     /*
//     |--------------------------------------------------------------------------
//     | CONSIGNEE
//     |--------------------------------------------------------------------------
//     */

//     consignee_name:
//       order.fullName || "",

//     consignee_phone:
//       String(order.phone || "")
//         .replace(/\D/g, ""),

//     consignee_alternate_phone: "",

//     consignee_email:
//       order.email || "",

//     consignee_address_line_one:
//       order.address || "",

//     consignee_address_line_two: "",

//     consignee_pin_code:
//       String(order.pincode || "").trim(),

//     consignee_city:
//       order.city || "",

//     consignee_state:
//       order.state || "",

//     /*
//     |--------------------------------------------------------------------------
//     | PRODUCTS
//     |--------------------------------------------------------------------------
//     */

//     product_detail: productDetail,

//     /*
//     |--------------------------------------------------------------------------
//     | PAYMENT
//     |--------------------------------------------------------------------------
//     */

//     payment_type: "PREPAID",

//     cod_amount: "",

//     shipping_charges: String(
//       order.shipping || ""
//     ),

//     /*
//     |--------------------------------------------------------------------------
//     | PACKAGE
//     |--------------------------------------------------------------------------
//     */

//     weight: shipment.weight,

//     length: shipment.carton.length,

//     width: shipment.carton.width,

//     height: shipment.carton.height,

//     /*
//     |--------------------------------------------------------------------------
//     | WAREHOUSE
//     |--------------------------------------------------------------------------
//     */

//     warehouse_id: warehouseId,

//     /*
//     |--------------------------------------------------------------------------
//     | GST
//     |--------------------------------------------------------------------------
//     */

//     gst_ewaybill_number: "",

//     gstin_number: "",
//   };

//   console.log(
//     "Shipmozo push-order payload:",
//     JSON.stringify(body, null, 2)
//   );

//   const response = await fetch(
//     `${SHIPMOZO_BASE_URL}/push-order`,
//     {
//       method: "POST",

//       headers: getHeaders(),

//       body: JSON.stringify(body),

//       cache: "no-store",
//     }
//   );

//   return parseResponse(response);
// }

// /*
// |--------------------------------------------------------------------------
// | AUTO ASSIGN COURIER
// |--------------------------------------------------------------------------
// */

// export async function autoAssignShipmozoOrder(
//   orderId: string
// ) {
//   if (!orderId) {
//     throw new Error(
//       "Shipmozo order ID is required for auto assignment."
//     );
//   }

//   const response = await fetch(
//     `${SHIPMOZO_BASE_URL}/auto-assign-order`,
//     {
//       method: "POST",

//       headers: getHeaders(),

//       body: JSON.stringify({
//         order_id: orderId,
//       }),

//       cache: "no-store",
//     }
//   );

//   return parseResponse(response);
// }

// /*
// |--------------------------------------------------------------------------
// | TRACK SHIPMENT
// |--------------------------------------------------------------------------
// */

// export async function trackShipmozoOrder(
//   awbNumber: string
// ) {
//   if (!awbNumber) {
//     throw new Error(
//       "AWB number is required for tracking."
//     );
//   }

//   const response = await fetch(
//     `${SHIPMOZO_BASE_URL}/track-order?awb_number=${encodeURIComponent(
//       awbNumber
//     )}`,
//     {
//       method: "GET",

//       headers: getHeaders(),

//       cache: "no-store",
//     }
//   );

//   return parseResponse(response);
// }

// /*
// |--------------------------------------------------------------------------
// | CANCEL SHIPMENT
// |--------------------------------------------------------------------------
// */

// export async function cancelShipmozoOrder(
//   orderId: string,
//   awbNumber: string
// ) {
//   if (!orderId) {
//     throw new Error(
//       "Shipmozo order ID is required."
//     );
//   }

//   if (!awbNumber) {
//     throw new Error(
//       "AWB number is required."
//     );
//   }

//   const response = await fetch(
//     `${SHIPMOZO_BASE_URL}/cancel-order`,
//     {
//       method: "POST",

//       headers: getHeaders(),

//       body: JSON.stringify({
//         order_id: orderId,
//         awb_number: awbNumber,
//       }),

//       cache: "no-store",
//     }
//   );

//   return parseResponse(response);
// }

const SHIPMOZO_BASE_URL =
  "https://shipping-api.com/app/api/v1";

interface ShipmozoResponse {
  result: string | number;
  message: string;
  data?: any;
}

interface CartonProfile {
  code: string;
  capacity: number;
  length: number;
  width: number;
  height: number;
  exactType?: string;
}

/*
|--------------------------------------------------------------------------
| CARTON PROFILES
|--------------------------------------------------------------------------
*/

const CARTONS: CartonProfile[] = [
  {
    code: "120_DOUBLE",
    capacity: 450,
    length: 6,
    width: 4,
    height: 3.5,
    exactType: "120_DOUBLE",
  },
  {
    code: "120_FOUR",
    capacity: 700,
    length: 6,
    width: 6,
    height: 6,
    exactType: "120_FOUR",
  },
  {
    code: "220_SINGLE",
    capacity: 400,
    length: 4,
    width: 4,
    height: 4,
    exactType: "220_SINGLE",
  },
  {
    code: "220_DOUBLE",
    capacity: 600,
    length: 7,
    width: 4,
    height: 3.5,
    exactType: "220_DOUBLE",
  },
  {
    code: "330_SINGLE",
    capacity: 450,
    length: 5,
    width: 5,
    height: 5,
    exactType: "330_SINGLE",
  },
  {
    code: "330_DOUBLE",
    capacity: 800,
    length: 8,
    width: 6,
    height: 6,
    exactType: "330_DOUBLE",
  },
  {
    code: "430_SINGLE",
    capacity: 600,
    length: 6,
    width: 4,
    height: 3.5,
    exactType: "430_SINGLE",
  },
];

/*
|--------------------------------------------------------------------------
| AUTHENTICATION
|--------------------------------------------------------------------------
*/

function getHeaders() {
  const publicKey = process.env.SHIPMOZO_PUBLIC_KEY;
  const privateKey = process.env.SHIPMOZO_PRIVATE_KEY;

  if (!publicKey) {
    throw new Error("SHIPMOZO_PUBLIC_KEY is missing");
  }

  if (!privateKey) {
    throw new Error("SHIPMOZO_PRIVATE_KEY is missing");
  }

  return {
    "Content-Type": "application/json",
    "public-key": publicKey,
    "private-key": privateKey,
  };
}

/*
|--------------------------------------------------------------------------
| RESPONSE PARSER
|--------------------------------------------------------------------------
*/

async function parseResponse(
  response: Response
): Promise<ShipmozoResponse> {
  const text = await response.text();

  console.log(
    "================================="
  );
  console.log(
    "SHIPMOZO RESPONSE STATUS:",
    response.status
  );
  console.log(
    "SHIPMOZO RESPONSE TEXT:",
    text
  );
  console.log(
    "================================="
  );

  let data: ShipmozoResponse;

  try {
    data = JSON.parse(text);
  } catch {
    throw new Error(
      `Shipmozo returned invalid JSON. HTTP ${response.status}: ${text}`
    );
  }

  if (
    !response.ok ||
    String(data.result) !== "1"
  ) {
    throw new Error(
      `Shipmozo API failed (${response.status}): ${
        data.message || "Unknown error"
      }`
    );
  }

  return data;
}

/*
|--------------------------------------------------------------------------
| VARIANT PARSING
|--------------------------------------------------------------------------
*/

function getVariantText(item: any): string {
  return String(
    item.selectedVariant ||
      item.size ||
      item.weight ||
      item.unitWeight ||
      item.comboUnitWeight ||
      ""
  )
    .trim()
    .toLowerCase();
}

function normalizeWeight(
  value: any
): string | null {
  if (value === undefined || value === null) {
    return null;
  }

  const text = String(value)
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "");

  if (text.includes("120g") || text === "120") {
    return "120g";
  }

  if (text.includes("220g") || text === "220") {
    return "220g";
  }

  if (text.includes("330g") || text === "330") {
    return "330g";
  }

  if (text.includes("430g") || text === "430") {
    return "430g";
  }

  return null;
}

/*
|--------------------------------------------------------------------------
| GET ITEM WEIGHT
|--------------------------------------------------------------------------
*/

function getItemWeight(item: any): string | null {
  const possibleValues = [
    item.selectedVariant,
    item.size,
    item.weight,
    item.unitWeight,
    item.comboUnitWeight,
    item.selectedWeight,
    item.productWeight,
  ];

  for (const value of possibleValues) {
    const normalized = normalizeWeight(value);

    if (normalized) {
      return normalized;
    }
  }

  return null;
}

/*
|--------------------------------------------------------------------------
| CHECK COMBO
|--------------------------------------------------------------------------
*/

function isCombo(item: any): boolean {
  if (item.isCombo === true) {
    return true;
  }

  if (
    item.comboSize !== undefined ||
    item.comboQuantity !== undefined ||
    item.comboUnitWeight !== undefined ||
    item.jarCount !== undefined
  ) {
    return true;
  }

  if (
    Array.isArray(item.comboItems) &&
    item.comboItems.length > 0
  ) {
    return true;
  }

  const variant = getVariantText(item);

  return (
    variant.includes("×") ||
    variant.includes("x") ||
    variant.includes("jar")
  );
}

/*
|--------------------------------------------------------------------------
| GET COMBO SIZE
|--------------------------------------------------------------------------
*/

function getComboSize(item: any): number {
  const possibleValues = [
    item.comboSize,
    item.comboQuantity,
    item.jarCount,
  ];

  for (const value of possibleValues) {
    const numberValue = Number(value);

    if (
      Number.isFinite(numberValue) &&
      numberValue > 0
    ) {
      return Math.floor(numberValue);
    }
  }

  if (
    Array.isArray(item.comboItems) &&
    item.comboItems.length > 0
  ) {
    return item.comboItems.reduce(
      (total: number, comboItem: any) =>
        total +
        Math.max(
          1,
          Number(comboItem.quantity || 1)
        ),
      0
    );
  }

  const variant = getVariantText(item);

  const match = variant.match(
    /(?:×|x)\s*(\d+)\s*jar/
  );

  if (match?.[1]) {
    return Number(match[1]);
  }

  return 1;
}

/*
|--------------------------------------------------------------------------
| GET PACKED WEIGHT FOR ONE ORDER LINE
|--------------------------------------------------------------------------
*/

function getPackedWeight(item: any): number {
  const size = getItemWeight(item);

  if (!size) {
    throw new Error(
      `Cannot detect product weight for "${
        item.name ||
        item.productName ||
        "Unknown product"
      }". Variant: ${
        item.selectedVariant || "not provided"
      }`
    );
  }

  const quantity = Math.max(
    1,
    Math.floor(Number(item.quantity || 1))
  );

  const combo = isCombo(item);

  /*
  --------------------------------------------------------
  NORMAL PRODUCTS
  --------------------------------------------------------
  */

  if (!combo) {
    if (size === "220g") {
      return 400 * quantity;
    }

    if (size === "330g") {
      return 450 * quantity;
    }

    if (size === "430g") {
      return 600 * quantity;
    }

    if (size === "120g") {
      throw new Error(
        "Individual 120g product has no carton profile."
      );
    }
  }

  /*
  --------------------------------------------------------
  COMBO PRODUCTS
  --------------------------------------------------------
  */

  const comboSize = getComboSize(item);

  if (size === "120g" && comboSize === 2) {
    return 450 * quantity;
  }

  if (size === "120g" && comboSize === 4) {
    return 700 * quantity;
  }

  if (size === "220g" && comboSize === 2) {
    return 600 * quantity;
  }

  if (size === "330g" && comboSize === 2) {
    return 800 * quantity;
  }

  throw new Error(
    `No carton profile for ${size} × ${comboSize} jars.`
  );
}

/*
|--------------------------------------------------------------------------
| GET EXACT CARTON
|--------------------------------------------------------------------------
*/

function getExactCarton(
  item: any
): CartonProfile | null {
  const size = getItemWeight(item);

  if (!size) {
    return null;
  }

  const quantity = Math.max(
    1,
    Math.floor(Number(item.quantity || 1))
  );

  const combo = isCombo(item);

  if (!combo && quantity === 1) {
    if (size === "220g") {
      return CARTONS.find(
        (carton) =>
          carton.exactType === "220_SINGLE"
      ) || null;
    }

    if (size === "330g") {
      return CARTONS.find(
        (carton) =>
          carton.exactType === "330_SINGLE"
      ) || null;
    }

    if (size === "430g") {
      return CARTONS.find(
        (carton) =>
          carton.exactType === "430_SINGLE"
      ) || null;
    }
  }

  if (combo && quantity === 1) {
    const comboSize = getComboSize(item);

    if (
      size === "120g" &&
      comboSize === 2
    ) {
      return CARTONS.find(
        (carton) =>
          carton.exactType === "120_DOUBLE"
      ) || null;
    }

    if (
      size === "120g" &&
      comboSize === 4
    ) {
      return CARTONS.find(
        (carton) =>
          carton.exactType === "120_FOUR"
      ) || null;
    }

    if (
      size === "220g" &&
      comboSize === 2
    ) {
      return CARTONS.find(
        (carton) =>
          carton.exactType === "220_DOUBLE"
      ) || null;
    }

    if (
      size === "330g" &&
      comboSize === 2
    ) {
      return CARTONS.find(
        (carton) =>
          carton.exactType === "330_DOUBLE"
      ) || null;
    }
  }

  return null;
}

/*
|--------------------------------------------------------------------------
| CREATE ORDER LINES
|--------------------------------------------------------------------------
*/

function getOrderLines(order: any) {
  if (
    !Array.isArray(order.items) ||
    order.items.length === 0
  ) {
    throw new Error(
      "Order has no items."
    );
  }

  return order.items.map((item: any) => ({
    item,
    name:
      item.name ||
      item.productName ||
      "AchaarYaar Product",
    packedWeight: getPackedWeight(item),
    exactCarton: getExactCarton(item),
  }));
}

/*
|--------------------------------------------------------------------------
| CALCULATE PACKAGES
|--------------------------------------------------------------------------
*/

function calculatePackages(order: any) {
  const lines = getOrderLines(order);

  /*
  --------------------------------------------------------
  ONE PRODUCT / ONE COMBO
  --------------------------------------------------------
  */

  if (lines.length === 1) {
    const line = lines[0];

    const quantity = Math.max(
      1,
      Math.floor(
        Number(line.item.quantity || 1)
      )
    );

    if (
      line.exactCarton &&
      quantity === 1
    ) {
      return [
        {
          carton: line.exactCarton,
          weight: line.packedWeight,
          items: [line.name],
        },
      ];
    }
  }

  /*
  --------------------------------------------------------
  TRY ONE CARTON FOR COMPLETE ORDER
  --------------------------------------------------------
  */

  const totalWeight = lines.reduce(
    (total: number, line: any) =>
      total + line.packedWeight,
    0
  );

  console.log(
    "TOTAL PACKED ORDER WEIGHT:",
    totalWeight,
    "g"
  );

  const carton = [...CARTONS]
    .filter(
      (carton) =>
        carton.capacity >= totalWeight
    )
    .sort(
      (a, b) =>
        a.capacity - b.capacity
    )[0];

  if (carton) {
    return [
      {
        carton,
        weight: totalWeight,
        items: lines.map(
          (line: any) => line.name
        ),
      },
    ];
  }

  throw new Error(
    `Order packed weight ${totalWeight}g requires more than one carton. Multi-carton orders are not supported by this Shipmozo implementation.`
  );
}

/*
|--------------------------------------------------------------------------
| PUSH ORDER TO SHIPMOZO
|--------------------------------------------------------------------------
*/

export async function pushShipmozoOrder(
  order: any
) {
  const warehouseId =
    process.env.SHIPMOZO_WAREHOUSE_ID;

  if (!warehouseId) {
    throw new Error(
      "SHIPMOZO_WAREHOUSE_ID is missing"
    );
  }

  if (!order?._id) {
    throw new Error(
      "Order ID is missing"
    );
  }

  const packages =
    calculatePackages(order);

  if (packages.length !== 1) {
    throw new Error(
      "Exactly one package is required."
    );
  }

  const shipment = packages[0];

  const orderDate = new Date(
    order.createdAt || Date.now()
  )
    .toISOString()
    .split("T")[0];

  const productDetail =
    (order.items || []).map(
      (item: any) => ({
        name:
          item.name ||
          item.productName ||
          "AchaarYaar Product",

        sku_number:
          item._id?.toString() ||
          item.productId?.toString() ||
          "",

        quantity: Math.max(
          1,
          Number(item.quantity || 1)
        ),

        discount: "",

        hsn: String(item.hsn || ""),

        unit_price: Number(
          item.price ||
            item.unitPrice ||
            item.salePrice ||
            0
        ),

        product_category:
          item.productCategory ||
          "Food",
      })
    );

  const body = {
    order_id: order._id.toString(),

    order_date: orderDate,

    order_type: "ESSENTIALS",

    consignee_name:
      String(order.fullName || ""),

    consignee_phone:
      String(order.phone || "")
        .replace(/\D/g, ""),

    consignee_alternate_phone: "",

    consignee_email:
      String(order.email || ""),

    consignee_address_line_one:
      String(order.address || ""),

    consignee_address_line_two: "",

    consignee_pin_code:
      String(order.pincode || "").trim(),

    consignee_city:
      String(order.city || ""),

    consignee_state:
      String(order.state || ""),

    product_detail: productDetail,

    payment_type: "PREPAID",

    cod_amount: "",

    shipping_charges: String(
      Number(order.shipping || 0)
    ),

    weight: shipment.weight,

    length: shipment.carton.length,

    width: shipment.carton.width,

    height: shipment.carton.height,

    warehouse_id: warehouseId,

    gst_ewaybill_number: "",

    gstin_number: "",
  };

  console.log(
    "================================="
  );
  console.log(
    "PUSHING ORDER TO SHIPMOZO"
  );
  console.log(
    JSON.stringify(body, null, 2)
  );
  console.log(
    "================================="
  );

  const response = await fetch(
    `${SHIPMOZO_BASE_URL}/push-order`,
    {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(body),
      cache: "no-store",
    }
  );

  return parseResponse(response);
}

/*
|--------------------------------------------------------------------------
| AUTO ASSIGN COURIER
|--------------------------------------------------------------------------
*/

export async function autoAssignShipmozoOrder(
  orderId: string
) {
  const response = await fetch(
    `${SHIPMOZO_BASE_URL}/auto-assign-order`,
    {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({
        order_id: orderId,
      }),
      cache: "no-store",
    }
  );

  return parseResponse(response);
}

/*
|--------------------------------------------------------------------------
| TRACK ORDER
|--------------------------------------------------------------------------
*/

export async function trackShipmozoOrder(
  awbNumber: string
) {
  const response = await fetch(
    `${SHIPMOZO_BASE_URL}/track-order?awb_number=${encodeURIComponent(
      awbNumber
    )}`,
    {
      method: "GET",
      headers: getHeaders(),
      cache: "no-store",
    }
  );

  return parseResponse(response);
}

/*
|--------------------------------------------------------------------------
| CANCEL ORDER
|--------------------------------------------------------------------------
*/

export async function cancelShipmozoOrder(
  orderId: string,
  awbNumber: string
) {
  const response = await fetch(
    `${SHIPMOZO_BASE_URL}/cancel-order`,
    {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({
        order_id: orderId,
        awb_number: awbNumber,
      }),
      cache: "no-store",
    }
  );

  return parseResponse(response);
}