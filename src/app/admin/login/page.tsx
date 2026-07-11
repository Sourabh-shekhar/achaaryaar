"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const result = await signIn("admin-credentials", {
      password,
      redirect: false,
    });

    setIsSubmitting(false);

    if (result?.error) {
      setError("Incorrect password. Please try again.");
      return;
    }

    router.push("/admin/products");
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <div className="w-full max-w-sm bg-white p-8 rounded-2xl shadow-lg">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Admin Login</h1>
        <p className="text-sm text-gray-500 mb-6">
          Enter the admin password to manage products.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            placeholder="Admin password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border rounded-xl p-3 text-gray-900"
            required
            autoFocus
          />

          {error && (
            <p className="text-red-600 text-sm font-semibold">{error}</p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-orange-600 text-white py-3 rounded-xl font-bold hover:bg-orange-700 disabled:opacity-50"
          >
            {isSubmitting ? "Checking..." : "Log In"}
          </button>
        </form>
      </div>
    </div>
  );
}