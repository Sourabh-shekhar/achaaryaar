const SHIPMOZO_BASE_URL =
  "https://shipping-api.com/app/api/v1";

interface ShipmozoResponse {
  result: string;
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
| FINAL CARTON PROFILES
|--------------------------------------------------------------------------
|
| Your latest carton dimensions:
|
| 120g x 2       -> 6 x 4 x 3.5
| 120g x 4       -> 6 x 6 x 6
| 220g single    -> 4 x 4 x 4
| 220g x 2       -> 7 x 4 x 3.5
| 330g single    -> 5 x 5 x 5
| 330g x 2       -> 8 x 6 x 6
| 430g single    -> 6 x 4 x 3.5
|
| Dimensions are in inches.
| Weight is in grams.
|--------------------------------------------------------------------------
*/

const CARTONS: CartonProfile[] = [
  // 120g x 2
  {
    code: "120_DOUBLE",
    capacity: 450,
    length: 6,
    width: 4,
    height: 3.5,
    exactType: "120_DOUBLE",
  },

  // 120g x 4
  {
    code: "120_FOUR",
    capacity: 700,
    length: 6,
    width: 6,
    height: 6,
    exactType: "120_FOUR",
  },

  // 220g single
  {
    code: "220_SINGLE",
    capacity: 400,
    length: 4,
    width: 4,
    height: 4,
    exactType: "220_SINGLE",
  },

  // 220g x 2
  {
    code: "220_DOUBLE",
    capacity: 600,
    length: 7,
    width: 4,
    height: 3.5,
    exactType: "220_DOUBLE",
  },

  // 330g single
  {
    code: "330_SINGLE",
    capacity: 450,
    length: 5,
    width: 5,
    height: 5,
    exactType: "330_SINGLE",
  },

  // 330g x 2
  {
    code: "330_DOUBLE",
    capacity: 800,
    length: 8,
    width: 6,
    height: 6,
    exactType: "330_DOUBLE",
  },

  // 430g single
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
| MIXED CARTONS
|--------------------------------------------------------------------------
|
| You currently do not have a dedicated mixed-order carton.
|--------------------------------------------------------------------------
*/

const MIXED_CARTONS: CartonProfile[] = [];

/*
|--------------------------------------------------------------------------
| AUTHENTICATION
|--------------------------------------------------------------------------
*/

function getHeaders() {
  const publicKey =
    process.env.SHIPMOZO_PUBLIC_KEY;

  const privateKey =
    process.env.SHIPMOZO_PRIVATE_KEY;

  if (!publicKey) {
    throw new Error(
      "SHIPMOZO_PUBLIC_KEY is missing"
    );
  }

  if (!privateKey) {
    throw new Error(
      "SHIPMOZO_PRIVATE_KEY is missing"
    );
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

  let data: ShipmozoResponse;

  try {
    data = JSON.parse(text);
  } catch {
    console.error(
      "Shipmozo invalid response:",
      text
    );

    throw new Error(
      "Shipmozo returned an invalid response."
    );
  }

  if (
    !response.ok ||
    data.result !== "1"
  ) {
    throw new Error(
      data.message ||
        "Shipmozo request failed."
    );
  }

  return data;
}

/*
|--------------------------------------------------------------------------
| NORMALIZE PRODUCT WEIGHT
|--------------------------------------------------------------------------
*/

function normalizeWeight(
  value: any
): string | null {
  if (
    value === undefined ||
    value === null
  ) {
    return null;
  }

  const valueString = String(value)
    .trim()
    .toLowerCase();

  if (
    valueString === "120" ||
    valueString === "120g"
  ) {
    return "120g";
  }

  if (
    valueString === "220" ||
    valueString === "220g"
  ) {
    return "220g";
  }

  if (
    valueString === "330" ||
    valueString === "330g"
  ) {
    return "330g";
  }

  if (
    valueString === "430" ||
    valueString === "430g"
  ) {
    return "430g";
  }

  return null;
}

/*
|--------------------------------------------------------------------------
| GET ITEM WEIGHT
|--------------------------------------------------------------------------
*/

function getItemWeight(
  item: any
): string | null {
  const possibleValues = [
    item.size,
    item.weight,
    item.unitWeight,
    item.comboUnitWeight,
    item.selectedWeight,
    item.productWeight,
  ];

  for (const value of possibleValues) {
    const normalized =
      normalizeWeight(value);

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

function isCombo(
  item: any
): boolean {
  return (
    item.isCombo === true ||
    item.comboSize !== undefined ||
    item.comboQuantity !== undefined ||
    item.comboUnitWeight !== undefined ||
    Array.isArray(item.comboItems)
  );
}

/*
|--------------------------------------------------------------------------
| GET COMBO SIZE
|--------------------------------------------------------------------------
*/

function getComboSize(
  item: any
): number {
  const possibleValues = [
    item.comboSize,
    item.comboQuantity,
    item.jarCount,
  ];

  for (const value of possibleValues) {
    const numberValue =
      Number(value);

    if (
      Number.isFinite(numberValue) &&
      numberValue > 0
    ) {
      return numberValue;
    }
  }

  if (
    Array.isArray(item.comboItems) &&
    item.comboItems.length > 0
  ) {
    return item.comboItems.reduce(
      (
        total: number,
        comboItem: any
      ) =>
        total +
        Number(
          comboItem.quantity || 1
        ),
      0
    );
  }

  return 1;
}

/*
|--------------------------------------------------------------------------
| GET PACKED SHIPPING WEIGHT
|--------------------------------------------------------------------------
*/

function getPackedWeight(
  item: any
): number {
  const size =
    getItemWeight(item);

  if (!size) {
    throw new Error(
      `Shipping weight is missing for "${
        item.name || "Unknown product"
      }".`
    );
  }

  const quantity = Math.max(
    1,
    Number(item.quantity || 1)
  );

  const combo =
    isCombo(item);

  /*
  |--------------------------------------------------------------------------
  | INDIVIDUAL PRODUCTS
  |--------------------------------------------------------------------------
  */

  if (!combo) {
    if (size === "120g") {
      throw new Error(
        `Invalid product "${
          item.name || "Unknown"
        }": individual 120g products are not supported.`
      );
    }

    if (size === "220g") {
      return 400 * quantity;
    }

    if (size === "330g") {
      return 450 * quantity;
    }

    if (size === "430g") {
      return 600 * quantity;
    }
  }

  /*
  |--------------------------------------------------------------------------
  | COMBOS
  |--------------------------------------------------------------------------
  */

  const comboSize =
    getComboSize(item);

  // 120g x 2
  if (
    size === "120g" &&
    comboSize === 2
  ) {
    return 450 * quantity;
  }

  // 120g x 4
  if (
    size === "120g" &&
    comboSize === 4
  ) {
    return 700 * quantity;
  }

  // 220g x 2
  if (
    size === "220g" &&
    comboSize === 2
  ) {
    return 600 * quantity;
  }

  // 330g x 2
  if (
    size === "330g" &&
    comboSize === 2
  ) {
    return 800 * quantity;
  }

  throw new Error(
    `No shipping/carton profile exists for ${size} x ${comboSize}.`
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
  const size =
    getItemWeight(item);

  if (!size) {
    return null;
  }

  const quantity =
    Number(item.quantity || 1);

  const combo =
    isCombo(item);

  /*
  |--------------------------------------------------------------------------
  | SINGLE PRODUCT
  |--------------------------------------------------------------------------
  */

  if (
    !combo &&
    quantity === 1
  ) {
    if (size === "220g") {
      return (
        CARTONS.find(
          (carton) =>
            carton.exactType ===
            "220_SINGLE"
        ) || null
      );
    }

    if (size === "330g") {
      return (
        CARTONS.find(
          (carton) =>
            carton.exactType ===
            "330_SINGLE"
        ) || null
      );
    }

    if (size === "430g") {
      return (
        CARTONS.find(
          (carton) =>
            carton.exactType ===
            "430_SINGLE"
        ) || null
      );
    }
  }

  /*
  |--------------------------------------------------------------------------
  | COMBOS
  |--------------------------------------------------------------------------
  */

  if (combo) {
    const comboSize =
      getComboSize(item);

    // 120g x 2
    if (
      size === "120g" &&
      comboSize === 2 &&
      quantity === 1
    ) {
      return (
        CARTONS.find(
          (carton) =>
            carton.exactType ===
            "120_DOUBLE"
        ) || null
      );
    }

    // 120g x 4
    if (
      size === "120g" &&
      comboSize === 4 &&
      quantity === 1
    ) {
      return (
        CARTONS.find(
          (carton) =>
            carton.exactType ===
            "120_FOUR"
        ) || null
      );
    }

    // 220g x 2
    if (
      size === "220g" &&
      comboSize === 2 &&
      quantity === 1
    ) {
      return (
        CARTONS.find(
          (carton) =>
            carton.exactType ===
            "220_DOUBLE"
        ) || null
      );
    }

    // 330g x 2
    if (
      size === "330g" &&
      comboSize === 2 &&
      quantity === 1
    ) {
      return (
        CARTONS.find(
          (carton) =>
            carton.exactType ===
            "330_DOUBLE"
        ) || null
      );
    }
  }

  return null;
}

/*
|--------------------------------------------------------------------------
| CREATE ORDER LINES
|--------------------------------------------------------------------------
*/

function getOrderLines(
  order: any
) {
  if (
    !Array.isArray(order.items) ||
    order.items.length === 0
  ) {
    throw new Error(
      "Cannot calculate shipping: order has no items."
    );
  }

  return order.items.map(
    (item: any) => ({
      item,

      name:
        item.name ||
        item.productName ||
        "AchaarYaar Product",

      packedWeight:
        getPackedWeight(item),

      exactCarton:
        getExactCarton(item),
    })
  );
}

/*
|--------------------------------------------------------------------------
| FIND SMALLEST CARTON BY CAPACITY
|--------------------------------------------------------------------------
*/

function findSmallestCarton(
  weight: number
): CartonProfile | null {
  const allCartons = [
    ...CARTONS,
    ...MIXED_CARTONS,
  ];

  return (
    allCartons
      .filter(
        (carton) =>
          carton.capacity >= weight
      )
      .sort(
        (a, b) =>
          a.capacity - b.capacity
      )[0] || null
  );
}

/*
|--------------------------------------------------------------------------
| CALCULATE PACKAGES
|--------------------------------------------------------------------------
*/

function calculatePackages(
  order: any
) {
  const lines =
    getOrderLines(order);

  /*
  |--------------------------------------------------------------------------
  | EXACT SINGLE PACKAGE
  |--------------------------------------------------------------------------
  */

  if (lines.length === 1) {
    const line =
      lines[0];

    const quantity =
      Number(
        line.item.quantity || 1
      );

    if (
      line.exactCarton &&
      quantity === 1
    ) {
      return [
        {
          carton:
            line.exactCarton,

          weight:
            line.packedWeight,

          items: [
            line.name,
          ],
        },
      ];
    }
  }

  /*
  |--------------------------------------------------------------------------
  | MIXED ORDER
  |--------------------------------------------------------------------------
  */

  const totalWeight =
    lines.reduce(
      (
        total: number,
        line: any
      ) =>
        total +
        line.packedWeight,
      0
    );

  console.log(
    "Mixed order total packed weight:",
    totalWeight,
    "g"
  );

  /*
  |--------------------------------------------------------------------------
  | DEDICATED MIXED CARTON
  |--------------------------------------------------------------------------
  */

  const mixedCarton =
    MIXED_CARTONS
      .filter(
        (carton) =>
          carton.capacity >=
          totalWeight
      )
      .sort(
        (a, b) =>
          a.capacity -
          b.capacity
      )[0];

  if (mixedCarton) {
    return [
      {
        carton:
          mixedCarton,

        weight:
          totalWeight,

        items:
          lines.map(
            (line: any) =>
              line.name
          ),
      },
    ];
  }

  /*
  |--------------------------------------------------------------------------
  | EXISTING CARTON
  |--------------------------------------------------------------------------
  */

  const currentCarton =
    CARTONS
      .filter(
        (carton) =>
          carton.capacity >=
          totalWeight
      )
      .sort(
        (a, b) =>
          a.capacity -
          b.capacity
      )[0];

  if (currentCarton) {
    return [
      {
        carton:
          currentCarton,

        weight:
          totalWeight,

        items:
          lines.map(
            (line: any) =>
              line.name
          ),
      },
    ];
  }

  /*
  |--------------------------------------------------------------------------
  | MULTIPLE CARTONS
  |--------------------------------------------------------------------------
  */

  const sortedLines =
    [...lines].sort(
      (a, b) =>
        b.packedWeight -
        a.packedWeight
    );

  const packages: Array<{
    carton: CartonProfile;
    weight: number;
    items: string[];
  }> = [];

  for (
    const line of sortedLines
  ) {
    let placed = false;

    for (
      const pkg of packages
    ) {
      if (
        pkg.weight +
          line.packedWeight <=
        pkg.carton.capacity
      ) {
        pkg.weight +=
          line.packedWeight;

        pkg.items.push(
          line.name
        );

        placed = true;
        break;
      }
    }

    if (placed) {
      continue;
    }

    const carton =
      findSmallestCarton(
        line.packedWeight
      );

    if (!carton) {
      throw new Error(
        `No carton can hold ${line.packedWeight}g for "${line.name}".`
      );
    }

    packages.push({
      carton,
      weight:
        line.packedWeight,
      items: [
        line.name,
      ],
    });
  }

  return packages;
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

  const orderDate =
    new Date(
      order.createdAt ||
        Date.now()
    )
      .toISOString()
      .split("T")[0];

  /*
  |--------------------------------------------------------------------------
  | PRODUCTS
  |--------------------------------------------------------------------------
  */

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

        quantity:
          Number(
            item.quantity || 1
          ),

        discount:
          "",

        hsn:
          item.hsn || "",

        unit_price:
          Number(
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

  /*
  |--------------------------------------------------------------------------
  | PAYMENT
  |--------------------------------------------------------------------------
  |
  | COD has been removed from checkout.
  | All AchaarYaar orders are PREPAID through Razorpay/UPI.
  |--------------------------------------------------------------------------
  */

  /*
  |--------------------------------------------------------------------------
  | CALCULATE PACKAGES
  |--------------------------------------------------------------------------
  */

  const packages =
    calculatePackages(order);

  console.log(
    "AchaarYaar calculated packages:",
    JSON.stringify(
      packages,
      null,
      2
    )
  );

  /*
  |--------------------------------------------------------------------------
  | CURRENT SHIPMOZO PUSH API
  |--------------------------------------------------------------------------
  |
  | Your current API payload accepts one package:
  | one weight + one length + one width + one height.
  |--------------------------------------------------------------------------
  */

  if (
    packages.length !== 1
  ) {
    const summary =
      packages
        .map(
          (
            pkg,
            index
          ) =>
            `Carton ${
              index + 1
            }: ${
              pkg.weight
            }g | ${
              pkg.carton.length
            } x ${
              pkg.carton.width
            } x ${
              pkg.carton.height
            } inch | ${
              pkg.items.join(", ")
            }`
        )
        .join(" ; ");

    throw new Error(
      `This order requires ${
        packages.length
      } physical cartons. ${summary}. Order was NOT pushed to Shipmozo because the current push-order implementation sends one package.`
    );
  }

  const shipment =
    packages[0];

  /*
  |--------------------------------------------------------------------------
  | FINAL SHIPMOZO PAYLOAD
  |--------------------------------------------------------------------------
  */

  const body = {
    // --------------------------------------------------
    // ORDER
    // --------------------------------------------------

    order_id:
      order._id.toString(),

    order_date:
      orderDate,

    order_type:
      "ESSENTIALS",

    // --------------------------------------------------
    // CONSIGNEE
    // --------------------------------------------------

    consignee_name:
      order.fullName || "",

    consignee_phone:
      Number(order.phone) || 0,

    consignee_alternate_phone:
      "",

    consignee_email:
      order.email || "",

    consignee_address_line_one:
      order.address || "",

    consignee_address_line_two:
      "",

    consignee_pin_code:
      Number(order.pincode) || 0,

    consignee_city:
      order.city || "",

    consignee_state:
      order.state || "",

    // --------------------------------------------------
    // PRODUCTS
    // --------------------------------------------------

    product_detail:
      productDetail,

    // --------------------------------------------------
    // PAYMENT
    // --------------------------------------------------

    // Your store currently accepts UPI/Razorpay only.
    payment_type:
      "PREPAID",

    cod_amount:
      "",

    shipping_charges:
      String(
        order.shipping || ""
      ),

    // --------------------------------------------------
    // PACKAGE
    // --------------------------------------------------
    //
    // Weight = grams
    // Dimensions = inches
    //

    weight:
      shipment.weight,

    length:
      shipment.carton.length,

    width:
      shipment.carton.width,

    height:
      shipment.carton.height,

    // --------------------------------------------------
    // WAREHOUSE
    // --------------------------------------------------

    warehouse_id:
      warehouseId,

    // --------------------------------------------------
    // GST
    // --------------------------------------------------

    gst_ewaybill_number:
      "",

    gstin_number:
      "",
  };

  console.log(
    "Shipmozo push-order payload:",
    JSON.stringify(
      body,
      null,
      2
    )
  );

  const response =
    await fetch(
      `${SHIPMOZO_BASE_URL}/push-order`,
      {
        method: "POST",

        headers:
          getHeaders(),

        body:
          JSON.stringify(body),

        cache:
          "no-store",
      }
    );

  return parseResponse(
    response
  );
}

/*
|--------------------------------------------------------------------------
| AUTO ASSIGN COURIER
|--------------------------------------------------------------------------
*/

export async function autoAssignShipmozoOrder(
  orderId: string
) {
  const response =
    await fetch(
      `${SHIPMOZO_BASE_URL}/auto-assign-order`,
      {
        method: "POST",

        headers:
          getHeaders(),

        body:
          JSON.stringify({
            order_id:
              orderId,
          }),

        cache:
          "no-store",
      }
    );

  return parseResponse(
    response
  );
}

/*
|--------------------------------------------------------------------------
| TRACK SHIPMENT
|--------------------------------------------------------------------------
*/

export async function trackShipmozoOrder(
  awbNumber: string
) {
  if (!awbNumber) {
    throw new Error(
      "AWB number is required for tracking."
    );
  }

  const response =
    await fetch(
      `${SHIPMOZO_BASE_URL}/track-order?awb_number=${encodeURIComponent(
        awbNumber
      )}`,
      {
        method: "GET",

        headers:
          getHeaders(),

        cache:
          "no-store",
      }
    );

  return parseResponse(
    response
  );
}

/*
|--------------------------------------------------------------------------
| CANCEL SHIPMENT
|--------------------------------------------------------------------------
*/

export async function cancelShipmozoOrder(
  orderId: string,
  awbNumber: string
) {
  if (!orderId) {
    throw new Error(
      "Shipmozo order ID is required."
    );
  }

  if (!awbNumber) {
    throw new Error(
      "AWB number is required."
    );
  }

  const response =
    await fetch(
      `${SHIPMOZO_BASE_URL}/cancel-order`,
      {
        method: "POST",

        headers:
          getHeaders(),

        body:
          JSON.stringify({
            order_id:
              orderId,

            awb_number:
              awbNumber,
          }),

        cache:
          "no-store",
      }
    );

  return parseResponse(
    response
  );
}