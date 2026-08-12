"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminDashboardPage() {
  const router = useRouter();

  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const [productsRes, ordersRes] = await Promise.all([
        fetch("/api/products"),
        fetch("/api/orders"),
      ]);

      const productsData = await productsRes.json();
      const ordersData = await ordersRes.json();

      if (productsData.success) {
        setProducts(productsData.products || []);
      }

      if (ordersData.success) {
        setOrders(ordersData.orders || []);
      }
    } catch (error) {
      console.error("Failed to load dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const totalProducts = products.length;

  const totalOrders = orders.length;

  const pendingOrders = orders.filter(
    (order) =>
      order.status === "Pending" ||
      order.status === "Processing" ||
      order.status === "Confirmed"
  ).length;

  const deliveredOrders = orders.filter(
    (order) => order.status === "Delivered"
  ).length;

  const totalRevenue = orders.reduce(
    (total, order) => total + (Number(order.total) || 0),
    0
  );

  const recentOrders = orders.slice(0, 5);

  const handleLogout = () => {
    localStorage.removeItem("isAdmin");
    router.push("/admin/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-lg font-semibold text-gray-700">
          Loading dashboard...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6 md:p-8">
      {/* HEADER */}

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
            Admin Dashboard
          </h1>

          <p className="text-gray-600 mt-1">
            Manage your AchaarYaar inventory and orders from one place.
          </p>
        </div>

        <button
          onClick={handleLogout}
          className="bg-red-600 text-white px-5 py-3 rounded-xl font-semibold hover:bg-red-700"
        >
          Logout
        </button>
      </div>

      {/* STATISTICS */}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">

        <div className="bg-white rounded-2xl p-6 shadow border">
          <p className="text-sm font-semibold text-gray-500">
            Total Products
          </p>

          <p className="text-4xl font-bold text-blue-600 mt-2">
            {totalProducts}
          </p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow border">
          <p className="text-sm font-semibold text-gray-500">
            Total Orders
          </p>

          <p className="text-4xl font-bold text-purple-600 mt-2">
            {totalOrders}
          </p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow border">
          <p className="text-sm font-semibold text-gray-500">
            Active / Pending Orders
          </p>

          <p className="text-4xl font-bold text-orange-500 mt-2">
            {pendingOrders}
          </p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow border">
          <p className="text-sm font-semibold text-gray-500">
            Delivered Orders
          </p>

          <p className="text-4xl font-bold text-green-600 mt-2">
            {deliveredOrders}
          </p>
        </div>

      </div>

      {/* REVENUE */}

      <div className="bg-white rounded-2xl p-6 shadow border mb-8">
        <p className="text-sm font-semibold text-gray-500">
          Total Revenue
        </p>

        <p className="text-4xl font-bold text-green-700 mt-2">
          ₹{totalRevenue.toLocaleString("en-IN")}
        </p>
      </div>

      {/* MANAGEMENT BUTTONS */}

      <h2 className="text-2xl font-bold text-gray-900 mb-5">
        Management
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">

        {/* PRODUCTS */}

        <button
          onClick={() => router.push("/admin/products")}
          className="bg-white rounded-2xl p-7 shadow border text-left hover:shadow-xl transition"
        >
          <div className="text-4xl mb-4">📦</div>

          <h3 className="text-xl font-bold text-gray-900">
            Inventory Management
          </h3>

          <p className="text-gray-600 mt-2">
            Add products, edit prices, manage weights and update stock.
          </p>

          <p className="text-orange-600 font-bold mt-5">
            Manage Products →
          </p>
        </button>

        {/* ORDERS */}

        <button
          onClick={() => router.push("/admin/orders")}
          className="bg-white rounded-2xl p-7 shadow border text-left hover:shadow-xl transition"
        >
          <div className="text-4xl mb-4">🛒</div>

          <h3 className="text-xl font-bold text-gray-900">
            Order Management
          </h3>

          <p className="text-gray-600 mt-2">
            View customer orders, update order status and print invoices.
          </p>

          <p className="text-orange-600 font-bold mt-5">
            Manage Orders →
          </p>
        </button>

        {/* COUPONS */}

        <button
          onClick={() => router.push("/admin/coupons")}
          className="bg-white rounded-2xl p-7 shadow border text-left hover:shadow-xl transition"
        >
          <div className="text-4xl mb-4">🎟️</div>

          <h3 className="text-xl font-bold text-gray-900">
            Coupons
          </h3>

          <p className="text-gray-600 mt-2">
            Create and manage discount coupons for your customers.
          </p>

          <p className="text-orange-600 font-bold mt-5">
            Manage Coupons →
          </p>
        </button>

      </div>

      {/* RECENT ORDERS */}

      <div className="bg-white rounded-2xl shadow border overflow-hidden">
        <div className="p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Recent Orders
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              Latest 5 customer orders
            </p>
          </div>

          <button
            onClick={() => router.push("/admin/orders")}
            className="text-orange-600 font-bold"
          >
            View All →
          </button>
        </div>

        {recentOrders.length === 0 ? (
          <div className="px-6 pb-6">
            <p className="text-gray-500">
              No orders available yet.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-y">
                <tr>
                  <th className="p-4 text-gray-600">
                    Customer
                  </th>

                  <th className="p-4 text-gray-600">
                    Phone
                  </th>

                  <th className="p-4 text-gray-600">
                    Total
                  </th>

                  <th className="p-4 text-gray-600">
                    Status
                  </th>
                </tr>
              </thead>

              <tbody>
                {recentOrders.map((order) => (
                  <tr
                    key={order._id}
                    className="border-b last:border-b-0"
                  >
                    <td className="p-4 font-semibold text-gray-900">
                      {order.fullName || "Customer"}
                    </td>

                    <td className="p-4 text-gray-700">
                      {order.phone || "-"}
                    </td>

                    <td className="p-4 font-bold text-gray-900">
                      ₹{Number(order.total || 0).toLocaleString("en-IN")}
                    </td>

                    <td className="p-4">
                      <span className="bg-gray-100 px-3 py-1 rounded-full text-sm font-semibold">
                        {order.status || "Pending"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}