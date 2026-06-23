"use client";

import { useEffect, useState } from "react";
//const [orders, setOrders] = useState<any[]>([]);

export default function AdminOrdersPage() {
    const [orders, setOrders] = useState<any[]>([]);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const res = await fetch("/api/orders");
            const data = await res.json();

            if (data.success) {
                setOrders(data.orders || []);
            }
        } catch (error) {
            console.error("Failed to fetch orders:", error);
        }
    };
    const updateStatus = async (
        id: string,
        status: string
    ) => {
        console.log("Updating:", id, status);
        try {
            const res = await fetch(`/api/orders/${id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ status }),
            });

            const data = await res.json();
            console.log("Response:", data);


            if (data.success) {
                fetchOrders();
            }
        } catch (error) {
            console.error(error);
        }
    };
    const totalOrders = orders.length;

    const pendingOrders = orders.filter(
        (order: any) => order.status === "Pending"
    ).length;

    const deliveredOrders = orders.filter(
        (order: any) => order.status === "Delivered"
    ).length;

    const totalRevenue = orders.reduce(
        (total: number, order: any) => total + (order.total || 0),
        0
    );
    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-8">
                Admin Orders Dashboard
            </h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">

                <div className="bg-white p-6 rounded-2xl shadow-lg border">
                    <h3 className="text-gray-500 text-lg">
                        Total Orders
                    </h3>

                    <p className="text-4xl font-bold text-blue-600 mt-2">
                        {totalOrders}
                    </p>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-lg border">
                    <h3 className="text-gray-500 text-lg">
                        Pending Orders
                    </h3>

                    <p className="text-4xl font-bold text-yellow-500 mt-2">
                        {pendingOrders}
                    </p>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-lg border">
                    <h3 className="text-gray-500 text-lg">
                        Delivered Orders
                    </h3>

                    <p className="text-4xl font-bold text-green-600 mt-2">
                        {deliveredOrders}
                    </p>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-lg border">
                    <h3 className="text-gray-500 text-lg">
                        Total Revenue
                    </h3>

                    <p className="text-4xl font-bold text-orange-600 mt-2">
                        ₹{totalRevenue}
                    </p>
                </div>

            </div>
            {!orders || orders.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-md p-6">
                    <p className="text-lg text-gray-700">
                        No orders found.
                    </p>
                </div>
            ) : (
                <div className="space-y-6">
                    {orders.map((order: any) => (
                        <div
                            key={order._id}
                            className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200"
                        >
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">
                                {order.fullName}
                            </h2>

                            <div className="space-y-2">
                                <p className="text-gray-800">
                                    <strong className="text-gray-900">
                                        Phone:
                                    </strong>{" "}
                                    {order.phone}
                                </p>

                                <p className="text-gray-800">
                                    <strong className="text-gray-900">
                                        Address:
                                    </strong>{" "}
                                    {order.address}
                                </p>

                                <p className="text-gray-800">
                                    <strong className="text-gray-900">
                                        City:
                                    </strong>{" "}
                                    {order.city}
                                </p>

                                <p className="text-gray-800">
                                    <strong className="text-gray-900">
                                        Pincode:
                                    </strong>{" "}
                                    {order.pincode}
                                </p>

                                <p className="text-gray-800">
                                    <strong className="text-gray-900">
                                        Payment:
                                    </strong>{" "}
                                    {order.paymentMethod}
                                </p>

                                <div className="flex items-center gap-4 mt-4">
                                    <label className="font-bold text-gray-900">
                                        Status:
                                    </label>

                                    <select
                                        value={order.status}
                                        onChange={(e) =>
                                            updateStatus(order._id, e.target.value)
                                        }
                                        className={`border rounded-lg px-3 py-2 font-semibold ${order.status === "Pending"
                                                ? "bg-yellow-100 text-yellow-800"
                                                : order.status === "Confirmed"
                                                    ? "bg-blue-100 text-blue-800"
                                                    : order.status === "Shipped"
                                                        ? "bg-purple-100 text-purple-800"
                                                        : order.status === "Delivered"
                                                            ? "bg-green-100 text-green-800"
                                                            : "bg-gray-100 text-gray-800"
                                            }`}
                                    >
                                        <option value="Pending">Pending</option>
                                        <option value="Confirmed">Confirmed</option>
                                        <option value="Shipped">Shipped</option>
                                        <option value="Delivered">Delivered</option>
                                    </select>
                                </div>
                            </div>

                            <div className="mt-6">
                                <h3 className="text-xl font-bold text-gray-900 mb-3">
                                    Ordered Products
                                </h3>

                                <div className="space-y-3">
                                    {order.items?.map((item: any, index: number) => (
                                        <div
                                            key={index}
                                            className="border rounded-xl p-4 bg-gray-50"
                                        >
                                            <p className="font-semibold text-gray-900">
                                                {item.name}
                                            </p>

                                            <p className="text-gray-700">
                                                Quantity: {item.quantity}
                                            </p>

                                            <p className="text-gray-700">
                                                Price: {item.price}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <p className="text-sm text-gray-500 mt-6">
                                Order ID: {order._id}
                            </p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}