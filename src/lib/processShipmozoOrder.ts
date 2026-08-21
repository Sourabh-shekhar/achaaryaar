// import {
//   pushShipmozoOrder,
//   autoAssignShipmozoOrder,
// } from "@/lib/shipmozo";

// import Order from "@/models/Order";

// /*
// |--------------------------------------------------------------------------
// | EXTRACT SHIPMOZO ORDER ID
// |--------------------------------------------------------------------------
// */

// function extractShipmozoOrderId(data: any) {
//   return (
//     data?.order_id ||
//     data?.shipmozo_order_id ||
//     data?.id ||
//     data?.orderId ||
//     ""
//   );
// }

// /*
// |--------------------------------------------------------------------------
// | EXTRACT SHIPMENT DATA
// |--------------------------------------------------------------------------
// */

// function extractShipmentData(data: any) {
//   return {
//     trackingNumber:
//       data?.awb_number ||
//       data?.awb ||
//       data?.tracking_number ||
//       data?.trackingNumber ||
//       data?.tracking ||
//       "",

//     courierName:
//       data?.courier_name ||
//       data?.courierName ||
//       data?.courier ||
//       "",

//     estimatedDelivery:
//       data?.estimated_delivery ||
//       data?.estimatedDelivery ||
//       data?.eta ||
//       "",
//   };
// }

// /*
// |--------------------------------------------------------------------------
// | PROCESS SHIPMOZO ORDER
// |--------------------------------------------------------------------------
// */

// export async function processShipmozoOrder(
//   order: any
// ) {
//   /*
//   |--------------------------------------------------------------------------
//   | 1. PUSH ORDER
//   |--------------------------------------------------------------------------
//   */

//   const pushResponse =
//     await pushShipmozoOrder(order);
//   console.log(
//     "FULL SHIPMOZO PUSH RESPONSE:",
//     JSON.stringify(pushResponse, null, 2)
//   );
//   const shipmozoData =
//     pushResponse?.data || {};

//   const shipmozoOrderId =
//     extractShipmozoOrderId(
//       shipmozoData
//     );
//   console.log(
//     "EXTRACTED SHIPMOZO ORDER ID:",
//     shipmozoOrderId
//   );

//   if (!shipmozoOrderId) {
//     throw new Error(
//       "Shipmozo did not return a valid Shipmozo order ID."
//     );
//   }

//   /*
//   |--------------------------------------------------------------------------
//   | 2. SAVE SHIPMOZO ORDER ID
//   |--------------------------------------------------------------------------
//   */

//   await Order.findByIdAndUpdate(
//     order._id,
//     {
//       shipmozoOrderId:
//         String(shipmozoOrderId),

//       status:
//         "Processing",
//     }
//   );

//   /*
//   |--------------------------------------------------------------------------
//   | 3. AUTO ASSIGN COURIER
//   |--------------------------------------------------------------------------
//   */

//   try {
//     const assignResponse =
//       await autoAssignShipmozoOrder(
//         String(shipmozoOrderId)
//       );

//     console.log(
//       "FULL SHIPMOZO AUTO-ASSIGN RESPONSE:",
//       JSON.stringify(assignResponse, null, 2)
//     );
//     const assignData =
//       assignResponse?.data || {};

//     const shipment =
//       extractShipmentData(
//         assignData
//       );

//     /*
//     |--------------------------------------------------------------------------
//     | 4. SAVE AWB + COURIER
//     |--------------------------------------------------------------------------
//     */

//     await Order.findByIdAndUpdate(
//       order._id,
//       {
//         shipmozoOrderId:
//           String(shipmozoOrderId),

//         trackingNumber:
//           String(
//             shipment.trackingNumber || ""
//           ),

//         courierName:
//           String(
//             shipment.courierName || ""
//           ),

//         estimatedDelivery:
//           String(
//             shipment.estimatedDelivery || ""
//           ),

//         status:
//           shipment.trackingNumber
//             ? "Shipped"
//             : "Processing",

//         shippingStatus:
//           shipment.trackingNumber
//             ? "Shipped"
//             : "Pending",
//       }
//     );
//   } catch (error) {
//     /*
//     |--------------------------------------------------------------------------
//     | IMPORTANT
//     |--------------------------------------------------------------------------
//     |
//     | Order is already successfully created.
//     | Courier assignment failure must NOT
//     | cancel the customer's paid order.
//     |
//     */

//     console.error(
//       "Shipmozo courier assignment failed:",
//       error
//     );
//   }

//   /*
//   |--------------------------------------------------------------------------
//   | 5. RETURN UPDATED ORDER
//   |--------------------------------------------------------------------------
//   */

//   const updatedOrder =
//     (await Order.findById(order._id)) ||
//     order;

//   return updatedOrder;
// }

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

function extractShipmozoOrderId(data: any): string {
  const source = data?.data || data || {};

  return String(
    source?.order_id ||
      source?.shipmozo_order_id ||
      source?.orderId ||
      source?.id ||
      source?.order?.id ||
      source?.order?.order_id ||
      ""
  ).trim();
}

/*
|--------------------------------------------------------------------------
| EXTRACT SHIPMENT DATA
|--------------------------------------------------------------------------
*/

function extractShipmentData(data: any) {
  const source = data?.data || data || {};

  return {
    trackingNumber: String(
      source?.awb_number ||
        source?.awb ||
        source?.tracking_number ||
        source?.trackingNumber ||
        source?.tracking ||
        source?.awbNumber ||
        ""
    ).trim(),

    courierName: String(
      source?.courier_name ||
        source?.courierName ||
        source?.courier ||
        source?.courier_partner ||
        ""
    ).trim(),

    estimatedDelivery: String(
      source?.estimated_delivery ||
        source?.estimatedDelivery ||
        source?.estimated_delivery_date ||
        source?.eta ||
        ""
    ).trim(),
  };
}

/*
|--------------------------------------------------------------------------
| PROCESS SHIPMOZO ORDER
|--------------------------------------------------------------------------
|
| This works for both:
| 1. Newly created paid orders
| 2. Previous orders that need to be pushed manually
|
*/

export async function processShipmozoOrder(order: any) {
  if (!order?._id) {
    throw new Error("Invalid order: order ID is missing.");
  }

  /*
  |--------------------------------------------------------------------------
  | 1. CHECK IF ALREADY PUSHED
  |--------------------------------------------------------------------------
  */

  if (
    order.shipmozoOrderId &&
    String(order.shipmozoOrderId).trim()
  ) {
    console.log(
      "Order already exists in Shipmozo:",
      order.shipmozoOrderId
    );

    return (
      (await Order.findById(order._id)) || order
    );
  }

  /*
  |--------------------------------------------------------------------------
  | 2. PUSH ORDER TO SHIPMOZO
  |--------------------------------------------------------------------------
  */

  console.log(
    "Pushing order to Shipmozo:",
    String(order._id)
  );

  const pushResponse =
    await pushShipmozoOrder(order);

  console.log(
    "FULL SHIPMOZO PUSH RESPONSE:",
    JSON.stringify(pushResponse, null, 2)
  );

  /*
  |--------------------------------------------------------------------------
  | 3. EXTRACT SHIPMOZO ORDER ID
  |--------------------------------------------------------------------------
  */

  const shipmozoOrderId =
    extractShipmozoOrderId(pushResponse);

  console.log(
    "EXTRACTED SHIPMOZO ORDER ID:",
    shipmozoOrderId
  );

  if (!shipmozoOrderId) {
    throw new Error(
      "Order was pushed to Shipmozo, but no valid Shipmozo order ID was found in the response."
    );
  }

  /*
  |--------------------------------------------------------------------------
  | 4. SAVE SHIPMOZO ORDER ID IMMEDIATELY
  |--------------------------------------------------------------------------
  |
  | Important:
  | Save this before auto-assigning the courier.
  | If auto-assignment fails, the order is still safely
  | recorded as successfully pushed.
  |
  */

  await Order.findByIdAndUpdate(
    order._id,
    {
      $set: {
        shipmozoOrderId:
          String(shipmozoOrderId),

        status: "Processing",

        shippingStatus: "Pending",
      },
    },
    { new: true }
  );

  /*
  |--------------------------------------------------------------------------
  | 5. AUTO ASSIGN COURIER
  |--------------------------------------------------------------------------
  */

  try {
    console.log(
      "Auto assigning Shipmozo order:",
      shipmozoOrderId
    );

    const assignResponse =
      await autoAssignShipmozoOrder(
        String(shipmozoOrderId)
      );

    console.log(
      "FULL SHIPMOZO AUTO-ASSIGN RESPONSE:",
      JSON.stringify(assignResponse, null, 2)
    );

    const shipment =
      extractShipmentData(assignResponse);

    /*
    |--------------------------------------------------------------------------
    | 6. SAVE SHIPMENT DETAILS
    |--------------------------------------------------------------------------
    */

    await Order.findByIdAndUpdate(
      order._id,
      {
        $set: {
          shipmozoOrderId:
            String(shipmozoOrderId),

          trackingNumber:
            shipment.trackingNumber || "",

          courierName:
            shipment.courierName || "",

          estimatedDelivery:
            shipment.estimatedDelivery || "",

          status: shipment.trackingNumber
            ? "Shipped"
            : "Processing",

          shippingStatus:
            shipment.trackingNumber
              ? "Shipped"
              : "Pending",
        },
      },
      { new: true }
    );

    console.log(
      "Shipmozo shipment details saved successfully."
    );
  } catch (error) {
    /*
    |--------------------------------------------------------------------------
    | PUSH SUCCESSFUL, AUTO ASSIGNMENT FAILED
    |--------------------------------------------------------------------------
    */

    console.error(
      "Shipmozo courier assignment failed:",
      error
    );

    // Keep the successfully pushed order in Processing status.
    await Order.findByIdAndUpdate(
      order._id,
      {
        $set: {
          shipmozoOrderId:
            String(shipmozoOrderId),

          status: "Processing",

          shippingStatus: "Pending",
        },
      }
    );
  }

  /*
  |--------------------------------------------------------------------------
  | 7. RETURN UPDATED ORDER
  |--------------------------------------------------------------------------
  */

  const updatedOrder =
    (await Order.findById(order._id)) ||
    order;

  return updatedOrder;
}