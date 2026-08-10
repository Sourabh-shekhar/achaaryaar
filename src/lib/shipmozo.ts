const SHIPMOZO_BASE_URL =
  "https://shipping-api.com/app/api/v1";

interface ShipmozoResponse {
  result: string;
  message: string;
  data?: any;
}

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

async function parseResponse(response: Response) {
  const text = await response.text();

  let data: ShipmozoResponse;

  try {
    data = JSON.parse(text);
  } catch {
    throw new Error("Shipmozo returned an invalid response.");
  }

  if (!response.ok || data.result !== "1") {
    throw new Error(
      data.message || "Shipmozo request failed."
    );
  }

  return data;
}

/**
 * Push order to Shipmozo.
 */
export async function pushShipmozoOrder(order: any) {
  const warehouseId =
    process.env.SHIPMOZO_WAREHOUSE_ID;

  if (!warehouseId) {
    throw new Error(
      "SHIPMOZO_WAREHOUSE_ID is missing"
    );
  }

  const orderDate = new Date(
    order.createdAt || Date.now()
  )
    .toISOString()
    .split("T")[0];

  const productDetail = (order.items || []).map(
    (item: any) => ({
      name:
        item.name ||
        item.productName ||
        "AchaarYaar Product",

      sku_number:
        item._id?.toString() ||
        item.productId?.toString() ||
        "",

      quantity: Number(item.quantity || 1),

      discount: "",

      hsn: item.hsn || "",

      unit_price: Number(
        item.price ||
          item.unitPrice ||
          item.salePrice ||
          0
      ),

      product_category:
        item.productCategory || "Food",
    })
  );

  const isCOD =
    String(order.paymentMethod).toLowerCase() ===
    "cod";

  const body = {
    // --------------------------------------------------
    // ORDER
    // --------------------------------------------------

    order_id: order._id.toString(),

    order_date: orderDate,

    // Shipmozo order type
    order_type: "ESSENTIALS",

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

    payment_type:
      isCOD ? "COD" : "PREPAID",

    cod_amount:
      isCOD
        ? String(order.total || 0)
        : "",

    shipping_charges:
      String(order.shipping || ""),

    // --------------------------------------------------
    // PACKAGE DIMENSIONS
    // --------------------------------------------------

    weight: Number(
      order.shipmentWeight ||
        process.env.SHIPMOZO_DEFAULT_WEIGHT ||
        500
    ),

    length: Number(
      order.shipmentLength ||
        process.env.SHIPMOZO_DEFAULT_LENGTH ||
        20
    ),

    width: Number(
      order.shipmentWidth ||
        process.env.SHIPMOZO_DEFAULT_WIDTH ||
        15
    ),

    height: Number(
      order.shipmentHeight ||
        process.env.SHIPMOZO_DEFAULT_HEIGHT ||
        10
    ),

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
    JSON.stringify(body, null, 2)
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

/**
 * Automatically assign courier and generate AWB.
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

/**
 * Track shipment.
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

/**
 * Cancel shipment.
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