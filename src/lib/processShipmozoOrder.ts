import {
  pushShipmozoOrder,
  autoAssignShipmozoOrder,
} from "@/lib/shipmozo";

import Order from "@/models/Order";

function extractShipmozoOrderId(data: any) {
  return (
    data?.order_id ||
    data?.shipmozo_order_id ||
    data?.id ||
    data?.orderId ||
    ""
  );
}

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

export async function processShipmozoOrder(order: any) {
  // -----------------------------------------
  // 1. PUSH ORDER TO SHIPMOZO
  // -----------------------------------------

  const pushResponse = await pushShipmozoOrder(order);

  const shipmozoData = pushResponse?.data || {};

  const shipmozoOrderId =
    extractShipmozoOrderId(shipmozoData) ||
    order._id.toString();

  // Save Shipmozo order ID
  await Order.findByIdAndUpdate(order._id, {
    shipmozoOrderId: String(shipmozoOrderId),
    status: "Processing",
  });

  // -----------------------------------------
  // 2. AUTO ASSIGN COURIER
  // -----------------------------------------

  try {
    const assignResponse =
      await autoAssignShipmozoOrder(
        String(shipmozoOrderId)
      );

    const assignData =
      assignResponse?.data || {};

    const shipment =
      extractShipmentData(assignData);

    // Save courier + AWB
    await Order.findByIdAndUpdate(
      order._id,
      {
        shipmozoOrderId:
          String(shipmozoOrderId),

        trackingNumber:
          String(shipment.trackingNumber || ""),

        courierName:
          String(shipment.courierName || ""),

        estimatedDelivery:
          String(
            shipment.estimatedDelivery || ""
          ),

        status:
          shipment.trackingNumber
            ? "Shipped"
            : "Processing",
      }
    );
  } catch (error) {
    // Order is already created.
    // Courier failure should not cancel the order.
    console.error(
      "Shipmozo courier assignment failed:",
      error
    );
  }

  // -----------------------------------------
  // 3. RETURN UPDATED ORDER
  // -----------------------------------------

  const updatedOrder =
    (await Order.findById(order._id)) ||
    order;

  return updatedOrder;
}