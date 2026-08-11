import {
  pushShipmozoOrder,
  autoAssignShipmozoOrder,
} from "@/lib/shipmozo";

import Order from "@/models/Order";

/*
|--------------------------------------------------------------------------
| EXTRACT SHIPMOZO ORDER ID
|--------------------------------------------------------------------------
*/

function extractShipmozoOrderId(data: any) {
  return (
    data?.order_id ||
    data?.shipmozo_order_id ||
    data?.id ||
    data?.orderId ||
    ""
  );
}

/*
|--------------------------------------------------------------------------
| EXTRACT SHIPMENT DATA
|--------------------------------------------------------------------------
*/

function extractShipmentData(data: any) {
  return {
    trackingNumber:
      data?.awb_number ||
      data?.awb ||
      data?.tracking_number ||
      data?.trackingNumber ||
      data?.tracking ||
      "",

    courierName:
      data?.courier_name ||
      data?.courierName ||
      data?.courier ||
      "",

    estimatedDelivery:
      data?.estimated_delivery ||
      data?.estimatedDelivery ||
      data?.eta ||
      "",
  };
}

/*
|--------------------------------------------------------------------------
| PROCESS SHIPMOZO ORDER
|--------------------------------------------------------------------------
*/

export async function processShipmozoOrder(
  order: any
) {
  /*
  |--------------------------------------------------------------------------
  | 1. PUSH ORDER
  |--------------------------------------------------------------------------
  */

  const pushResponse =
    await pushShipmozoOrder(order);

  const shipmozoData =
    pushResponse?.data || {};

  const shipmozoOrderId =
    extractShipmozoOrderId(
      shipmozoData
    );

  if (!shipmozoOrderId) {
    throw new Error(
      "Shipmozo did not return a valid Shipmozo order ID."
    );
  }

  /*
  |--------------------------------------------------------------------------
  | 2. SAVE SHIPMOZO ORDER ID
  |--------------------------------------------------------------------------
  */

  await Order.findByIdAndUpdate(
    order._id,
    {
      shipmozoOrderId:
        String(shipmozoOrderId),

      status:
        "Processing",
    }
  );

  /*
  |--------------------------------------------------------------------------
  | 3. AUTO ASSIGN COURIER
  |--------------------------------------------------------------------------
  */

  try {
    const assignResponse =
      await autoAssignShipmozoOrder(
        String(shipmozoOrderId)
      );

    console.log(
      "Shipmozo courier assignment response:",
      assignResponse
    );

    const assignData =
      assignResponse?.data || {};

    const shipment =
      extractShipmentData(
        assignData
      );

    /*
    |--------------------------------------------------------------------------
    | 4. SAVE AWB + COURIER
    |--------------------------------------------------------------------------
    */

    await Order.findByIdAndUpdate(
      order._id,
      {
        shipmozoOrderId:
          String(shipmozoOrderId),

        trackingNumber:
          String(
            shipment.trackingNumber || ""
          ),

        courierName:
          String(
            shipment.courierName || ""
          ),

        estimatedDelivery:
          String(
            shipment.estimatedDelivery || ""
          ),

        status:
          shipment.trackingNumber
            ? "Shipped"
            : "Processing",

        shippingStatus:
          shipment.trackingNumber
            ? "Shipped"
            : "Pending",
      }
    );
  } catch (error) {
    /*
    |--------------------------------------------------------------------------
    | IMPORTANT
    |--------------------------------------------------------------------------
    |
    | Order is already successfully created.
    | Courier assignment failure must NOT
    | cancel the customer's paid order.
    |
    */

    console.error(
      "Shipmozo courier assignment failed:",
      error
    );
  }

  /*
  |--------------------------------------------------------------------------
  | 5. RETURN UPDATED ORDER
  |--------------------------------------------------------------------------
  */

  const updatedOrder =
    (await Order.findById(order._id)) ||
    order;

  return updatedOrder;
}