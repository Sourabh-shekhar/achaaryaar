// "use client";
// import AdminAnalytics from "@/components/AdminAnalytics";
// import { useEffect, useRef, useState } from "react";
// import { useRouter } from "next/navigation";
// import { signOut } from "next-auth/react";

// export default function AdminOrdersPage() {
//     const [orders, setOrders] = useState<any[]>([]);
//     const [searchTerm, setSearchTerm] = useState("");
//     const [statusFilter, setStatusFilter] = useState("All");
//     const [latestSeenOrderId, setLatestSeenOrderId] = useState("");
//     const [newOrderAlert, setNewOrderAlert] = useState<any | null>(null);
//     const [pushingOrderId, setPushingOrderId] = useState("");
//     const latestSeenOrderIdRef = useRef("");
//     const router = useRouter();

//     useEffect(() => {
//     fetchOrders();

//     const timer = setInterval(fetchOrders, 30000);

//     return () => clearInterval(timer);
// }, []);

//     const fetchOrders = async () => {
//         try {
//             const res = await fetch("/api/orders");
//             const data = await res.json();

//             if (data.success) {
//                 const nextOrders = data.orders || [];
//                 const newest = nextOrders[0];

//                 if (latestSeenOrderIdRef.current && newest?._id && newest._id !== latestSeenOrderIdRef.current) {
//                     setNewOrderAlert(newest);
//                 }

//                 if (newest?._id) {
//                     latestSeenOrderIdRef.current = newest._id;
//                     setLatestSeenOrderId(newest._id);
//                 }

//                 setOrders(nextOrders);
//             }
//         } catch (error) {
//             console.error("Failed to fetch orders:", error);
//         }
//     };
//     const updateStatus = async (
//         id: string,
//         status: string
//     ) => {
//         console.log("Updating:", id, status);
//         try {
//             const res = await fetch(`/api/orders/${id}`, {
//                 method: "PATCH",
//                 headers: {
//                     "Content-Type": "application/json",
//                 },
//                 body: JSON.stringify({ status }),
//             });

//             const data = await res.json();
//             console.log("Response:", data);


//             if (data.success) {
//                 fetchOrders();
//             }
//         } catch (error) {
//             console.error(error);
//         }
//     };
//     const deleteOrder = async (id: string) => {
//         const confirmDelete = confirm(
//             "Are you sure you want to delete this order?"
//         );

//         if (!confirmDelete) return;

//         try {
//             const res = await fetch(`/api/orders/${id}`, {
//                 method: "DELETE",
//             });

//             const data = await res.json();

//             if (data.success) {
//                 alert("Order deleted successfully");
//                 fetchOrders();
//             }
//         } catch (error) {
//             console.error(error);
//             alert("Failed to delete order");
//         }
//     };
//     const totalOrders = orders.length;
// const retryShipmozo = async (orderId: string) => {
//     const confirmPush = confirm(
//         "Do you want to push this order to Shipmozo?"
//     );

//     if (!confirmPush) return;

//     try {
//         setPushingOrderId(orderId);

//         console.log(
//             "Pushing order to Shipmozo:",
//             orderId
//         );

//         const res = await fetch(
//             "/api/admin/shipmozo/retry",
//             {
//                 method: "POST",
//                 headers: {
//                     "Content-Type": "application/json",
//                 },
//                 body: JSON.stringify({
//                     orderId,
//                 }),
//             }
//         );

//         const data = await res.json();

//         console.log(
//             "Shipmozo response:",
//             data
//         );

//         if (!res.ok || !data.success) {
//             alert(
//                 data.message ||
//                 "Failed to push order to Shipmozo."
//             );
//             return;
//         }

//         alert(
//             data.message ||
//             "Order successfully pushed to Shipmozo."
//         );

//         await fetchOrders();

//     } catch (error) {
//         console.error(
//             "Shipmozo push error:",
//             error
//         );

//         alert(
//             "Something went wrong while pushing the order to Shipmozo."
//         );
//     } finally {
//         setPushingOrderId("");
//     }
// };
//     const pendingOrders = orders.filter(
//         (order: any) => order.status === "Pending"
//     ).length;
//     const newOrders = orders.filter(
//         (order: any) => order.status === "Pending" || order.status === "Processing"
//     );

//     const deliveredOrders = orders.filter(
//         (order: any) => order.status === "Delivered"
//     ).length;

//     const totalRevenue = orders.reduce(
//         (total: number, order: any) => total + (order.total || 0),
//         0
//     );
//     const filteredOrders = orders.filter((order: any) => {

//         const matchesSearch =
//             (order.fullName || "")
//                 .toLowerCase()
//                 .includes(searchTerm.toLowerCase()) ||
//             (order.phone || "")
//                 .toString()
//                 .includes(searchTerm);

//         const matchesStatus =
//             statusFilter === "All" ||
//             order.status === statusFilter;

//         return matchesSearch && matchesStatus;
//     });
//     return (
//         <div className="min-h-screen bg-gray-100 p-8">
//             {newOrderAlert && (
//                 <div className="fixed right-6 top-6 z-50 w-[min(360px,calc(100vw-3rem))] rounded-2xl border border-green-200 bg-white p-5 shadow-2xl">
//                     <p className="text-xs font-bold uppercase tracking-wide text-green-700">
//                         New order received
//                     </p>
//                     <h2 className="mt-2 text-xl font-bold text-gray-900">
//                         {newOrderAlert.fullName || "Customer"}
//                     </h2>
//                     <p className="mt-1 text-sm text-gray-600">
//                         Total: ₹{newOrderAlert.total || 0}
//                     </p>
//                     <button
//                         type="button"
//                         onClick={() => setNewOrderAlert(null)}
//                         className="mt-4 rounded-xl bg-green-600 px-4 py-2 font-bold text-white"
//                     >
//                         View in orders
//                     </button>
//                 </div>
//             )}
//             <div className="flex justify-between items-center mb-8">
//                 <h1 className="text-4xl font-bold text-gray-900">
//                     Admin Orders Dashboard
//                 </h1>

//                 <button
//                     onClick={() => {
//                         localStorage.removeItem("isAdmin");
//                         router.push("/admin/login");
//                     }}
//                     className="bg-red-600 text-white px-5 py-2 rounded-xl font-semibold hover:bg-red-700"
//                 >
//                     Logout
//                 </button>
//             </div>
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">

//                 <div className="bg-white p-6 rounded-2xl shadow-lg border">
//                     <h3 className="text-gray-500 text-lg">
//                         Total Orders
//                     </h3>

//                     <p className="text-4xl font-bold text-blue-600 mt-2">
//                         {totalOrders}
//                     </p>
//                 </div>

//                 <div className="bg-white p-6 rounded-2xl shadow-lg border">
//                     <h3 className="text-gray-500 text-lg">
//                         Pending Orders
//                     </h3>

//                     <p className="text-4xl font-bold text-yellow-500 mt-2">
//                         {pendingOrders}
//                     </p>
//                 </div>

//                 <div className="bg-white p-6 rounded-2xl shadow-lg border">
//                     <h3 className="text-gray-500 text-lg">
//                         Delivered Orders
//                     </h3>

//                     <p className="text-4xl font-bold text-green-600 mt-2">
//                         {deliveredOrders}
//                     </p>
//                 </div>

//                 <div className="bg-white p-6 rounded-2xl shadow-lg border">
//                     <h3 className="text-gray-500 text-lg">
//                         Total Revenue
//                     </h3>

//                     <p className="text-4xl font-bold text-orange-600 mt-2">
//                         ₹{totalRevenue}
//                     </p>
//                 </div>

//             </div>
//             <div className="mb-8 rounded-2xl border border-orange-200 bg-white p-5 shadow-lg">
//                 <div className="mb-4 flex items-center justify-between">
//                     <h2 className="text-xl font-bold text-gray-900">
//                         New / Pending Orders
//                     </h2>
//                     <span className="rounded-full bg-orange-100 px-3 py-1 text-sm font-bold text-orange-700">
//                         {newOrders.length}
//                     </span>
//                 </div>

//                 {newOrders.length === 0 ? (
//                     <p className="text-sm text-gray-600">No new pending orders.</p>
//                 ) : (
//                     <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
//                         {newOrders.slice(0, 6).map((order: any) => (
//                             <div
//                                 key={order._id}
//                                 className="rounded-xl border border-gray-200 bg-orange-50 p-4"
//                             >
//                                 <p className="font-bold text-gray-900">
//                                     {order.fullName || "Customer"}
//                                 </p>
//                                 <p className="text-sm text-gray-700">
//                                     {order.phone || order.email || "No contact"}
//                                 </p>
//                                 <p className="mt-2 text-sm font-bold text-orange-700">
//                                     ₹{order.total || 0} · {order.status}
//                                 </p>
//                             </div>
//                         ))}
//                     </div>
//                 )}
//             </div>
//             <div className="flex flex-col md:flex-row gap-4 mb-6">

//                 <input
//                     type="text"
//                     placeholder="Search by customer name or phone..."
//                     value={searchTerm}
//                     onChange={(e) => setSearchTerm(e.target.value)}
//                     className="flex-1 p-4 rounded-2xl border border-gray-300 shadow-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
//                 />

//                 <select
//                     value={statusFilter}
//                     onChange={(e) => setStatusFilter(e.target.value)}
//                     className="p-4 rounded-2xl border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
//                 >
//                     <option value="All">All Orders</option>
//                     <option value="Pending">Pending</option>
//                     <option value="Confirmed">Confirmed</option>
//                     <option value="Shipped">Shipped</option>
//                     <option value="Delivered">Delivered</option>
//                 </select>

//             </div>
//             <AdminAnalytics orders={orders} />
//             {filteredOrders.length === 0 ? (
//                 <div className="bg-white rounded-2xl shadow-md p-6">
//                     <p className="text-lg text-gray-700">
//                         No orders found.
//                     </p>
//                 </div>
//             ) : (
//                 <div className="space-y-6">
//                     {filteredOrders.map((order: any) => (
//                         <div
//                             key={order._id}
//                             className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200"
//                         >
//                             <h2 className="text-2xl font-bold text-gray-900 mb-4">
//                                 {order.fullName || order.name || "No Name"}
//                             </h2>

//                             <div className="space-y-2">
//                                 <p className="text-gray-800">
//                                     <strong className="text-gray-900">
//                                         Phone:
//                                     </strong>{" "}
//                                     {order.phone}
//                                 </p>

//                                 <p className="text-gray-800">
//                                     <strong className="text-gray-900">
//                                         Address:
//                                     </strong>{" "}
//                                     {order.address}
//                                 </p>

//                                 <p className="text-gray-800">
//                                     <strong className="text-gray-900">
//                                         City:
//                                     </strong>{" "}
//                                     {order.city}
//                                 </p>

//                                 <p className="text-gray-800">
//                                     <strong className="text-gray-900">
//                                         Pincode:
//                                     </strong>{" "}
//                                     {order.pincode}
//                                 </p>

//                                 <p className="text-gray-800">
//                                     <strong className="text-gray-900">
//                                         Payment:
//                                     </strong>{" "}
//                                     {order.paymentMethod}
//                                 </p>

//                                 <div className="flex items-center gap-4 mt-4">
//                                     <label className="font-bold text-gray-900">
//                                         Status:
//                                     </label>

//                                     <select
//                                         value={order.status}
//                                         onChange={(e) =>
//                                             updateStatus(order._id, e.target.value)
//                                         }
//                                         className={`border rounded-lg px-3 py-2 font-semibold ${order.status === "Pending"
//                                             ? "bg-yellow-100 text-yellow-800"
//                                             : order.status === "Confirmed"
//                                                 ? "bg-blue-100 text-blue-800"
//                                                 : order.status === "Shipped"
//                                                     ? "bg-purple-100 text-purple-800"
//                                                     : order.status === "Delivered"
//                                                         ? "bg-green-100 text-green-800"
//                                                         : "bg-gray-100 text-gray-800"
//                                             }`}
//                                     >
//                                         <option value="Pending">Pending</option>
//                                         <option value="Confirmed">Confirmed</option>
//                                         <option value="Shipped">Shipped</option>
//                                         <option value="Delivered">Delivered</option>
//                                     </select>
//                                 </div>
//                             </div>

//                             <div className="mt-6">
//                                 <h3 className="text-xl font-bold text-gray-900 mb-3">
//                                     Ordered Products
//                                 </h3>

//                                 <div className="space-y-3">
//                                     {order.items?.map((item: any, index: number) => (
//                                         <div
//                                             key={index}
//                                             className="border rounded-xl p-4 bg-gray-50"
//                                         >
//                                             <p className="font-semibold text-gray-900">
//                                                 {item.name}
//                                             </p>

//                                             <p className="text-gray-700">
//                                                 Variant: {item.selectedVariant || item.quantityType || "N/A"}
//                                             </p>

//                                             <p className="text-gray-700">
//                                                 Quantity Ordered: {item.quantity}
//                                             </p>

//                                             <p className="text-gray-700">
//                                                 Price: ₹{item.price}
//                                             </p>

//                                             <p className="text-gray-700">
//                                                 Total: ₹{item.price * item.quantity}
//                                             </p>
//                                         </div>
//                                     ))}
//                                 </div>
//                             </div>

//                             <div className="flex justify-between items-center mt-6">
//                                 <p className="text-sm text-gray-500">
//                                     Order ID: {order._id}
//                                 </p>
//                                 <button
//                                     onClick={() =>
//                                         window.open(
//                                             `/admin/invoice/${order._id}`,
//                                             "_blank"
//                                         )
//                                     }
//                                     className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 mr-3"
//                                 >
//                                     Print Invoice
//                                 </button>
//                                 <button
//                                     onClick={() => deleteOrder(order._id)}
//                                     className="bg-red-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-700"
//                                 >
//                                     Delete Order
//                                 </button>
//                             </div>
//                         </div>
//                     ))}
//                 </div>
//             )}
//         </div>
//     );
// }
"use client";

import AdminAnalytics from "@/components/AdminAnalytics";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [newOrderAlert, setNewOrderAlert] = useState<any | null>(null);
  const [pushingOrderId, setPushingOrderId] = useState("");

  const latestSeenOrderIdRef = useRef("");

  const router = useRouter();

  // ----------------------------------------------------
  // FETCH ORDERS
  // ----------------------------------------------------

  const fetchOrders = async () => {
    try {
      const res = await fetch("/api/orders", {
        cache: "no-store",
      });

      const data = await res.json();

      if (data.success) {
        const nextOrders = data.orders || [];
        const newest = nextOrders[0];

        if (
          latestSeenOrderIdRef.current &&
          newest?._id &&
          newest._id !== latestSeenOrderIdRef.current
        ) {
          setNewOrderAlert(newest);
        }

        if (newest?._id) {
          latestSeenOrderIdRef.current = newest._id;
        }

        setOrders(nextOrders);
      }
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    }
  };

  // ----------------------------------------------------
  // INITIAL FETCH + AUTO REFRESH
  // ----------------------------------------------------

  useEffect(() => {
    fetchOrders();

    const timer = setInterval(() => {
      fetchOrders();
    }, 30000);

    return () => clearInterval(timer);
  }, []);

  // ----------------------------------------------------
  // UPDATE ORDER STATUS
  // ----------------------------------------------------

  const updateStatus = async (
    id: string,
    status: string
  ) => {
    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });

      const data = await res.json();

      console.log("Status update response:", data);

      if (data.success) {
        await fetchOrders();
      } else {
        alert(data.message || "Failed to update order status.");
      }
    } catch (error) {
      console.error("Failed to update status:", error);
      alert("Failed to update order status.");
    }
  };

  // ----------------------------------------------------
  // PUSH / RETRY ORDER TO SHIPMOZO
  // ----------------------------------------------------

  const pushToShipmozo = async (orderId: string) => {
    try {
      setPushingOrderId(orderId);

      const confirmPush = confirm(
        "Do you want to push this order to Shipmozo?"
      );

      if (!confirmPush) {
        return;
      }

      console.log(
        "Pushing order to Shipmozo:",
        orderId
      );

      const res = await fetch(
        "/api/shipmozo/retry",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            orderId,
          }),
        }
      );

      const data = await res.json();

      console.log(
        "Shipmozo retry response:",
        data
      );

      if (!res.ok || !data.success) {
        throw new Error(
          data.message ||
            "Failed to push order to Shipmozo."
        );
      }

      if (data.alreadyProcessed) {
        alert(
          "This order is already pushed to Shipmozo."
        );
      } else {
        alert(
          "Order successfully pushed to Shipmozo."
        );
      }

      await fetchOrders();
    } catch (error) {
      console.error(
        "Shipmozo push failed:",
        error
      );

      alert(
        error instanceof Error
          ? error.message
          : "Failed to push order to Shipmozo."
      );
    } finally {
      setPushingOrderId("");
    }
  };

  // ----------------------------------------------------
  // DELETE ORDER
  // ----------------------------------------------------

  const deleteOrder = async (id: string) => {
    const confirmDelete = confirm(
      "Are you sure you want to delete this order?"
    );

    if (!confirmDelete) return;

    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (data.success) {
        alert("Order deleted successfully");
        await fetchOrders();
      } else {
        alert(
          data.message || "Failed to delete order"
        );
      }
    } catch (error) {
      console.error(error);
      alert("Failed to delete order");
    }
  };

  // ----------------------------------------------------
  // STATISTICS
  // ----------------------------------------------------

  const totalOrders = orders.length;

  const pendingOrders = orders.filter(
    (order: any) =>
      order.status === "Pending" ||
      order.status === "Processing"
  ).length;

  const newOrders = orders.filter(
    (order: any) =>
      order.status === "Pending" ||
      order.status === "Processing"
  );

  const deliveredOrders = orders.filter(
    (order: any) =>
      order.status === "Delivered"
  ).length;

  const totalRevenue = orders.reduce(
    (total: number, order: any) =>
      total + (Number(order.total) || 0),
    0
  );

  // ----------------------------------------------------
  // FILTER ORDERS
  // ----------------------------------------------------

  const filteredOrders = orders.filter(
    (order: any) => {
      const search = searchTerm.toLowerCase();

      const matchesSearch =
        (order.fullName || "")
          .toLowerCase()
          .includes(search) ||
        (order.phone || "")
          .toString()
          .includes(search) ||
        (order.email || "")
          .toLowerCase()
          .includes(search) ||
        (order._id || "")
          .toString()
          .includes(search);

      const matchesStatus =
        statusFilter === "All" ||
        order.status === statusFilter;

      return (
        matchesSearch &&
        matchesStatus
      );
    }
  );

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8">
      {/* ------------------------------------------------ */}
      {/* NEW ORDER ALERT */}
      {/* ------------------------------------------------ */}

      {newOrderAlert && (
        <div className="fixed right-6 top-6 z-50 w-[min(360px,calc(100vw-3rem))] rounded-2xl border border-green-200 bg-white p-5 shadow-2xl">
          <p className="text-xs font-bold uppercase tracking-wide text-green-700">
            New order received
          </p>

          <h2 className="mt-2 text-xl font-bold text-gray-900">
            {newOrderAlert.fullName || "Customer"}
          </h2>

          <p className="mt-1 text-sm text-gray-600">
            Total: ₹{newOrderAlert.total || 0}
          </p>

          <button
            type="button"
            onClick={() =>
              setNewOrderAlert(null)
            }
            className="mt-4 rounded-xl bg-green-600 px-4 py-2 font-bold text-white"
          >
            Close
          </button>
        </div>
      )}

      {/* ------------------------------------------------ */}
      {/* HEADER */}
      {/* ------------------------------------------------ */}

      <div className="mb-8 flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900 md:text-4xl">
          Admin Orders Dashboard
        </h1>

        <button
          onClick={() => {
            localStorage.removeItem("isAdmin");
            router.push("/admin/login");
          }}
          className="rounded-xl bg-red-600 px-5 py-2 font-semibold text-white hover:bg-red-700"
        >
          Logout
        </button>
      </div>

      {/* ------------------------------------------------ */}
      {/* STATS */}
      {/* ------------------------------------------------ */}

      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border bg-white p-6 shadow-lg">
          <h3 className="text-lg text-gray-500">
            Total Orders
          </h3>

          <p className="mt-2 text-4xl font-bold text-blue-600">
            {totalOrders}
          </p>
        </div>

        <div className="rounded-2xl border bg-white p-6 shadow-lg">
          <h3 className="text-lg text-gray-500">
            Pending / Processing
          </h3>

          <p className="mt-2 text-4xl font-bold text-yellow-500">
            {pendingOrders}
          </p>
        </div>

        <div className="rounded-2xl border bg-white p-6 shadow-lg">
          <h3 className="text-lg text-gray-500">
            Delivered Orders
          </h3>

          <p className="mt-2 text-4xl font-bold text-green-600">
            {deliveredOrders}
          </p>
        </div>

        <div className="rounded-2xl border bg-white p-6 shadow-lg">
          <h3 className="text-lg text-gray-500">
            Total Revenue
          </h3>

          <p className="mt-2 text-4xl font-bold text-orange-600">
            ₹{totalRevenue}
          </p>
        </div>
      </div>

      {/* ------------------------------------------------ */}
      {/* NEW / PROCESSING ORDERS */}
      {/* ------------------------------------------------ */}

      <div className="mb-8 rounded-2xl border border-orange-200 bg-white p-5 shadow-lg">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">
            New / Processing Orders
          </h2>

          <span className="rounded-full bg-orange-100 px-3 py-1 text-sm font-bold text-orange-700">
            {newOrders.length}
          </span>
        </div>

        {newOrders.length === 0 ? (
          <p className="text-sm text-gray-600">
            No new pending orders.
          </p>
        ) : (
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {newOrders
              .slice(0, 6)
              .map((order: any) => (
                <div
                  key={order._id}
                  className="rounded-xl border border-gray-200 bg-orange-50 p-4"
                >
                  <p className="font-bold text-gray-900">
                    {order.fullName || "Customer"}
                  </p>

                  <p className="text-sm text-gray-700">
                    {order.phone ||
                      order.email ||
                      "No contact"}
                  </p>

                  <p className="mt-2 text-sm font-bold text-orange-700">
                    ₹{order.total || 0} ·{" "}
                    {order.status}
                  </p>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* ------------------------------------------------ */}
      {/* SEARCH + FILTER */}
      {/* ------------------------------------------------ */}

      <div className="mb-6 flex flex-col gap-4 md:flex-row">
        <input
          type="text"
          placeholder="Search by name, phone, email or order ID..."
          value={searchTerm}
          onChange={(e) =>
            setSearchTerm(e.target.value)
          }
          className="flex-1 rounded-2xl border border-gray-300 p-4 text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
        />

        <select
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(e.target.value)
          }
          className="rounded-2xl border border-gray-300 p-4 text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
        >
          <option value="All">
            All Orders
          </option>
          <option value="Pending">
            Pending
          </option>
          <option value="Processing">
            Processing
          </option>
          <option value="Confirmed">
            Confirmed
          </option>
          <option value="Shipped">
            Shipped
          </option>
          <option value="Delivered">
            Delivered
          </option>
        </select>
      </div>

      {/* ------------------------------------------------ */}
      {/* ANALYTICS */}
      {/* ------------------------------------------------ */}

      <AdminAnalytics orders={orders} />

      {/* ------------------------------------------------ */}
      {/* ORDERS */}
      {/* ------------------------------------------------ */}

      {filteredOrders.length === 0 ? (
        <div className="rounded-2xl bg-white p-6 shadow-md">
          <p className="text-lg text-gray-700">
            No orders found.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredOrders.map(
            (order: any) => {
              const isPushing =
                pushingOrderId === order._id;

              const isPushed =
                Boolean(
                  order.shipmozoOrderId
                );

              return (
                <div
                  key={order._id}
                  className="rounded-2xl border border-gray-200 bg-white p-6 shadow-lg"
                >
                  <div className="mb-4 flex flex-col justify-between gap-3 md:flex-row md:items-start">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">
                        {order.fullName ||
                          order.name ||
                          "No Name"}
                      </h2>

                      <p className="mt-1 text-sm text-gray-500">
                        Order ID: {order._id}
                      </p>
                    </div>

                    {/* SHIPMOZO STATUS */}

                    {isPushed ? (
                      <div className="rounded-xl bg-green-100 px-4 py-2 text-sm font-bold text-green-700">
                        ✓ Pushed to Shipmozo
                      </div>
                    ) : (
                      <div className="rounded-xl bg-red-100 px-4 py-2 text-sm font-bold text-red-700">
                        Not pushed to Shipmozo
                      </div>
                    )}
                  </div>

                  {/* CUSTOMER DETAILS */}

                  <div className="space-y-2">
                    <p className="text-gray-800">
                      <strong className="text-gray-900">
                        Phone:
                      </strong>{" "}
                      {order.phone || "N/A"}
                    </p>

                    <p className="text-gray-800">
                      <strong className="text-gray-900">
                        Email:
                      </strong>{" "}
                      {order.email || "N/A"}
                    </p>

                    <p className="text-gray-800">
                      <strong className="text-gray-900">
                        Address:
                      </strong>{" "}
                      {order.address || "N/A"}
                    </p>

                    <p className="text-gray-800">
                      <strong className="text-gray-900">
                        City:
                      </strong>{" "}
                      {order.city || "N/A"}
                    </p>

                    <p className="text-gray-800">
                      <strong className="text-gray-900">
                        State:
                      </strong>{" "}
                      {order.state || "N/A"}
                    </p>

                    <p className="text-gray-800">
                      <strong className="text-gray-900">
                        Pincode:
                      </strong>{" "}
                      {order.pincode || "N/A"}
                    </p>

                    <p className="text-gray-800">
                      <strong className="text-gray-900">
                        Payment:
                      </strong>{" "}
                      {order.paymentMethod || "PREPAID"}
                    </p>

                    <p className="text-gray-800">
                      <strong className="text-gray-900">
                        Payment Status:
                      </strong>{" "}
                      {order.paymentStatus || "N/A"}
                    </p>

                    <p className="text-gray-800">
                      <strong className="text-gray-900">
                        Total:
                      </strong>{" "}
                      ₹{order.total || 0}
                    </p>

                    {/* SHIPMOZO DETAILS */}

                    {order.shipmozoOrderId && (
                      <p className="text-gray-800">
                        <strong className="text-gray-900">
                          Shipmozo Order ID:
                        </strong>{" "}
                        {order.shipmozoOrderId}
                      </p>
                    )}

                    {order.courierName && (
                      <p className="text-gray-800">
                        <strong className="text-gray-900">
                          Courier:
                        </strong>{" "}
                        {order.courierName}
                      </p>
                    )}

                    {order.trackingNumber && (
                      <p className="text-gray-800">
                        <strong className="text-gray-900">
                          AWB / Tracking:
                        </strong>{" "}
                        {order.trackingNumber}
                      </p>
                    )}

                    {/* STATUS */}

                    <div className="mt-4 flex items-center gap-4">
                      <label className="font-bold text-gray-900">
                        Status:
                      </label>

                      <select
                        value={
                          order.status || "Processing"
                        }
                        onChange={(e) =>
                          updateStatus(
                            order._id,
                            e.target.value
                          )
                        }
                        className={`rounded-lg border px-3 py-2 font-semibold ${
                          order.status === "Pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : order.status ===
                              "Processing"
                            ? "bg-orange-100 text-orange-800"
                            : order.status ===
                              "Confirmed"
                            ? "bg-blue-100 text-blue-800"
                            : order.status ===
                              "Shipped"
                            ? "bg-purple-100 text-purple-800"
                            : order.status ===
                              "Delivered"
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        <option value="Pending">
                          Pending
                        </option>

                        <option value="Processing">
                          Processing
                        </option>

                        <option value="Confirmed">
                          Confirmed
                        </option>

                        <option value="Shipped">
                          Shipped
                        </option>

                        <option value="Delivered">
                          Delivered
                        </option>
                      </select>
                    </div>
                  </div>

                  {/* PRODUCTS */}

                  <div className="mt-6">
                    <h3 className="mb-3 text-xl font-bold text-gray-900">
                      Ordered Products
                    </h3>

                    <div className="space-y-3">
                      {order.items?.map(
                        (
                          item: any,
                          index: number
                        ) => (
                          <div
                            key={index}
                            className="rounded-xl border bg-gray-50 p-4"
                          >
                            <p className="font-semibold text-gray-900">
                              {item.name ||
                                item.productName ||
                                "Product"}
                            </p>

                            <p className="text-gray-700">
                              Variant:{" "}
                              {item.selectedVariant ||
                                item.size ||
                                item.quantityType ||
                                "N/A"}
                            </p>

                            <p className="text-gray-700">
                              Quantity Ordered:{" "}
                              {item.quantity || 1}
                            </p>

                            <p className="text-gray-700">
                              Price: ₹
                              {item.price ||
                                item.unitPrice ||
                                0}
                            </p>

                            <p className="text-gray-700">
                              Total: ₹
                              {(Number(
                                item.price ||
                                  item.unitPrice ||
                                  0
                              ) || 0) *
                                (Number(
                                  item.quantity || 1
                                ) || 1)}
                            </p>
                          </div>
                        )
                      )}
                    </div>
                  </div>

                  {/* ACTION BUTTONS */}

                  <div className="mt-6 flex flex-wrap items-center gap-3">
                    {/* PUSH TO SHIPMOZO */}

                    <button
                      onClick={() =>
                        pushToShipmozo(
                          order._id
                        )
                      }
                      disabled={
                        isPushing || isPushed
                      }
                      className={`rounded-lg px-4 py-2 font-semibold text-white ${
                        isPushed
                          ? "cursor-not-allowed bg-gray-400"
                          : isPushing
                          ? "cursor-wait bg-orange-400"
                          : "bg-orange-600 hover:bg-orange-700"
                      }`}
                    >
                      {isPushing
                        ? "Pushing..."
                        : isPushed
                        ? "✓ Already in Shipmozo"
                        : "Push to Shipmozo"}
                    </button>

                    {/* PRINT INVOICE */}

                    <button
                      onClick={() =>
                        window.open(
                          `/admin/invoice/${order._id}`,
                          "_blank"
                        )
                      }
                      className="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700"
                    >
                      Print Invoice
                    </button>

                    {/* DELETE */}

                    <button
                      onClick={() =>
                        deleteOrder(order._id)
                      }
                      className="rounded-lg bg-red-600 px-4 py-2 font-semibold text-white hover:bg-red-700"
                    >
                      Delete Order
                    </button>
                  </div>
                </div>
              );
            }
          )}
        </div>
      )}
    </div>
  );
}

