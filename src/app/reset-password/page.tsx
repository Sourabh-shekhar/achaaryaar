"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!token) {
      setError("Invalid or missing reset link. Please request a new one.");
      return;
    }
    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        setSuccess("Password reset successful! Redirecting to login...");
        setTimeout(() => router.push("/login"), 1500);
        return;
      }

      setError(data?.message || "This reset link is invalid or has expired.");
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FBF7F1] px-4">
      <div className="w-full max-w-md">
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
            Set New Password
          </h1>
          <p className="text-center text-sm text-[#7A6F65] mb-8">
            Choose a new password for your account.
          </p>

          {error && (
            <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-5 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
              {success}
            </div>
          )}

          <form onSubmit={handleReset} className="space-y-4">
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-[#2D2A26] mb-1.5">
                New Password
              </label>
              <div className="relative">
                <input
                  id="newPassword"
                  type={showPassword ? "text" : "password"}
                  placeholder="At least 8 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={8}
                  className="w-full p-3.5 pr-11 border border-[#DED3C6] rounded-2xl bg-white text-[#2D2A26] placeholder-[#A39A8F] focus:outline-none focus:ring-2 focus:ring-[#C9923A] focus:border-transparent transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#A39A8F]"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-[#2D2A26] mb-1.5">
                Confirm New Password
              </label>
              <input
                id="confirmPassword"
                type={showPassword ? "text" : "password"}
                placeholder="Re-enter new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
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
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordForm />
    </Suspense>
  );
}