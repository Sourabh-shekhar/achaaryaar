
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
  const isHome = pathname === "/";
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
              <img src="/image/logo.png" alt="" width={36} height={36} />
            </span>
            <span className="hidden sm:block">
              <span className="bihar-brand-name">
                Achaar<span style={{ color: GOLD }}>Yaar</span>
              </span>
              <span className="bihar-brand-origin">Bihar Origin</span>
            </span>
          </Link>
          {/* Skyline strip — home page, mobile only */}
          {isHome && (
            <div className="flex md:hidden items-center flex-1 min-w-0 translate-y-1.5">
              <MobileSkylineStrip />
            </div>
          )}
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
                  <img src="/image/logo.png" alt="" width={36} height={36} />
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
function MobileSkylineStrip() {
  const S = 1.15; // uniform size for every landmark

  return (
    <svg
      viewBox="0 0 1660 150"
      className="h-10 w-full"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <g fill={SAND}>

        {/* 1 ── Golghar ── */}
        <g transform={`translate(-55,0) scale(${S})`}>
          <path d="M40 112 C40 70, 55 34, 100 30 C145 34, 160 70, 160 112 Z" />
          <path d="M48 100 Q100 78 152 100" stroke={CREAM} strokeWidth="2" fill="none" />
          <path d="M44 84 Q100 62 156 84" stroke={CREAM} strokeWidth="2" fill="none" />
          <rect x="97" y="16" width="6" height="16" />
          <circle cx="100" cy="14" r="4" />
          <path d="M88 112 L88 96 Q100 84 112 96 L112 112 Z" fill={CREAM} />
        </g>

        {/* 2 ── Griddhakuta Hill / Vulture's Peak ── */}
        <g transform={`translate(110.5,0) scale(${S})`}>
          <path d="M10 112 L28 62 L45 42 L55 30 L65 44 L80 62 L95 112 Z" />
          <rect x="48" y="20" width="14" height="12" fill={SAND} />
          <circle cx="55" cy="16" r="4" fill={GOLD} />
          <line x1="55" y1="8" x2="55" y2="20" stroke={SAND} strokeWidth="1.5" />
          <path d="M20 100 Q45 78 75 100" stroke={CREAM} strokeWidth="1.5" fill="none" opacity="0.6" />
        </g>

        {/* 3 ── Ashoka Pillar ── */}
        <g transform={`translate(23,0) scale(${S})`}>
          <rect x="218" y="40" width="8" height="66" rx="1" />
          <path d="M212 40 Q222 24 232 40 Z" />
          <rect x="208" y="38" width="28" height="5" />
          <path d="M214 20 q4 -8 8 0 q4 -6 8 0 q3 4 -1 8 q-6 4 -14 0 q-3 -3 -1 -8 Z" />
          <rect x="204" y="106" width="36" height="8" />
        </g>

        {/* 4 ── Rajgir Cyclopean Wall ── */}
        <g transform={`translate(326.5,0) scale(${S})`}>
          <path d="M5 112 L20 82 L35 92 L50 66 L65 86 L80 76 L95 112 Z" />
          <path
            d="M18 84 L18 76 L25 76 L25 84 M32 90 L32 82 L39 82 L39 90
               M48 68 L48 60 L55 60 L55 68 M63 88 L63 80 L70 80 L70 88"
            fill="none" stroke={CREAM} strokeWidth="2"
          />
        </g>

        {/* 5 ── Mahabodhi Temple ── */}
        <g transform={`translate(98.7,0) scale(${S})`}>
          <path d="M300 112 L300 96 L312 96 L312 82 L322 82 L322 66
                   L332 66 L332 48 L342 48 L342 24 L352 40 L352 66
                   L362 66 L362 82 L372 82 L372 96 L384 96 L384 112 Z" />
          <circle cx="342" cy="18" r="4" />
          <rect x="339" y="10" width="6" height="8" />
          <rect x="312" y="70" width="60" height="2" fill={CREAM} />
          <rect x="316" y="86" width="52" height="2" fill={CREAM} />
          <path d="M332 112 L332 100 Q342 92 352 100 L352 112 Z" fill={CREAM} />
        </g>

        {/* 6 ── Nalanda ruins ── */}
        <g transform={`translate(42.25,0) scale(${S})`}>
          <rect x="430" y="90" width="110" height="22" />
          <path d="M440 90 Q452 68 464 90 Z" fill={CREAM} />
          <path d="M470 90 Q482 68 494 90 Z" fill={CREAM} />
          <path d="M500 90 Q512 68 524 90 Z" fill={CREAM} />
          <rect x="430" y="108" width="110" height="4" opacity="0.6" />
          <path d="M430 90 L440 84 L452 90 L462 82 L474 90 L486 85 L498 90 L510 83 L524 90 L540 90"
                fill="none" stroke={SAND} strokeWidth="10" strokeLinejoin="round" />
        </g>

        {/* 7 ── Munger Fort ── */}
        <g transform={`translate(650.5,0) scale(${S})`}>
          <rect x="15" y="90" width="70" height="22" />
          <rect x="15" y="82" width="8" height="8" /><rect x="31" y="82" width="8" height="8" />
          <rect x="47" y="82" width="8" height="8" /><rect x="63" y="82" width="8" height="8" />
          <rect x="40" y="58" width="20" height="30" />
          <path d="M40 58 Q50 42 60 58 Z" />
          <rect x="49" y="36" width="2" height="8" />
          <rect x="10" y="112" width="80" height="3" opacity="0.35" />
          <path d="M42 112 L42 100 Q50 92 58 100 L58 112 Z" fill={CREAM} />
        </g>

        {/* 8 ── Patna Sahib Gurudwara ── */}
        <g transform={`translate(97.25,0) scale(${S})`}>
          <rect x="590" y="86" width="70" height="26" />
          <path d="M590 86 Q625 44 660 86 Z" />
          <rect x="621" y="30" width="8" height="16" />
          <circle cx="625" cy="26" r="4" fill={GOLD} />
          <path d="M600 82 Q625 50 650 82" stroke={CREAM} strokeWidth="1.5" fill="none" />
          <circle cx="598" cy="80" r="7" />
          <rect x="594" y="80" width="8" height="8" />
          <circle cx="652" cy="80" r="7" />
          <rect x="648" y="80" width="8" height="8" />
          <path d="M614 112 L614 98 Q625 88 636 98 L636 112 Z" fill={CREAM} />
        </g>

        {/* 9 ── Kesaria Stupa ── */}
        <g transform={`translate(77.6,0) scale(${S})`}>
          <path d="M710 112 C706 100, 706 92, 716 86 C712 78, 714 68, 726 62
                   C722 54, 726 44, 736 40 C746 44, 750 54, 746 62
                   C758 68, 760 78, 756 86 C766 92, 766 100, 762 112 Z" />
          <rect x="733" y="24" width="6" height="16" />
          <circle cx="736" cy="20" r="3.5" fill={GOLD} />
          <circle cx="736" cy="70" r="4" fill={CREAM} />
          <rect x="720" y="98" width="32" height="3" fill={CREAM} />
        </g>

        {/* 10 ── Pawapuri Jal Mandir ── */}
        <g transform={`translate(974.5,0) scale(${S})`}>
          <path d="M0 120 Q25 113 50 120 T100 120" stroke={CREAM} strokeWidth="2" fill="none" opacity="0.7" />
          <rect x="25" y="96" width="50" height="16" />
          <rect x="35" y="70" width="30" height="26" />
          <path d="M35 70 Q50 50 65 70 Z" />
          <rect x="48" y="40" width="4" height="12" />
          <circle cx="50" cy="37" r="3.5" fill={GOLD} />
          <rect x="43" y="112" width="14" height="8" fill={CREAM} />
        </g>

        {/* 11 ── Vishwa Shanti Stupa ── */}
        <g transform={`translate(164.8,0) scale(${S})`}>
          <rect x="820" y="98" width="56" height="14" />
          <path d="M820 98 Q848 60 876 98 Z" />
          <rect x="845" y="34" width="6" height="18" />
          <path d="M839 34 L857 34 L848 24 Z" />
          <circle cx="836" cy="90" r="4" fill={CREAM} />
          <circle cx="848" cy="82" r="4" fill={CREAM} />
          <circle cx="860" cy="90" r="4" fill={CREAM} />
        </g>

        {/* 12 ── Barabar Caves ── */}
        <g transform={`translate(144,0) scale(${S})`}>
          <path d="M930 112 C925 90, 935 68, 960 62 C985 68, 995 90, 990 112 Z" />
          <path d="M948 112 L948 92 Q960 78 972 92 L972 112 Z" fill={CREAM} />
          <path d="M935 96 Q960 88 985 96" stroke={CREAM} strokeWidth="1.5" fill="none" opacity="0.7" />
        </g>

        {/* 13 ── Sher Shah Suri Tomb ── */}
        <g transform={`translate(108.25,0) scale(${S})`}>
          <rect x="1040" y="100" width="90" height="12" />
          <rect x="1055" y="76" width="60" height="24" />
          <path d="M1055 76 Q1085 42 1115 76 Z" />
          <rect x="1082" y="26" width="6" height="14" />
          <circle cx="1085" cy="22" r="3.5" fill={GOLD} />
          <circle cx="1058" cy="72" r="6" />
          <rect x="1054" y="72" width="8" height="6" />
          <circle cx="1112" cy="72" r="6" />
          <rect x="1108" y="72" width="8" height="6" />
          <rect x="1030" y="112" width="110" height="3" opacity="0.35" />
          <path d="M1070 100 L1070 88 Q1085 78 1100 88 L1100 100 Z" fill={CREAM} />
        </g>

        {/* 14 ── Vaishali Stupa & Lion Pillar ── */}
        <g transform={`translate(55.25,0) scale(${S})`}>
          <path d="M1190 112 C1185 96, 1190 82, 1210 78 C1230 82, 1235 96, 1230 112 Z" />
          <circle cx="1210" cy="72" r="3.5" fill={CREAM} />
          <rect x="1207" y="60" width="6" height="14" />
          <rect x="1245" y="76" width="6" height="36" />
          <rect x="1236" y="74" width="24" height="4" />
          <path d="M1241 60 q4 -7 8 0 q4 -5 8 0 q2.5 3.5 -1 7 q-5 3.5 -12 0 q-3.5 -3.5 -3 -7 Z" />
          <rect x="1232" y="112" width="32" height="6" />
        </g>

        {/* 15 ── Vikramshila ruins ── */}
        <g transform={`translate(25.25,0) scale(${S})`}>
          <path d="M1320 112 L1320 98 L1330 98 L1330 86 L1340 86 L1340 72
                   L1350 72 L1350 86 L1360 86 L1360 98 L1370 98 L1370 112 Z" />
          <rect x="1330" y="90" width="40" height="2" fill={CREAM} />
          <path d="M1338 112 L1338 100 Q1345 94 1352 100 L1352 112 Z" fill={CREAM} />
          <rect x="1310" y="110" width="70" height="4" opacity="0.6" />
          <path d="M1310 98 L1320 92 L1332 98 L1345 90 L1358 98 L1370 92 L1380 98"
                fill="none" stroke={SAND} strokeWidth="8" strokeLinejoin="round" />
        </g>

      </g>
    </svg>
  );
}