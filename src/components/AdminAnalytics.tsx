"use client";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

import { Line, Doughnut } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

export default function AdminAnalytics({
  orders,
}: {
  orders: any[];
}) {
  const revenueData = {
    labels: orders.map((_, index) => `Order ${index + 1}`),

    datasets: [
      {
        label: "Revenue",
        data: orders.map((order) => order.total),
        borderColor: "rgb(249,115,22)",
        backgroundColor: "rgba(249,115,22,0.3)",
      },
    ],
  };

  const statusCounts = {
    Pending: orders.filter(
      (o) => o.status === "Pending"
    ).length,

    Confirmed: orders.filter(
      (o) => o.status === "Confirmed"
    ).length,

    Shipped: orders.filter(
      (o) => o.status === "Shipped"
    ).length,

    Delivered: orders.filter(
      (o) => o.status === "Delivered"
    ).length,
  };

  const statusData = {
    labels: Object.keys(statusCounts),

    datasets: [
      {
        data: Object.values(statusCounts),
        backgroundColor: [
          "#FACC15",
          "#3B82F6",
          "#A855F7",
          "#22C55E",
        ],
      },
    ],
  };

  return (
    <div className="grid lg:grid-cols-2 gap-8 mb-10">

      <div className="bg-white p-6 rounded-2xl shadow-lg">
        <h2 className="text-2xl font-bold mb-4 text-gray-900">
          Revenue Trend
        </h2>

        <Line data={revenueData} />
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-lg">
        <h2 className="text-2xl font-bold mb-4 text-gray-900">
          Order Status Distribution
        </h2>

        <Doughnut data={statusData} />
      </div>

    </div>
  );
}