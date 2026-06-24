"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    if (
      username === "admin" &&
      password === "admin123"
    ) {
      localStorage.setItem("isAdmin", "true");
      router.push("/admin/orders");
    } else {
      alert("Invalid credentials");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md">

        <h1 className="text-3xl font-bold text-center text-gray-900 mb-6">
          Admin Login
        </h1>

        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full border rounded-xl p-3 mb-4 text-gray-900"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border rounded-xl p-3 mb-6 text-gray-900"
        />

        <button
          onClick={handleLogin}
          className="w-full bg-orange-600 text-white py-3 rounded-xl font-bold hover:bg-orange-700"
        >
          Login
        </button>
      </div>
    </div>
  );
}