"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (name.trim().length < 2) {
      setError("Please enter your full name.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        router.push("/login");
        return;
      }

      setError(data?.message || "Something went wrong. Please try again.");
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FBF7F1] px-4">
      <div className="w-full max-w-md">
        {/* Brand mark */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div
            className="flex items-center justify-center rounded-full shadow-md"
            style={{
              width: 48,
              height: 48,
              background: "linear-gradient(135deg, #C9923A 0%, #E8B060 100%)",
              fontSize: "1.4rem",
            }}
          >
            🫙
          </div>
          <div
            className="text-2xl font-black"
            style={{ fontFamily: "'Playfair Display', Georgia, serif", color: "#1C3D2E" }}
          >
            Achaarya<span style={{ color: "#C9923A" }}>ar</span>
          </div>
        </div>

        <div className="bg-white p-8 sm:p-10 rounded-3xl shadow-xl border border-[#E8DDD1]">
          <h1
            className="text-3xl font-extrabold text-center mb-2"
            style={{ fontFamily: "'Playfair Display', Georgia, serif", color: "#2D2A26" }}
          >
            Create Account
          </h1>
          <p className="text-center text-sm text-[#7A6F65] mb-8">
            Join us for authentic homemade pickles, delivered fresh.
          </p>

          {error && (
            <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-[#2D2A26] mb-1.5">
                Full Name
              </label>
              <input
                id="name"
                type="text"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full p-3.5 border border-[#DED3C6] rounded-2xl bg-white text-[#2D2A26] placeholder-[#A39A8F] focus:outline-none focus:ring-2 focus:ring-[#C9923A] focus:border-transparent transition"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[#2D2A26] mb-1.5">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full p-3.5 border border-[#DED3C6] rounded-2xl bg-white text-[#2D2A26] placeholder-[#A39A8F] focus:outline-none focus:ring-2 focus:ring-[#C9923A] focus:border-transparent transition"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[#2D2A26] mb-1.5">
                Password
              </label>
              <input
                id="password"
                type="password"
                placeholder="At least 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                className="w-full p-3.5 border border-[#DED3C6] rounded-2xl bg-white text-[#2D2A26] placeholder-[#A39A8F] focus:outline-none focus:ring-2 focus:ring-[#C9923A] focus:border-transparent transition"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-2xl font-bold text-base text-white transition disabled:opacity-60 disabled:cursor-not-allowed"
              style={{ background: "#1C3D2E" }}
              onMouseEnter={(e) => { if (!loading) e.currentTarget.style.background = "#2A5540"; }}
              onMouseLeave={(e) => { if (!loading) e.currentTarget.style.background = "#1C3D2E"; }}
            >
              {loading ? "Creating account..." : "Sign Up"}
            </button>
          </form>

          <p className="text-center text-sm text-[#7A6F65] mt-6">
            Already have an account?{" "}
            <a href="/login" className="font-semibold" style={{ color: "#C9923A" }}>
              Log in
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}