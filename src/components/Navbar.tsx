// "use client";

// import { useEffect, useState } from "react";
// import Link from "next/link";
// import { useCartStore } from "@/store/cartStore";
// import { useRouter, usePathname } from "next/navigation";
// import { useSession, signOut } from "next-auth/react";

// const MOBILE_NAV_ITEMS = [
//   { label: "Home", href: "/" },
//   { label: "Shop", href: "/products" },
//   { label: "About Us", href: "/about" },
//   { label: "Contact", href: "/contact" },
// ];

// export default function Navbar() {
//   const [isOpen, setIsOpen] = useState(false);
//   const [search, setSearch] = useState("");
//   const [mounted, setMounted] = useState(false);

//   const router = useRouter();
//   const pathname = usePathname();
//   const { data: session } = useSession();

//   const items = useCartStore((state) => state.items);

//   const totalItems = items.reduce(
//     (total, item) => total + item.quantity,
//     0
//   );

//   useEffect(() => {
//     setMounted(true);
//   }, []);

//   // Lock body scroll while the mobile side menu is open
//   useEffect(() => {
//     document.body.style.overflow = isOpen ? "hidden" : "";
//     return () => {
//       document.body.style.overflow = "";
//     };
//   }, [isOpen]);

//   const handleSearch = (
//     e: React.KeyboardEvent<HTMLInputElement>
//   ) => {
//     if (e.key === "Enter" && search.trim()) {
//       router.push(`/products?search=${search}`);
//     }
//   };

//   return (<nav className="sticky top-0 z-50 bg-white shadow-lg border-b border-gray-200">

//     <div className="max-w-7xl mx-auto px-6 py-4">

//       <div className="flex items-center justify-between">

//         {/* Logo */}
//         <Link href="/">
//           <img
//             src="/image/logo.png"
//             alt="Logo"
//             className="h-16 w-auto"
//           />
//         </Link>

//         {/* Search */}
//         <div className="hidden lg:block relative">
//           <input
//             type="text"
//             placeholder="Search pickles..."
//             value={search}
//             onChange={(e) => setSearch(e.target.value)}
//             onKeyDown={handleSearch}
//             className="w-full max-w-md px-5 py-3 border border-gray-300 rounded-2xl bg-white text-gray-900 placeholder:text-gray-500 shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
//           />
//         </div>

//         {/* Desktop Menu */}
//         <div className="hidden md:flex items-center gap-8">

//           <Link
//             href="/"
//             className="text-black font-bold text-xl hover:text-orange-600 transition"
//           >
//             Home
//           </Link>

//           <Link
//             href="/products"
//             className="text-black font-bold text-xl hover:text-orange-600 transition"
//           >
//             Shop
//           </Link>

//           <Link
//             href="/about"
//             className="text-black font-bold text-xl hover:text-orange-600 transition"
//           >
//             About Us
//           </Link>

//           <Link
//             href="/contact"
//             className="text-black font-bold text-xl hover:text-orange-600 transition"
//           >
//             Contact
//           </Link>

//           {/* Profile */}
//           <div className="relative group">

//             <button className="text-3xl">
//               👤
//             </button>

//             <div className="absolute right-0 top-12 w-56 bg-white rounded-xl shadow-xl border hidden group-hover:block p-4 z-50">
//               {!mounted ? null : session ? (
//                 <>
//                   <p className="text-center text-gray-700">
//                     👋 Welcome
//                   </p>

//                   <p className="text-center text-orange-600 font-bold mb-4">
//                     {session.user?.name}
//                   </p>

//                   <button
//                     onClick={() => signOut()}
//                     className="w-full bg-red-600 text-white py-2 rounded-xl"
//                   >
//                     Logout
//                   </button>
//                 </>
//               ) : (
//                 <div className="space-y-3">
//                   <Link
//                     href="/login"
//                     className="block text-center border border-gray-300 py-3 rounded-xl text-gray-900 font-semibold hover:bg-gray-100"
//                   >
//                     Login
//                   </Link>

//                   <Link
//                     href="/signup"
//                     className="block text-center bg-orange-600 text-white py-2 rounded-xl"
//                   >
//                     Sign Up
//                   </Link>
//                 </div>
//               )}

//             </div>
//           </div>

//           {/* Cart */}
//           <Link
//             href="/cart"
//             className="relative bg-orange-600 text-white px-6 py-3 rounded-2xl"
//           >
//             🛒 Cart

//             {mounted && totalItems > 0 && (
//               <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center">
//                 {totalItems}
//               </span>
//             )}
//           </Link>

//         </div>

//         {/* Mobile Hamburger */}
//         <button
//           onClick={() => setIsOpen(!isOpen)}
//           aria-label={isOpen ? "Close menu" : "Open menu"}
//           aria-expanded={isOpen}
//           className="md:hidden text-4xl text-black font-bold p-2"
//         >
//           {isOpen ? "✕" : "☰"}
//         </button>

//       </div>

//       {/* Mobile Menu */}
//       {/* Overlay */}
//       {isOpen && (
//         <div
//           className="fixed inset-0 bg-black/50 z-40 md:hidden"
//           onClick={() => setIsOpen(false)}
//         />
//       )}

//       {/* Mobile Side Menu */}
//       <div
//         className={`fixed top-0 right-0 h-full w-[85%] max-w-sm bg-white shadow-2xl z-[60] transform transition-transform duration-300 ease-in-out md:hidden ${isOpen ? "translate-x-0" : "translate-x-full"
//           }`}
//       >
//         <div className="p-6 text-gray-900">
//           <div className="mb-8">
//             <img
//               src="/image/logo.png"
//               alt="Achaaryaar"
//               className="h-14 w-auto"
//             />
//           </div>

//           <div className="flex justify-end">
//             <button
//               onClick={() => setIsOpen(false)}
//               aria-label="Close menu"
//               className="text-4xl text-black"
//             >
//               ✕
//             </button>
//           </div>

//           <div className="flex flex-col gap-2 mt-8">

//             {MOBILE_NAV_ITEMS.map((item) => {
//               const isActive = pathname === item.href;
//               return (
//                 <Link
//                   key={item.label}
//                   href={item.href}
//                   onClick={() => setIsOpen(false)}
//                   className={`uppercase tracking-wide text-lg font-semibold px-4 py-3 rounded-xl transition-colors duration-150 active:bg-orange-100
//                     ${isActive
//                       ? "bg-orange-50 text-orange-600"
//                       : "bg-white text-gray-900 hover:bg-gray-100 hover:text-orange-600"
//                     }`}
//                 >
//                   {item.label}
//                 </Link>
//               );
//             })}

//             <Link
//               href="/cart"
//               onClick={() => setIsOpen(false)}
//               className={`uppercase tracking-wide text-lg font-semibold px-4 py-3 rounded-xl transition-colors duration-150 active:bg-orange-100
//                 ${pathname === "/cart"
//                   ? "bg-orange-50 text-orange-600"
//                   : "bg-white text-gray-900 hover:bg-gray-100 hover:text-orange-600"
//                 }`}
//             >
//               Cart ({mounted ? totalItems : 0})
//             </Link>
//           </div>

//           {!mounted ? null : session ? (
//             <div className="mt-10 border-t pt-6">
//               <p className="text-gray-700">👋 Welcome</p>
//               <p className="font-bold text-orange-600">
//                 {session.user?.name}
//               </p>

//               <button
//                 onClick={() => signOut()}
//                 className="w-full mt-5 bg-red-600 text-white py-3 rounded-xl"
//               >
//                 Logout
//               </button>
//             </div>
//           ) : (
//             <div className="mt-10 flex flex-col gap-4">
//               <Link
//                 href="/login"
//                 onClick={() => setIsOpen(false)}
//                 className="text-center border border-gray-300 py-3 rounded-xl text-gray-900 font-semibold"
//               >
//                 Login
//               </Link>

//               <Link
//                 href="/signup"
//                 onClick={() => setIsOpen(false)}
//                 className="text-center bg-orange-600 text-white py-3 rounded-xl"
//               >
//                 Sign Up
//               </Link>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   </nav>

//   );
// }

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useCartStore } from "@/store/cartStore";
import { useRouter, usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { FiSearch, FiUser, FiShoppingCart, FiMenu, FiX } from "react-icons/fi";

// ─── Brand tokens (matches the rest of the site) ─────────────────────────────
const FOREST = "#4F6B52";
const GOLD = "#C18A42";
const CREAM = "#FBF7F1";
const INK = "#2D2A26";
const SAND = "#E8DDD1";

const MOBILE_NAV_ITEMS = [
  { label: "Home", href: "/" },
  { label: "Shop", href: "/products" },
  { label: "Profile", href: "/profile" },
  { label: "About Us", href: "/about" },
  { label: "Contact", href: "/contact" },
];

const DESKTOP_NAV_ITEMS = MOBILE_NAV_ITEMS;

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [mounted, setMounted] = useState(false);

  const router = useRouter();
  const pathname = usePathname();
  const { data: session } = useSession();

  const items = useCartStore((state) => state.items);

  const totalItems = items.reduce(
    (total, item) => total + item.quantity,
    0
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  // Lock body scroll while the mobile side menu is open
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleSearch = (
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Enter" && search.trim()) {
      router.push(`/products?search=${search}`);
    }
  };

  return (
    <nav
      className="sticky top-0 z-50 border-b"
      style={{ background: CREAM, borderColor: SAND }}
    >
      <div className="bihar-border-strip h-1" aria-hidden="true" />
      <div className="max-w-7xl mx-auto px-6 py-3">
        <div className="flex items-center justify-between gap-6">

          {/* Logo */}
          <Link href="/" className="bihar-brand-lockup shrink-0" aria-label="AchaarYaar home">
            <span className="bihar-brand-mark" aria-hidden="true">
              <img src="/image/logo.png" alt="" />
            </span>
            <span className="hidden sm:block">
              <span className="bihar-brand-name">
                Achaar<span style={{ color: GOLD }}>Yaar</span>
              </span>
              <span className="bihar-brand-origin">Bihar Origin</span>
            </span>
          </Link>

          <div className="magadh-mobile-badge md:hidden flex-1" aria-label="Magadh and Madhubani inspired Bihar origin">
            <span className="magadh-mobile-badge-mark" aria-hidden="true" />
            <span className="magadh-mobile-badge-text">Magadh Art</span>
          </div>

          {/* Search */}
          <div className="hidden lg:flex flex-1 max-w-md relative">
            <FiSearch
              size={16}
              style={{ color: FOREST }}
              className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
            />
            <input
              type="text"
              placeholder="Search pickles…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={handleSearch}
              className="w-full pl-10 pr-4 py-2.5 rounded-full text-sm outline-none transition-colors"
              style={{
                border: `1px solid ${SAND}`,
                background: "#FFFFFF",
                color: INK,
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = FOREST)}
              onBlur={(e) => (e.currentTarget.style.borderColor = SAND)}
            />
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-7">

            {DESKTOP_NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className="text-sm font-semibold tracking-wide transition-colors"
                  style={{ color: isActive ? FOREST : INK }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = FOREST)}
                  onMouseLeave={(e) => (e.currentTarget.style.color = isActive ? FOREST : INK)}
                >
                  {item.label}
                </Link>
              );
            })}

            {/* Profile */}
            <div className="relative group">
              <button
                aria-label="Account"
                className="w-9 h-9 rounded-full flex items-center justify-center transition-colors"
                style={{ background: "#FFFFFF", border: `1px solid ${SAND}`, color: FOREST }}
              >
                <FiUser size={16} />
              </button>

              <div
                className="absolute right-0 top-11 w-56 rounded-xl shadow-xl hidden group-hover:block p-4 z-50"
                style={{ background: "#FFFFFF", border: `1px solid ${SAND}` }}
              >
                {!mounted ? null : session ? (
                  <>
                    <p className="text-center text-sm" style={{ color: INK }}>
                      Welcome back
                    </p>
                    <p className="text-center font-bold mb-4" style={{ color: FOREST }}>
                      {session.user?.name}
                    </p>
                    <Link
                      href="/profile"
                      className="block text-center py-2 rounded-lg text-sm font-semibold mb-2"
                      style={{ border: `1px solid ${SAND}`, color: INK }}
                    >
                      Profile & Orders
                    </Link>
                    <button
                      onClick={() => signOut()}
                      className="w-full py-2 rounded-lg text-sm font-semibold text-white"
                      style={{ background: "#6B1F1F" }}
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <div className="space-y-2.5">
                    <Link
                      href="/login"
                      className="block text-center py-2.5 rounded-lg text-sm font-semibold transition-colors"
                      style={{ border: `1px solid ${SAND}`, color: INK }}
                    >
                      Login
                    </Link>
                    <Link
                      href="/signup"
                      className="block text-center py-2.5 rounded-lg text-sm font-semibold text-white"
                      style={{ background: FOREST }}
                    >
                      Sign Up
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Cart */}
            <Link
              href="/cart"
              className="relative flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold text-white transition-transform hover:-translate-y-0.5"
              style={{ background: GOLD, color: FOREST }}
            >
              <FiShoppingCart size={16} />
              Cart

              {mounted && totalItems > 0 && (
                <span
                  className="absolute -top-2 -right-2 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold"
                  style={{ background: "#6B1F1F" }}
                >
                  {totalItems}
                </span>
              )}
            </Link>
          </div>

          {/* Mobile Hamburger */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            aria-label={isOpen ? "Close menu" : "Open menu"}
            aria-expanded={isOpen}
            className="md:hidden p-2 rounded-lg"
            style={{ color: FOREST }}
          >
            {isOpen ? <FiX size={26} /> : <FiMenu size={26} />}
          </button>

        </div>

        {/* Mobile Menu */}
        {/* Overlay */}
        {isOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setIsOpen(false)}
          />
        )}

        {/* Mobile Side Menu */}
        <div
          className={`fixed top-0 right-0 h-full w-[85%] max-w-sm shadow-2xl z-[60] transform transition-transform duration-300 ease-in-out md:hidden ${isOpen ? "translate-x-0" : "translate-x-full"
            }`}
          style={{ background: CREAM }}
        >
          <div className="p-6">
            <div className="flex items-center justify-between mb-8">
              <Link href="/" className="bihar-brand-lockup" onClick={() => setIsOpen(false)}>
                <span className="bihar-brand-mark" aria-hidden="true">
                  <img src="/image/logo.png" alt="" />
                </span>
                <span>
                  <span className="bihar-brand-name">
                    Achaar<span style={{ color: GOLD }}>Yaar</span>
                  </span>
                  <span className="bihar-brand-origin">Bihar Origin</span>
                </span>
              </Link>
              <button
                onClick={() => setIsOpen(false)}
                aria-label="Close menu"
                style={{ color: FOREST }}
              >
                <FiX size={26} />
              </button>
            </div>

            <div className="flex flex-col gap-1.5">
              {MOBILE_NAV_ITEMS.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className="text-sm font-semibold tracking-wide px-4 py-3 rounded-xl transition-colors"
                    style={{
                      background: isActive ? "#FFFFFF" : "transparent",
                      color: isActive ? FOREST : INK,
                      border: isActive ? `1px solid ${SAND}` : "1px solid transparent",
                    }}
                  >
                    {item.label}
                  </Link>
                );
              })}

              <Link
                href="/cart"
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-between text-sm font-semibold tracking-wide px-4 py-3 rounded-xl transition-colors"
                style={{
                  background: pathname === "/cart" ? "#FFFFFF" : "transparent",
                  color: pathname === "/cart" ? FOREST : INK,
                  border: pathname === "/cart" ? `1px solid ${SAND}` : "1px solid transparent",
                }}
              >
                <span className="flex items-center gap-2"><FiShoppingCart size={15} /> Cart</span>
                <span>{mounted ? totalItems : 0}</span>
              </Link>
            </div>

            {!mounted ? null : session ? (
              <div className="mt-8 pt-6" style={{ borderTop: `1px solid ${SAND}` }}>
                <p className="text-sm" style={{ color: INK }}>Welcome back</p>
                <p className="font-bold" style={{ color: FOREST }}>
                  {session.user?.name}
                </p>
                <Link
                  href="/profile"
                  onClick={() => setIsOpen(false)}
                  className="block w-full mt-4 py-3 rounded-xl text-center text-sm font-semibold"
                  style={{ border: `1px solid ${SAND}`, color: INK }}
                >
                  Profile & Orders
                </Link>
                <button
                  onClick={() => signOut()}
                  className="w-full mt-4 py-3 rounded-xl text-sm font-semibold text-white"
                  style={{ background: "#6B1F1F" }}
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="mt-8 flex flex-col gap-3">
                <Link
                  href="/login"
                  onClick={() => setIsOpen(false)}
                  className="text-center py-3 rounded-xl text-sm font-semibold"
                  style={{ border: `1px solid ${SAND}`, color: INK }}
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  onClick={() => setIsOpen(false)}
                  className="text-center py-3 rounded-xl text-sm font-semibold text-white"
                  style={{ background: FOREST }}
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
