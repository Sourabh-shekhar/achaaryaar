// "use client";

// import { useState } from "react";
// import { signIn } from "next-auth/react";
// import { useRouter } from "next/navigation";

// export default function LoginPage() {
//   const router = useRouter();

//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");

//   const handleLogin = async () => {
//     const res = await signIn("credentials", {
//       email,
//       password,
//       redirect: false,
//     });

//     if (res?.error) {
//       alert("Invalid Email or Password");
//     } else {
//       alert("Login Successful");
//       router.push("/");
//       router.refresh();
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-orange-50">

//       <div className="bg-white p-10 rounded-3xl shadow-2xl w-full max-w-md">

//         <h1 className="text-5xl font-bold text-gray-900 text-center mb-10">
//           Login
//         </h1>

//         <div className="space-y-6">

//           <input
//             type="email"
//             placeholder="Email"
//             value={email}
//             onChange={(e) => setEmail(e.target.value)}
//             className="w-full p-4 border border-gray-300 rounded-2xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
//           />

//           <input
//             type="password"
//             placeholder="Password"
//             value={password}
//             onChange={(e) => setPassword(e.target.value)}
//             className="w-full p-4 border border-gray-300 rounded-2xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
//           />

//           <button
//             onClick={handleLogin}
//             className="w-full bg-orange-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-orange-700 transition"
//           >
//             Login
//           </button>

//         </div>

//       </div>

//     </div>
//   );
// }
"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setErrorMessage("");

    if (!email.trim() || !password.trim()) {
      setErrorMessage("Please enter your email and password.");
      return;
    }

    setLoading(true);

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (res?.error) {
      setErrorMessage("Invalid email or password.");
    } else {
      router.push("/");
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF4EE] flex items-center justify-center px-6 py-16">
      <div className="grid w-full max-w-6xl overflow-hidden rounded-[32px] bg-white shadow-[0_20px_60px_rgba(0,0,0,0.10)] lg:grid-cols-2">
        
        <div className="hidden lg:flex flex-col justify-between bg-[#6B1F1F] text-white p-12">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-[#F1D7B8]">
              AchaarYaar
            </p>

            <h1 className="mt-6 text-5xl font-bold leading-tight">
              Welcome back to a taste rooted in tradition.
            </h1>

            <p className="mt-6 text-lg leading-8 text-[#F7E9D8]">
              Sign in to continue shopping handcrafted pickles inspired by
              regional recipes, thoughtful preparation, and authentic Bihar flavours.
            </p>
          </div>

          <div className="space-y-4 text-sm text-[#F7E9D8]">
            <div className="rounded-2xl border border-white/20 bg-white/10 px-4 py-3">
              Small-Batch Crafted
            </div>
            <div className="rounded-2xl border border-white/20 bg-white/10 px-4 py-3">
              Hygienically Packed
            </div>
            <div className="rounded-2xl border border-white/20 bg-white/10 px-4 py-3">
              Pan-India Delivery
            </div>
          </div>
        </div>

        <div className="p-8 sm:p-10 lg:p-14">
          <div className="max-w-md mx-auto">
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-[#6B1F1F]">
              Sign In
            </p>

            <h2 className="mt-3 text-4xl font-bold text-[#2D2A26]">
              Login to your account
            </h2>

            <p className="mt-4 text-[#6A6158] leading-7">
              Access your cart, manage your orders, and continue exploring
              authentic handcrafted pickles.
            </p>

            <div className="mt-8 space-y-5">
              <div>
                <label className="mb-2 block text-sm font-medium text-[#3E352F]">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-2xl border border-[#DED3C6] bg-white px-4 py-4 text-[#2D2A26] placeholder:text-[#8A8178] focus:outline-none focus:ring-2 focus:ring-[#6B1F1F]"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[#3E352F]">
                  Password
                </label>
                <input
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-2xl border border-[#DED3C6] bg-white px-4 py-4 text-[#2D2A26] placeholder:text-[#8A8178] focus:outline-none focus:ring-2 focus:ring-[#6B1F1F]"
                />
              </div>

              {errorMessage && (
                <div className="rounded-2xl border border-[#E7C8C8] bg-[#FFF4F4] px-4 py-3 text-sm text-[#8B2E2E]">
                  {errorMessage}
                </div>
              )}

              <button
                onClick={handleLogin}
                disabled={loading}
                className="w-full rounded-2xl bg-[#6B1F1F] py-4 text-white font-semibold text-lg transition hover:bg-[#571919] disabled:opacity-70"
              >
                {loading ? "Signing In..." : "Login"}
              </button>
            </div>

            <div className="mt-6 flex flex-col gap-3 text-sm text-[#6A6158] sm:flex-row sm:items-center sm:justify-between">
              <Link
                href="/signup"
                className="font-medium text-[#6B1F1F] hover:underline"
              >
                Create an account
              </Link>

              <Link
                href="/products"
                className="font-medium text-[#6B1F1F] hover:underline"
              >
                Continue shopping
              </Link>
            </div>

            <p className="mt-8 text-sm leading-6 text-[#7B7269]">
              Achaaraar celebrates authentic pickle traditions with thoughtful
              craftsmanship and honest flavour in every jar.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
