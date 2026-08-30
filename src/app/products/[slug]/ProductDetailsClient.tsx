// "use client";

// import { useEffect, useRef, useState } from "react";
// import Link from "next/link";
// import { useRouter } from "next/navigation";
// import { useCartStore } from "@/store/cartStore";
// import Image from "next/image";
// const FONT_DISPLAY = "'Playfair Display', Georgia, serif";

// type Weight = {
//   size?: string;
//   quantity?: string;
//   weight?: string;
//   price: number;
//   stock: number;
//   unavailable?: boolean;
// };

// type Product = {
//   _id: string;
//   name: string;
//   description: string;
//   shortDescription?: string;
//   category: string;
//   image: string;
//   images?: string[];
//   videos?: string[];
//   weights: Weight[];
//   featured?: boolean;
//   rating?: number;
//   reviewsCount?: number;
//   isCombo?: boolean;
//   comboSize?: number;
//   comboUnitWeight?: string;
//   comboPrice?: number;
//   comboStock?: number;
//   comboVariants?: { unitWeight: string; price: number; stock: number }[];
// };

// const STANDARD_SIZES = ["120g", "220g", "330g", "430g"];

// export default function ProductDetailsClient({
//   product,
//   relatedProducts,
// }: {
//   product: Product;
//   relatedProducts: Product[];
// }) {
//   const router = useRouter();
//   const addItem = useCartStore((state) => state.addItem);

//   const [selectedIndex, setSelectedIndex] = useState(0);
//   const [added, setAdded] = useState(false);
//   const [toast, setToast] = useState<string | null>(null);
//   const [activeTab, setActiveTab] = useState("specifications");
//   // const gallery =
//   //   product.images && product.images.length > 0
//   //     ? product.images
//   //     : [product.image];
//   type GalleryItem = {
//   type: "image" | "video";
//   src: string;
// };

// const gallery: GalleryItem[] = [
//   ...(
//     product.images && product.images.length > 0
//       ? product.images
//       : [product.image]
//   ).map((src) => ({
//     type: "image" as const,
//     src,
//   })),

//   ...(product.videos || []).map((src) => ({
//     type: "video" as const,
//     src,
//   })),
// ];

//   // Combo packs have one fixed, clearly-labelled option. Regular products
//   // show only the sizes that are actually configured by the admin.
//   const isCombo =
//     product.isCombo === true ||
//     product.category?.toLowerCase().includes("combo") ||
//     product._id.startsWith("combo-");

//   const displayWeights: Weight[] = isCombo
//     ? (product.comboVariants && product.comboVariants.length > 0
//       ? product.comboVariants.map((v) => ({
//         size: `${v.unitWeight} × ${product.comboSize || 2} jars`,
//         price: Number(v.price || 0),
//         stock: Number(v.stock || 0),
//       }))
//       : [{
//         size: product.comboUnitWeight && product.comboSize
//           ? `${product.comboUnitWeight} × ${product.comboSize} jars`
//           : `${product.comboSize || 2}-Pack Combo`,
//         price: Number(product.comboPrice || 0),
//         stock: Number(product.comboStock || 0),
//       }])
//     : (product.weights || []).filter((weight) => {
//       const size = weight.size || weight.quantity || weight.weight;
//       return STANDARD_SIZES.includes(size || "") && Number(weight.price) > 0;
//     });

//   const [activeImage, setActiveImage] = useState(0);
//   const [isImageModalOpen, setIsImageModalOpen] = useState(false);
//   const [modalImageIndex, setModalImageIndex] = useState(0);
//   const [notifyEmail, setNotifyEmail] = useState("");
//   const [notifySubmitted, setNotifySubmitted] = useState(false);
//   const [notifyLoading, setNotifyLoading] = useState(false);

//   useEffect(() => {
//     const closeOnEscape = (event: KeyboardEvent) => {
//       if (event.key === "Escape") setIsImageModalOpen(false);
//     };

//     window.addEventListener("keydown", closeOnEscape);
//     return () => window.removeEventListener("keydown", closeOnEscape);
//   }, []);

//   // --- Swipe navigation for the main product image (mobile-style, no buttons) ---
//   const touchStartX = useRef<number | null>(null);
//   const touchDeltaX = useRef(0);
//   const SWIPE_THRESHOLD = 40; // px — minimum drag distance to count as a swipe

//   const goToImage = (index: number) => {
//     if (gallery.length === 0) return;
//     const clamped = Math.max(0, Math.min(gallery.length - 1, index));
//     setActiveImage(clamped);
//   };
//   const openImageModal = (index = activeImage) => {
//     setModalImageIndex(index);
//     setIsImageModalOpen(true);
//   };

//   const closeImageModal = () => {
//     setIsImageModalOpen(false);
//   };

//   const goToModalImage = (index: number) => {
//     if (gallery.length === 0) return;

//     const newIndex =
//       (index + gallery.length) % gallery.length;

//     setModalImageIndex(newIndex);
//   };
//   const handleTouchStart = (e: React.TouchEvent) => {
//     touchStartX.current = e.touches[0].clientX;
//     touchDeltaX.current = 0;
//   };

//   const handleTouchMove = (e: React.TouchEvent) => {
//     if (touchStartX.current === null) return;
//     touchDeltaX.current = e.touches[0].clientX - touchStartX.current;
//   };

//   const handleTouchEnd = () => {
//     if (touchStartX.current === null) return;
//     if (touchDeltaX.current <= -SWIPE_THRESHOLD) {
//       // swiped left -> next image
//       goToImage(activeImage + 1);
//     } else if (touchDeltaX.current >= SWIPE_THRESHOLD) {
//       // swiped right -> previous image
//       goToImage(activeImage - 1);
//     }
//     touchStartX.current = null;
//     touchDeltaX.current = 0;
//   };

//   // Mouse-drag equivalent so swipe also works with a trackpad/mouse on desktop
//   const mouseStartX = useRef<number | null>(null);
//   const mouseDeltaX = useRef(0);
//   const isDragging = useRef(false);

//   const handleMouseDown = (e: React.MouseEvent) => {
//     mouseStartX.current = e.clientX;
//     mouseDeltaX.current = 0;
//     isDragging.current = true;
//   };

//   const handleMouseMove = (e: React.MouseEvent) => {
//     if (!isDragging.current || mouseStartX.current === null) return;
//     mouseDeltaX.current = e.clientX - mouseStartX.current;
//   };

//   const endDrag = () => {
//     if (!isDragging.current) return;
//     if (mouseDeltaX.current <= -SWIPE_THRESHOLD) {
//       goToImage(activeImage + 1);
//     } else if (mouseDeltaX.current >= SWIPE_THRESHOLD) {
//       goToImage(activeImage - 1);
//     }
//     isDragging.current = false;
//     mouseStartX.current = null;
//     mouseDeltaX.current = 0;
//   };

//   const selectedWeight = displayWeights[selectedIndex];
//   const selectedWeightLabel =
//     selectedWeight?.size || selectedWeight?.quantity || selectedWeight?.weight || "Size";
//   const selectedStock = Number(selectedWeight?.stock || 0);
//   const outOfStock = !selectedWeight || selectedStock <= 0;

//   const handleAddToCart = () => {
//     if (added) {
//       router.push("/cart");
//       return;
//     }
//     if (!selectedWeight || outOfStock) return;

//     addItem(
//       {
//         _id: product._id,
//         name: product.name,
//         price: selectedWeight.price,
//         selectedVariant: selectedWeightLabel,
//       },
//       1
//     );

//     setAdded(true);
//     setToast(`${product.name} (${selectedWeightLabel}) added to cart`);
//     setTimeout(() => setToast(null), 3000);
//   };
//   const handleBuyNow = () => {
//     if (!selectedWeight || outOfStock) return;

//     addItem(
//       {
//         _id: product._id,
//         name: product.name,
//         price: selectedWeight.price,
//         selectedVariant: selectedWeightLabel,
//       },
//       1
//     );

//     router.push("/checkout");
//   };

//   const handleSelectWeight = (index: number) => {
//     setSelectedIndex(index);
//     setAdded(false);
//     setNotifySubmitted(false);
//     setNotifyEmail("");
//   };

//   const handleNotify = async (e: React.FormEvent) => {
//     e.preventDefault();

//     const email = notifyEmail.trim().toLowerCase();

//     if (!email || !selectedWeight) {
//       return;
//     }

//     setNotifyLoading(true);

//     try {
//       const res = await fetch("/api/notify", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           productId: product._id,
//           productName: product.name,
//           variant: selectedWeightLabel,
//           email,
//         }),
//       });

//       const data = await res.json();

//       if (!res.ok) {
//         throw new Error(
//           data.message || "Failed to save notification request"
//         );
//       }

//       setNotifySubmitted(true);

//       setToast(
//         data.alreadyRegistered
//           ? "You're already on the notification list"
//           : "We'll email you when it's back in stock"
//       );
//     } catch (error: any) {
//       setToast(
//         error?.message || "Something went wrong - please try again"
//       );
//     } finally {
//       setNotifyLoading(false);
//       setTimeout(() => setToast(null), 3000);
//     }
//   };
//   const rating = product.rating ?? 0;
//   const reviewsCount = product.reviewsCount ?? 0;
//   const fullStars = Math.round(rating);

//   return (
//     <div className="min-h-screen bg-[#FBF7F1] py-16 pb-32 relative">
//       {/* Toast */}
//       {toast && (
//         <div className="fixed top-6 right-6 z-50 bg-[#3D5640] text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 animate-[fadeIn_0.2s_ease-out]">
//           <span className="text-[#C18A42] text-xl">✓</span>
//           <span className="font-semibold">{toast}</span>
//         </div>
//       )}
//       {isImageModalOpen && (
//         <div
//           role="dialog"
//           aria-modal="true"
//           aria-label={`Full-screen ${product.name} gallery`}
//           className="fixed inset-0 z-[9999] bg-black"
//         >
//           {/* Top controls */}
//           <div className="absolute left-0 right-0 top-0 z-20 flex items-center justify-between p-4 sm:p-6">
//             <button
//               type="button"
//               aria-label="Close image gallery"
//               onClick={closeImageModal}
//               className="flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-3xl font-light text-white backdrop-blur-md transition hover:bg-white/25"
//             >
//               ×
//             </button>

//             {gallery.length > 1 && (
//               <span className="rounded-full bg-white/15 px-4 py-2 text-sm font-bold text-white backdrop-blur-md">
//                 {modalImageIndex + 1} / {gallery.length}
//               </span>
//             )}
//           </div>

//           {/* Fullscreen image */}
//           <div
//             className="flex h-full w-full items-center justify-center px-3 py-20 sm:px-16"
//             onTouchStart={(e) => {
//               touchStartX.current = e.touches[0].clientX;
//               touchDeltaX.current = 0;
//             }}
//             onTouchMove={(e) => {
//               if (touchStartX.current === null) return;
//               touchDeltaX.current =
//                 e.touches[0].clientX - touchStartX.current;
//             }}
//             onTouchEnd={() => {
//               if (touchStartX.current === null) return;

//               if (touchDeltaX.current <= -SWIPE_THRESHOLD) {
//                 goToModalImage(modalImageIndex + 1);
//               } else if (touchDeltaX.current >= SWIPE_THRESHOLD) {
//                 goToModalImage(modalImageIndex - 1);
//               }

//               touchStartX.current = null;
//               touchDeltaX.current = 0;
//             }}
//           >
//             <Image
//               src={gallery[modalImageIndex]}
//               alt={`${product.name} full-size photo ${modalImageIndex + 1}`}
//               width={2000}
//               height={2000}
//               sizes="100vw"
//               priority
//               className="h-full w-full object-contain select-none"
//               draggable={false}
//             />
//           </div>

//           {/* Previous button - desktop */}
//           {gallery.length > 1 && (
//             <>
//               <button
//                 type="button"
//                 aria-label="Previous image"
//                 onClick={() => goToModalImage(modalImageIndex - 1)}
//                 className="hidden sm:flex absolute left-6 top-1/2 z-20 h-14 w-14 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-4xl text-white backdrop-blur-md transition hover:bg-white/25"
//               >
//                 ‹
//               </button>

//               <button
//                 type="button"
//                 aria-label="Next image"
//                 onClick={() => goToModalImage(modalImageIndex + 1)}
//                 className="hidden sm:flex absolute right-6 top-1/2 z-20 h-14 w-14 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-4xl text-white backdrop-blur-md transition hover:bg-white/25"
//               >
//                 ›
//               </button>
//             </>
//           )}

//           {/* Bottom thumbnails */}
//           {gallery.length > 1 && (
//             <div className="absolute bottom-5 left-1/2 z-20 flex max-w-[90vw] -translate-x-1/2 gap-3 overflow-x-auto rounded-2xl bg-black/30 p-2 backdrop-blur-md">
//               {gallery.map((img, index) => (
//                 <button
//                   key={`modal-${img}-${index}`}
//                   type="button"
//                   onClick={() => setModalImageIndex(index)}
//                   className={`relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg border-2 transition sm:h-16 sm:w-16 ${modalImageIndex === index
//                     ? "border-white"
//                     : "border-white/30 opacity-70 hover:opacity-100"
//                     }`}
//                 >
//                   <Image
//                     src={img}
//                     alt={`${product.name} thumbnail ${index + 1}`}
//                     fill
//                     sizes="64px"
//                     className="object-contain bg-white"
//                   />
//                 </button>
//               ))}
//             </div>
//           )}
//         </div>
//       )}
//       {/* Mobile Sticky Cart Bar — Flipkart-style: Add to Cart | Buy at ₹price */}
//       {!outOfStock && selectedWeight && (
//         <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-[#E8DDD1] bg-white px-4 py-3 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] sm:hidden">
//           <div className="grid grid-cols-2 gap-3">
//             <button
//               onClick={handleAddToCart}
//               className={`flex items-center justify-center py-4 rounded-xl font-bold text-base border-2 transition ${added
//                 ? "border-[#4F6B52] bg-[#4F6B52] text-white"
//                 : "border-[#2D2A26] bg-white text-[#2D2A26] hover:bg-[#F3EDE3]"
//                 }`}
//             >
//               {added ? "Go to Cart" : "Add to cart"}
//             </button>

//             <button
//               onClick={handleBuyNow}
//               className="flex items-center justify-center py-4 rounded-xl font-extrabold text-base bg-[#F5C518] hover:bg-[#E6B60F] text-[#2D2A26] transition"
//             >
//               Buy at ₹{selectedWeight.price}
//             </button>
//           </div>
//         </div>
//       )}
//       {/* Breadcrumb */}
//       <div className="max-w-7xl mx-auto px-6 mb-8 text-sm text-[#7A6F65]">
//         <Link href="/" className="hover:text-[#C18A42] transition">
//           Home
//         </Link>{" "}
//         /{" "}
//         <Link href="/products" className="hover:text-[#C18A42] transition">
//           Shop
//         </Link>{" "}
//         / <span className="text-[#2D2A26] font-semibold">{product.name}</span>
//       </div>

//       <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-16">
//         {/* Image gallery */}
//         <div>
//           <div
//             className="relative rounded-3xl shadow-xl overflow-hidden bg-white border border-[#E8DDD1] select-none"
//             onTouchStart={handleTouchStart}
//             onTouchMove={handleTouchMove}
//             onTouchEnd={handleTouchEnd}
//             onMouseDown={handleMouseDown}
//             onMouseMove={handleMouseMove}
//             onMouseUp={endDrag}
//             onMouseLeave={endDrag}
//             onClick={() => {
//   if (gallery[activeImage]?.type === "image") {
//     openImageModal(activeImage);
//   }
// }}
//             role="button"
//             tabIndex={0}
//             aria-label="Open product media"
//             onKeyDown={(event) => {
//               if (event.key === "Enter" || event.key === " ") {
//                 event.preventDefault();
//                 openImageModal(activeImage);
//               }
//             }}
//           >
//             <div className="relative flex w-full items-center justify-center bg-white h-[320px] sm:h-[420px] md:h-[480px]">
//               {gallery[activeImage]?.type === "image" ? (
//   <Image
//     src={gallery[activeImage].src}
//     alt={product.name}
//     width={1200}
//     height={1200}
//     priority
//     draggable={false}
//     sizes="(max-width: 768px) 100vw, 50vw"
//     className="h-full w-full object-contain pointer-events-none"
//   />
// ) : (
//   <video
//     src={gallery[activeImage].src}
//     controls
//     playsInline
//     preload="metadata"
//     className="h-full w-full object-contain bg-black"
//     onClick={(e) => e.stopPropagation()}
//   >
//     Your browser does not support video playback.
//   </video>
// )}
//             </div>

//             <span className="absolute right-4 top-4 rounded-full bg-black/55 px-3 py-1.5 text-xs font-semibold text-white">
//               Click to enlarge
//             </span>

//             {/* Non-interactive page counter — just feedback, not a control */}
//             {gallery.length > 1 && (
//               <span className="absolute bottom-4 right-4 rounded-full bg-black/55 px-3 py-1 text-xs font-semibold text-white">
//                 {activeImage + 1} / {gallery.length}
//               </span>
//             )}
//           </div>

//           {gallery.length > 1 && (
//             <div className="flex gap-3 mt-4">
//               {gallery.map((img, index) => (
//                 <button
//                   key={`${img}-${index}`}
//                   onClick={() => setActiveImage(index)}
//                   className={`w-20 h-20 rounded-xl overflow-hidden border-2 transition ${activeImage === index
//                     ? "border-[#C18A42]"
//                     : "border-[#E8DDD1] hover:border-[#C18A42]/60"
//                     }`}
//                 >
//                   <Image
//                     src={img}
//                     alt={`${product.name} ${index + 1}`}
//                     width={80}
//                     height={80}
//                     className="w-full h-full object-cover"
//                   />
//                 </button>
//               ))}
//             </div>
//           )}
//         </div>

//         {/* Details */}
//         <div>
//           <div className="flex items-center gap-3 flex-wrap">
//             <span className="bg-[#3D5640] text-white px-4 py-1.5 rounded-full text-sm font-semibold tracking-wide uppercase">
//               {product.category}
//             </span>
//             {product.featured && (
//               <span className="bg-[#C18A42] text-white px-4 py-1.5 rounded-full text-sm font-semibold tracking-wide uppercase">
//                 Bestseller
//               </span>
//             )}
//           </div>

//           <h1
//             className="text-5xl font-extrabold mt-6 text-[#2D2A26]"
//             style={{ fontFamily: FONT_DISPLAY }}
//           >
//             {product.name}
//           </h1>

//           <div className="mt-4 flex items-center gap-2">
//             <div className="text-[#C18A42] text-xl tracking-tight">
//               {"★".repeat(fullStars)}
//               {"☆".repeat(5 - fullStars)}
//             </div>
//             <span className="text-[#7A6F65] text-base">
//               {rating > 0
//                 ? `${rating.toFixed(1)} (${reviewsCount} ${reviewsCount === 1 ? "Review" : "Reviews"
//                 })`
//                 : "No reviews yet"}
//             </span>
//           </div>

//           {/* Short 2-line preview only - full description lives in the Description tab below */}
//           {product.shortDescription && (
//             <p className="text-[#5A5249] text-base mt-4 line-clamp-2">
//               {product.shortDescription}
//             </p>
//           )}

//           {/* Variant selector */}
//           <div className="mt-8">
//             <label
//               htmlFor="product-weight"
//               className="mb-3 block text-lg font-bold text-[#2D2A26]"
//             >
//               Select Weight
//             </label>

//             <div className="relative max-w-md">
//               <select
//                 id="product-weight"
//                 value={selectedIndex}
//                 onChange={(e) => handleSelectWeight(Number(e.target.value))}
//                 className="w-full appearance-none rounded-2xl border-2 border-[#E8DDD1] bg-white px-5 py-4 pr-12 text-lg font-bold text-[#2D2A26] shadow-sm outline-none transition focus:border-[#C18A42] focus:ring-4 focus:ring-[#C18A42]/20"
//               >
//                 {displayWeights.map((weight, index) => {
//                   const label = weight.size || weight.quantity || weight.weight || "Size";
//                   return (
//                     <option key={`${label}-${index}`} value={index}>
//                       {`${label} - ₹${weight.price}${weight.stock <= 0 ? " - Out of Stock" : ""}`}
//                     </option>
//                   );
//                 })}
//               </select>
//               <span
//                 aria-hidden="true"
//                 className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 text-xl text-[#4F6B52]"
//               >
//                 ˅
//               </span>
//             </div>

//             <div className="mt-3 flex flex-wrap items-center gap-3 text-sm font-semibold">
//               {outOfStock ? (
//                 <span className="rounded-full bg-[#6B1F1F]/10 px-3 py-1 text-[#6B1F1F]">
//                   Out of Stock
//                 </span>
//               ) : selectedWeight && selectedStock <= 5 ? (
//                 <span className="rounded-full bg-[#6B1F1F]/10 px-3 py-1 text-[#6B1F1F]">
//                   Only {selectedStock} left
//                 </span>
//               ) : (
//                 <span className="rounded-full bg-[#4F6B52]/10 px-3 py-1 text-[#4F6B52]">
//                   In Stock
//                 </span>
//               )}
//               {selectedWeight && (
//                 <span className="text-[#7A6F65]">
//                   {selectedWeightLabel} selected
//                 </span>
//               )}
//             </div>
//           </div>

//           {/* Price summary */}
//           {selectedWeight && !outOfStock && (
//             <div className="mt-6 flex items-baseline gap-3">
//               <span className="text-3xl font-extrabold text-[#2D2A26]">
//                 ₹{selectedWeight.price}
//               </span>
//               <span className="text-[#7A6F65]">
//                 / {selectedWeightLabel}
//               </span>
//             </div>
//           )}

//           {outOfStock ? (
//             <div className="mt-8 bg-white border border-[#E8DDD1] rounded-2xl p-6">
//               <p className="text-[#6B1F1F] font-bold text-lg mb-1">
//                 Currently Out of Stock
//               </p>
//               <p className="text-[#7A6F65] text-sm mb-4">
//                 Leave your email and we'll let you know the moment it's back.
//               </p>

//               {notifySubmitted ? (
//                 <p className="text-[#4F6B52] font-semibold">
//                   ✓ You're on the list - we'll notify you!
//                 </p>
//               ) : (
//                 <form
//                   onSubmit={handleNotify}
//                   className="flex flex-col sm:flex-row gap-3"
//                 >
//                   <input
//                     type="email"
//                     required
//                     placeholder="you@example.com"
//                     value={notifyEmail}
//                     onChange={(e) => setNotifyEmail(e.target.value)}
//                     className="flex-1 border border-[#E8DDD1] rounded-xl px-4 py-3 text-[#2D2A26] focus:outline-none focus:ring-2 focus:ring-[#C18A42]/40"
//                   />
//                   <button
//                     type="submit"
//                     disabled={notifyLoading}
//                     className="bg-[#3D5640] hover:bg-[#2F4533] disabled:opacity-60 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl font-bold transition"
//                   >
//                     {notifyLoading ? "Adding..." : "Notify Me"}
//                   </button>
//                 </form>
//               )}
//             </div>
//           ) : (
//             // Desktop-only inline buttons. Mobile uses the fixed bottom bar instead.
//             <div className="hidden sm:grid grid-cols-2 gap-3 mt-8">

//               <button
//                 onClick={handleAddToCart}
//                 disabled={outOfStock}
//                 className={`py-4 rounded-2xl text-lg font-bold transition shadow-md ${added
//                   ? "bg-[#4F6B52] text-white"
//                   : "bg-[#1877F2] hover:bg-[#166FE5] text-white"
//                   }`}
//               >
//                 {added ? "Go to Cart" : "Add to Cart"}
//               </button>

//               <button
//                 onClick={handleBuyNow}
//                 disabled={outOfStock}
//                 className="bg-[#3D5640] hover:bg-[#2F4533] text-white py-4 rounded-2xl text-lg font-bold transition shadow-md"
//               >
//                 Buy Now
//               </button>

//             </div>
//           )}
//           {/* Trust badges */}
//           <div className="mt-10 grid grid-cols-3 gap-4 text-center">
//             <div className="bg-white rounded-xl p-4 border border-[#E8DDD1]">
//               <p className="text-sm font-semibold text-[#2D2A26]">
//                 100% Authentic
//               </p>
//               <p className="text-xs text-[#7A6F65] mt-1">
//                 Traditional recipes
//               </p>
//             </div>
//             <div className="bg-white rounded-xl p-4 border border-[#E8DDD1]">
//               <p className="text-sm font-semibold text-[#2D2A26]">
//                 No Preservatives
//               </p>
//               <p className="text-xs text-[#7A6F65] mt-1">Natural ingredients</p>
//             </div>
//             <div className="bg-white rounded-xl p-4 border border-[#E8DDD1]">
//               <p className="text-sm font-semibold text-[#2D2A26]">
//                 Fast Delivery
//               </p>
//               <p className="text-xs text-[#7A6F65] mt-1">
//                 Across India
//               </p>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Product Information Tabs */}

//       <section className="max-w-7xl mx-auto px-4 sm:px-6 mt-16 sm:mt-24">
//         <div className="bg-white rounded-3xl shadow-lg border border-[#E8DDD1] p-4 sm:p-8">

//           {/* Tabs */}

//           <div className="flex flex-wrap gap-3 mb-8">

//             <button
//               onClick={() => setActiveTab("specifications")}
//               className={`px-6 py-3 rounded-xl font-semibold transition ${activeTab === "specifications"
//                 ? "bg-[#3D5640] text-white"
//                 : "bg-[#F3EDE3] text-[#2D2A26]"
//                 }`}
//             >
//               Specifications
//             </button>

//             <button
//               onClick={() => setActiveTab("description")}
//               className={`px-6 py-3 rounded-xl font-semibold transition ${activeTab === "description"
//                 ? "bg-[#3D5640] text-white"
//                 : "bg-[#F3EDE3] text-[#2D2A26]"
//                 }`}
//             >
//               Description
//             </button>

//             <button
//               onClick={() => setActiveTab("manufacturer")}
//               className={`px-6 py-3 rounded-xl font-semibold transition ${activeTab === "manufacturer"
//                 ? "bg-[#3D5640] text-white"
//                 : "bg-[#F3EDE3] text-[#2D2A26]"
//                 }`}
//             >
//               Manufacturer Info
//             </button>

//           </div>

//           {/* Specifications Tab */}

//           {activeTab === "specifications" && (
//             <div>
//               <h2
//                 className="text-3xl font-extrabold text-[#2D2A26] mb-8"
//                 style={{ fontFamily: FONT_DISPLAY }}
//               >
//                 Specifications
//               </h2>

//               <div className="grid grid-cols-2 md:grid-cols-3 gap-8">

//                 <div>
//                   <p className="text-sm text-[#7A6F65]">Brand</p>
//                   <p className="font-bold text-[#2D2A26]">AchaarYaar</p>
//                 </div>

//                 <div>
//                   <p className="text-sm text-[#7A6F65]">Type</p>
//                   <p className="font-bold text-[#2D2A26]">Pickle</p>
//                 </div>

//                 <div>
//                   <p className="text-sm text-[#7A6F65]">Base Ingredient</p>
//                   <p className="font-bold text-[#2D2A26]">Natural Ingredients</p>
//                 </div>

//                 <div>
//                   <p className="text-sm text-[#7A6F65]">Shelf Life</p>
//                   <p className="font-bold text-[#2D2A26]">18 - 24 Months</p>
//                 </div>

//                 <div>
//                   <p className="text-sm text-[#7A6F65]">Delivery Time</p>
//                   <p className="font-bold text-[#2D2A26]">6 - 8 Days</p>
//                 </div>

//                 <div>
//                   <p className="text-sm text-[#7A6F65]">Container Type</p>
//                   <p className="font-bold text-[#2D2A26]">Glass Jar</p>
//                 </div>

//                 <div>
//                   <p className="text-sm text-[#7A6F65]">Storage Instructions</p>
//                   <p className="font-bold text-[#2D2A26]">
//                     Store in a cool & dry place
//                   </p>
//                 </div>

//                 <div>
//                   <p className="text-sm text-[#7A6F65]">Country of Origin</p>
//                   <p className="font-bold text-[#2D2A26]">India</p>
//                 </div>

//                 <div>
//                   <p className="text-sm text-[#7A6F65]">Preservatives</p>
//                   <p className="font-bold text-[#2D2A26]">
//                     No Artificial Preservatives
//                   </p>
//                 </div>

//               </div>
//             </div>
//           )}
//           {/* Description Tab */}
//           {activeTab === "description" && (
//             <div className="bg-[#FFFDF8] rounded-2xl sm:rounded-3xl p-5 sm:p-10">

//               {/* Heading */}
//               <h2
//                 className="mx-auto max-w-4xl text-3xl leading-tight sm:text-4xl md:text-5xl font-bold text-[#2D2A26] text-center"
//                 style={{ fontFamily: "'Playfair Display', serif" }}
//               >
//                 About {product.name}
//               </h2>

//               {/* Decorative Divider */}
//               <div className="flex items-center justify-center my-6 sm:my-8">
//                 <div className="h-[1px] flex-1 bg-[#D6C5AE]"></div>

//                 <span className="mx-3 sm:mx-4 text-2xl sm:text-3xl text-[#C18A42]">
//                   ~
//                 </span>

//                 <div className="h-[1px] flex-1 bg-[#D6C5AE]"></div>
//               </div>

//               {/* Description */}
//               <div className="max-w-5xl mx-auto">

//                 <p className="text-[#3B342D] text-[15px] leading-7 sm:text-lg sm:leading-8 md:text-xl md:leading-10 mb-7 sm:mb-8 font-medium whitespace-pre-line break-words">
//                   {product.description}
//                 </p>

//                 <div className="space-y-5 sm:space-y-6 text-[15px] leading-7 sm:text-lg sm:leading-8 md:text-xl md:leading-10 text-[#3B342D]">

//                   <div>
//                     <span
//                       className="font-bold text-[#2F5533]"
//                       style={{ fontFamily: "'Playfair Display', serif" }}
//                     >
//                       Ingredients :
//                     </span>{" "}
//                     Main seasonal ingredient, mustard oil, salt, mustard seeds,
//                     fennel, fenugreek, turmeric, chilli, hing, and traditional
//                     Indian spices, prepared according to the recipe of this jar.
//                   </div>

//                   <div>
//                     <span
//                       className="font-bold text-[#2F5533]"
//                       style={{ fontFamily: "'Playfair Display', serif" }}
//                     >
//                       Taste / Flavour :
//                     </span>{" "}
//                     Balanced, aromatic, homestyle, and rooted in Bihar-style
//                     achaar traditions.
//                   </div>

//                   <div>
//                     <span
//                       className="font-bold text-[#2F5533]"
//                       style={{ fontFamily: "'Playfair Display', serif" }}
//                     >
//                       Category :
//                     </span>{" "}
//                     {product.category || "Pickles & Chutneys"}
//                   </div>

//                   <div>
//                     <span
//                       className="font-bold text-[#2F5533]"
//                       style={{ fontFamily: "'Playfair Display', serif" }}
//                     >
//                       Shelf Life :
//                     </span>{" "}
//                     18 - 24 Months
//                   </div>

//                 </div>
//               </div>
//             </div>
//           )}

//           {/* Manufacturer Tab */}
//           {activeTab === "manufacturer" && (
//             <div>
//               <h2
//                 className="text-3xl font-extrabold text-[#2D2A26] mb-8"
//                 style={{ fontFamily: FONT_DISPLAY }}
//               >
//                 Manufacturer Info
//               </h2>

//               <div className="divide-y divide-[#E8DDD1] border-t border-b border-[#E8DDD1]">

//                 <div className="grid grid-cols-1 sm:grid-cols-3 gap-1 sm:gap-4 py-4">
//                   <p className="text-sm font-semibold text-[#7A6F65]">
//                     Manufacturer Name &amp; Address
//                   </p>
//                   <p className="sm:col-span-2 font-medium text-[#2D2A26]">
//                     Arkvon Group , Siwan, Bihar, India
//                   </p>
//                 </div>

//                 <div className="grid grid-cols-1 sm:grid-cols-3 gap-1 sm:gap-4 py-4">
//                   <p className="text-sm font-semibold text-[#7A6F65]">
//                     Packer Name &amp; Address
//                   </p>
//                   <p className="sm:col-span-2 font-medium text-[#2D2A26]">
//                     AchaarYaar , Siwan, Bihar, India
//                   </p>
//                 </div>

//                 <div className="grid grid-cols-1 sm:grid-cols-3 gap-1 sm:gap-4 py-4">
//                   <p className="text-sm font-semibold text-[#7A6F65]">
//                     Importer Name &amp; Address
//                   </p>
//                   <p className="sm:col-span-2 font-medium text-[#2D2A26]">
//                     Not Applicable
//                   </p>
//                 </div>
//                 <div className="grid grid-cols-1 sm:grid-cols-3 gap-1 sm:gap-4 py-4">
//                   <p className="text-sm font-semibold text-[#7A6F65]">
//                     Country of Origin
//                   </p>
//                   <p className="sm:col-span-2 font-medium text-[#2D2A26]">
//                     India
//                   </p>
//                 </div>

//                 <div className="grid grid-cols-1 sm:grid-cols-3 gap-1 sm:gap-4 py-4">
//                   <p className="text-sm font-semibold text-[#7A6F65]">
//                     Customer Care
//                   </p>
//                   <p className="sm:col-span-2 font-medium text-[#2D2A26]">
//                     For any queries regarding this product, please reach out
//                     via our Contact page.
//                   </p>
//                 </div>

//               </div>
//             </div>
//           )}
//         </div>
//       </section>
//     </div>
//   );
// }

"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/cartStore";
import Image from "next/image";

const FONT_DISPLAY = "'Playfair Display', Georgia, serif";

type Weight = {
  size?: string;
  quantity?: string;
  weight?: string;
  price: number;
  stock: number;
  unavailable?: boolean;
};

type GalleryItem = {
  type: "image" | "video";
  src: string;
};

type Review = {
  _id: string;
  productId: string;
  name: string;
  rating: number;
  title?: string;
  comment: string;
  images?: string[];
  videos?: string[];
  createdAt: string;
};

type Product = {
  _id: string;
  name: string;
  description: string;
  shortDescription?: string;
  category: string;

  image: string;
  images?: string[];
  videos?: string[];

  weights: Weight[];
  featured?: boolean;
  rating?: number;
  reviewsCount?: number;

  isCombo?: boolean;
  comboSize?: number;
  comboUnitWeight?: string;
  comboPrice?: number;
  comboStock?: number;
  comboVariants?: {
    unitWeight: string;
    price: number;
    stock: number;
  }[];
};

const STANDARD_SIZES = ["120g", "220g", "330g", "430g"];

export default function ProductDetailsClient({
  product,
  relatedProducts,
}: {
  product: Product;
  relatedProducts: Product[];
}) {
  const router = useRouter();
  const addItem = useCartStore((state) => state.addItem);

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [added, setAdded] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("specifications");

  // ============================================================
  // REVIEW STATES
  // ============================================================

  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);

  const [reviewName, setReviewName] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState("");
  const [reviewComment, setReviewComment] = useState("");

  const [reviewImages, setReviewImages] = useState<string[]>([]);
  const [reviewVideos, setReviewVideos] = useState<string[]>([]);

  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewUploading, setReviewUploading] = useState(false);

  // ============================================================
  // PRODUCT MEDIA GALLERY
  // ============================================================

  const imageList =
    product.images && product.images.length > 0
      ? product.images
      : product.image
        ? [product.image]
        : [];

  const gallery: GalleryItem[] = [
    ...imageList.map((src) => ({
      type: "image" as const,
      src,
    })),
    ...(product.videos || [])
      .filter(Boolean)
      .map((src) => ({
        type: "video" as const,
        src,
      })),
  ];

  // ============================================================
  // COMBO / WEIGHT LOGIC
  // ============================================================

  const isCombo =
    product.isCombo === true ||
    product.category?.toLowerCase().includes("combo") ||
    product._id.startsWith("combo-");

  const displayWeights: Weight[] = isCombo
    ? product.comboVariants && product.comboVariants.length > 0
      ? product.comboVariants.map((v) => ({
        size: `${v.unitWeight} × ${product.comboSize || 2} jars`,
        price: Number(v.price || 0),
        stock: Number(v.stock || 0),
      }))
      : [
        {
          size:
            product.comboUnitWeight && product.comboSize
              ? `${product.comboUnitWeight} × ${product.comboSize} jars`
              : `${product.comboSize || 2}-Pack Combo`,
          price: Number(product.comboPrice || 0),
          stock: Number(product.comboStock || 0),
        },
      ]
    : (product.weights || []).filter((weight) => {
      const size =
        weight.size ||
        weight.quantity ||
        weight.weight;

      return (
        STANDARD_SIZES.includes(size || "") &&
        Number(weight.price) > 0
      );
    });

  // ============================================================
  // STATES
  // ============================================================

  const [activeImage, setActiveImage] = useState(0);
  const [isImageModalOpen, setIsImageModalOpen] =
    useState(false);
  const [modalImageIndex, setModalImageIndex] =
    useState(0);

  const [notifyEmail, setNotifyEmail] =
    useState("");

  const [notifySubmitted, setNotifySubmitted] =
    useState(false);

  const [notifyLoading, setNotifyLoading] =
    useState(false);

  // ============================================================
  // FETCH REVIEWS
  // ============================================================

  const fetchReviews = async () => {
    try {
      setReviewsLoading(true);

      const res = await fetch(
        `/api/reviews?productId=${encodeURIComponent(product._id)}`,
        {
          cache: "no-store",
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.message || "Failed to fetch reviews"
        );
      }

      setReviews(Array.isArray(data.reviews) ? data.reviews : []);
    } catch (error) {
      console.error("Fetch reviews error:", error);
      setReviews([]);
    } finally {
      setReviewsLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [product._id]);

  // ============================================================
  // REVIEW MEDIA UPLOAD
  // OPTIONAL PHOTO / VIDEO
  // ============================================================

  const handleReviewMediaUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = Array.from(e.target.files || []);

    if (files.length === 0) return;

    setReviewUploading(true);

    try {
      const uploadedImages: string[] = [];
      const uploadedVideos: string[] = [];

      for (const file of files) {
        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch(
          "/api/reviews/upload",
          {
            method: "POST",
            body: formData,
          }
        );

        const data = await res.json();

        if (!res.ok || !data.success) {
          throw new Error(
            data.message || "Media upload failed"
          );
        }

        if (data.resourceType === "image") {
          uploadedImages.push(data.url);
        }

        if (data.resourceType === "video") {
          uploadedVideos.push(data.url);
        }
      }

      if (uploadedImages.length > 0) {
        setReviewImages((prev) => [
          ...prev,
          ...uploadedImages,
        ]);
      }

      if (uploadedVideos.length > 0) {
        setReviewVideos((prev) => [
          ...prev,
          ...uploadedVideos,
        ]);
      }

      setToast("Media uploaded successfully");
    } catch (error: any) {
      setToast(
        error?.message ||
        "Failed to upload media"
      );
    } finally {
      setReviewUploading(false);
      e.target.value = "";

      setTimeout(
        () => setToast(null),
        3000
      );
    }
  };

  const removeReviewImage = (index: number) => {
    setReviewImages((prev) =>
      prev.filter((_, i) => i !== index)
    );
  };

  const removeReviewVideo = (index: number) => {
    setReviewVideos((prev) =>
      prev.filter((_, i) => i !== index)
    );
  };

  // ============================================================
  // SUBMIT REVIEW
  // ============================================================

  const handleSubmitReview = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (
      !reviewName.trim() ||
      !reviewComment.trim()
    ) {
      setToast(
        "Please enter your name and review"
      );
      return;
    }

    setReviewSubmitting(true);

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify({
          productId: product._id,
          name: reviewName.trim(),
          rating: reviewRating,
          title: reviewTitle.trim(),
          comment: reviewComment.trim(),
          images: reviewImages,
          videos: reviewVideos,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(
          data.message ||
          "Failed to submit review"
        );
      }

      setReviewName("");
      setReviewRating(5);
      setReviewTitle("");
      setReviewComment("");
      setReviewImages([]);
      setReviewVideos([]);

      setToast(
        "Thank you! Your review was submitted successfully"
      );

      await fetchReviews();
    } catch (error: any) {
      setToast(
        error?.message ||
        "Something went wrong. Please try again."
      );
    } finally {
      setReviewSubmitting(false);

      setTimeout(
        () => setToast(null),
        4000
      );
    }
  };

  // ============================================================
  // ESCAPE CLOSE MODAL
  // ============================================================

  useEffect(() => {
    const closeOnEscape = (
      event: KeyboardEvent
    ) => {
      if (event.key === "Escape") {
        setIsImageModalOpen(false);
      }
    };

    window.addEventListener(
      "keydown",
      closeOnEscape
    );

    return () =>
      window.removeEventListener(
        "keydown",
        closeOnEscape
      );
  }, []);

  // ============================================================
  // SWIPE
  // ============================================================

  const touchStartX =
    useRef<number | null>(null);

  const touchDeltaX = useRef(0);

  const SWIPE_THRESHOLD = 40;

  const goToImage = (index: number) => {
    if (gallery.length === 0) return;

    const newIndex =
      (index + gallery.length) %
      gallery.length;

    setActiveImage(newIndex);
  };

  const openImageModal = (
    index = activeImage
  ) => {
    setModalImageIndex(index);
    setIsImageModalOpen(true);
  };

  const closeImageModal = () => {
    setIsImageModalOpen(false);
  };

  const goToModalImage = (
    index: number
  ) => {
    if (gallery.length === 0) return;

    const newIndex =
      (index + gallery.length) %
      gallery.length;

    setModalImageIndex(newIndex);
  };

  const handleTouchStart = (
    e: React.TouchEvent
  ) => {
    touchStartX.current =
      e.touches[0].clientX;

    touchDeltaX.current = 0;
  };

  const handleTouchMove = (
    e: React.TouchEvent
  ) => {
    if (touchStartX.current === null) return;

    touchDeltaX.current =
      e.touches[0].clientX -
      touchStartX.current;
  };

  const handleTouchEnd = () => {
    if (touchStartX.current === null) return;

    if (
      touchDeltaX.current <=
      -SWIPE_THRESHOLD
    ) {
      goToImage(activeImage + 1);
    } else if (
      touchDeltaX.current >=
      SWIPE_THRESHOLD
    ) {
      goToImage(activeImage - 1);
    }

    touchStartX.current = null;
    touchDeltaX.current = 0;
  };

  // ============================================================
  // MOUSE DRAG
  // ============================================================

  const mouseStartX =
    useRef<number | null>(null);

  const mouseDeltaX = useRef(0);

  const isDragging = useRef(false);

  const handleMouseDown = (
    e: React.MouseEvent
  ) => {
    mouseStartX.current =
      e.clientX;

    mouseDeltaX.current = 0;
    isDragging.current = true;
  };

  const handleMouseMove = (
    e: React.MouseEvent
  ) => {
    if (
      !isDragging.current ||
      mouseStartX.current === null
    ) {
      return;
    }

    mouseDeltaX.current =
      e.clientX -
      mouseStartX.current;
  };

  const endDrag = () => {
    if (!isDragging.current) return;

    if (
      mouseDeltaX.current <=
      -SWIPE_THRESHOLD
    ) {
      goToImage(activeImage + 1);
    } else if (
      mouseDeltaX.current >=
      SWIPE_THRESHOLD
    ) {
      goToImage(activeImage - 1);
    }

    isDragging.current = false;
    mouseStartX.current = null;
    mouseDeltaX.current = 0;
  };

  // ============================================================
  // PRODUCT / STOCK
  // ============================================================

  const selectedWeight =
    displayWeights[selectedIndex];

  const selectedWeightLabel =
    selectedWeight?.size ||
    selectedWeight?.quantity ||
    selectedWeight?.weight ||
    "Size";

  const selectedStock =
    Number(selectedWeight?.stock || 0);

  const outOfStock =
    !selectedWeight ||
    selectedStock <= 0;

  const handleAddToCart = () => {
    if (added) {
      router.push("/cart");
      return;
    }

    if (!selectedWeight || outOfStock) {
      return;
    }

    addItem(
      {
        _id: product._id,
        name: product.name,
        price: selectedWeight.price,
        selectedVariant:
          selectedWeightLabel,
      },
      1
    );

    setAdded(true);

    setToast(
      `${product.name} (${selectedWeightLabel}) added to cart`
    );

    setTimeout(
      () => setToast(null),
      3000
    );
  };

  const handleBuyNow = () => {
    if (!selectedWeight || outOfStock) {
      return;
    }

    addItem(
      {
        _id: product._id,
        name: product.name,
        price: selectedWeight.price,
        selectedVariant:
          selectedWeightLabel,
      },
      1
    );

    router.push("/checkout");
  };

  const handleSelectWeight = (
    index: number
  ) => {
    setSelectedIndex(index);
    setAdded(false);
    setNotifySubmitted(false);
    setNotifyEmail("");
  };

  // ============================================================
  // STOCK NOTIFICATION
  // ============================================================

  const handleNotify = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    const email =
      notifyEmail.trim().toLowerCase();

    if (!email || !selectedWeight) {
      return;
    }

    setNotifyLoading(true);

    try {
      const res = await fetch(
        "/api/notify",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            productId: product._id,
            productName: product.name,
            variant:
              selectedWeightLabel,
            email,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.message ||
          "Failed to save notification request"
        );
      }

      setNotifySubmitted(true);

      setToast(
        data.alreadyRegistered
          ? "You're already on the notification list"
          : "We'll email you when it's back in stock"
      );
    } catch (error: any) {
      setToast(
        error?.message ||
        "Something went wrong - please try again"
      );
    } finally {
      setNotifyLoading(false);

      setTimeout(
        () => setToast(null),
        3000
      );
    }
  };

  // ============================================================
  // RATING CALCULATIONS
  // LIVE DATABASE REVIEWS
  // ============================================================

  const reviewsCount = reviews.length;

  const rating =
    reviewsCount > 0
      ? reviews.reduce(
        (sum, review) =>
          sum + Number(review.rating || 0),
        0
      ) / reviewsCount
      : product.rating ?? 0;

  const fullStars = Math.round(rating);

  const activeMedia =
    gallery[activeImage];

  const modalMedia =
    gallery[modalImageIndex];

  // ============================================================
  // JSX
  // ============================================================

  return (
    <div className="min-h-screen bg-[#FBF7F1] py-16 pb-32 relative">

      {toast && (
        <div className="fixed top-6 right-6 z-[10000] bg-[#3D5640] text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 max-w-md">
          <span className="text-[#C18A42] text-xl">
            ✓
          </span>

          <span className="font-semibold">
            {toast}
          </span>
        </div>
      )}

      {/* FULLSCREEN MEDIA MODAL */}

      {isImageModalOpen &&
        modalMedia && (
          <div
            role="dialog"
            aria-modal="true"
            aria-label={`Full-screen ${product.name} gallery`}
            className="fixed inset-0 z-[9999] bg-black"
          >
            <div className="absolute left-0 right-0 top-0 z-20 flex items-center justify-between p-4 sm:p-6">
              <button
                type="button"
                aria-label="Close gallery"
                onClick={closeImageModal}
                className="flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-3xl font-light text-white backdrop-blur-md transition hover:bg-white/25"
              >
                ×
              </button>

              {gallery.length > 1 && (
                <span className="rounded-full bg-white/15 px-4 py-2 text-sm font-bold text-white backdrop-blur-md">
                  {modalImageIndex + 1} /{" "}
                  {gallery.length}
                </span>
              )}
            </div>

            <div className="flex h-full w-full items-center justify-center px-3 py-20 sm:px-16">
              {modalMedia.type ===
                "image" ? (
                <Image
                  src={modalMedia.src}
                  alt={`${product.name} ${modalImageIndex + 1}`}
                  width={2000}
                  height={2000}
                  sizes="100vw"
                  priority
                  className="h-full w-full object-contain select-none"
                  draggable={false}
                />
              ) : (
                <video
                  key={modalMedia.src}
                  src={modalMedia.src}
                  controls
                  autoPlay
                  playsInline
                  className="max-h-full max-w-full object-contain"
                />
              )}
            </div>

            {gallery.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() =>
                    goToModalImage(
                      modalImageIndex - 1
                    )
                  }
                  className="hidden sm:flex absolute left-6 top-1/2 z-20 h-14 w-14 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-4xl text-white"
                >
                  ‹
                </button>

                <button
                  type="button"
                  onClick={() =>
                    goToModalImage(
                      modalImageIndex + 1
                    )
                  }
                  className="hidden sm:flex absolute right-6 top-1/2 z-20 h-14 w-14 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-4xl text-white"
                >
                  ›
                </button>
              </>
            )}
          </div>
        )}

      {/* MOBILE STICKY CART BAR */}

      {!outOfStock &&
        selectedWeight && (
          <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-[#E8DDD1] bg-white px-4 py-3 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] sm:hidden">
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleAddToCart}
                className={`flex items-center justify-center py-4 rounded-xl font-bold text-base border-2 transition ${added
                    ? "border-[#4F6B52] bg-[#4F6B52] text-white"
                    : "border-[#2D2A26] bg-white text-[#2D2A26]"
                  }`}
              >
                {added
                  ? "Go to Cart"
                  : "Add to cart"}
              </button>

              <button
                onClick={handleBuyNow}
                className="flex items-center justify-center py-4 rounded-xl font-extrabold text-base bg-[#F5C518] hover:bg-[#E6B60F] text-[#2D2A26]"
              >
                Buy at ₹{selectedWeight.price}
              </button>
            </div>
          </div>
        )}

      {/* BREADCRUMB */}

      <div className="max-w-7xl mx-auto px-6 mb-8 text-sm text-[#7A6F65]">
        <Link
          href="/"
          className="hover:text-[#C18A42]"
        >
          Home
        </Link>

        {" / "}

        <Link
          href="/products"
          className="hover:text-[#C18A42]"
        >
          Shop
        </Link>

        {" / "}

        <span className="text-[#2D2A26] font-semibold">
          {product.name}
        </span>
      </div>

      <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-16">

        {/* PRODUCT MEDIA */}

        <div>
          <div
            className="relative rounded-3xl shadow-xl overflow-hidden bg-white border border-[#E8DDD1] select-none"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={endDrag}
            onMouseLeave={endDrag}
            onClick={() => {
              if (
                activeMedia?.type === "image"
              ) {
                openImageModal(activeImage);
              }
            }}
          >
            <div className="relative flex w-full items-center justify-center bg-white h-[320px] sm:h-[420px] md:h-[480px]">
              {activeMedia?.type ===
                "image" ? (
                <Image
                  src={activeMedia.src}
                  alt={product.name}
                  width={1200}
                  height={1200}
                  priority
                  draggable={false}
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="h-full w-full object-contain pointer-events-none"
                />
              ) : activeMedia?.type ===
                "video" ? (
                <video
                  key={activeMedia.src}
                  src={activeMedia.src}
                  controls
                  playsInline
                  preload="metadata"
                  className="h-full w-full object-contain bg-black"
                  onClick={(e) =>
                    e.stopPropagation()
                  }
                />
              ) : (
                <div className="text-[#7A6F65]">
                  No media available
                </div>
              )}
            </div>

            {activeMedia?.type ===
              "image" && (
                <span className="absolute right-4 top-4 rounded-full bg-black/55 px-3 py-1.5 text-xs font-semibold text-white">
                  Click to enlarge
                </span>
              )}

            {gallery.length > 1 && (
              <span className="absolute bottom-4 right-4 rounded-full bg-black/55 px-3 py-1 text-xs font-semibold text-white">
                {activeImage + 1} /{" "}
                {gallery.length}
              </span>
            )}
          </div>

          {gallery.length > 1 && (
            <div className="flex gap-3 mt-4 overflow-x-auto pb-1">
              {gallery.map(
                (media, index) => (
                  <button
                    key={`${media.src}-${index}`}
                    type="button"
                    onClick={() =>
                      setActiveImage(index)
                    }
                    className={`relative flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 ${activeImage === index
                        ? "border-[#C18A42]"
                        : "border-[#E8DDD1]"
                      }`}
                  >
                    {media.type ===
                      "image" ? (
                      <Image
                        src={media.src}
                        alt={`${product.name} ${index + 1}`}
                        width={80}
                        height={80}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <>
                        <video
                          src={media.src}
                          muted
                          preload="metadata"
                          className="w-full h-full object-cover bg-black"
                        />

                        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                          <span className="text-white">
                            ▶
                          </span>
                        </div>
                      </>
                    )}
                  </button>
                )
              )}
            </div>
          )}
        </div>

        {/* PRODUCT DETAILS */}

        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <span className="bg-[#3D5640] text-white px-4 py-1.5 rounded-full text-sm font-semibold uppercase">
              {product.category}
            </span>

            {product.featured && (
              <span className="bg-[#C18A42] text-white px-4 py-1.5 rounded-full text-sm font-semibold uppercase">
                Bestseller
              </span>
            )}
          </div>

          <h1
            className="mt-4 text-2xl sm:text-3xl font-bold tracking-[-0.02em] leading-[1.2] text-[#2D2A26]"
            style={{
              fontFamily: FONT_DISPLAY,
            }}
          >
            {product.name}
          </h1>


          <div className="mt-4 flex items-center gap-2">
            <div className="text-[#C18A42] text-xl">
              {"★".repeat(fullStars)}
              {"☆".repeat(5 - fullStars)}
            </div>

            <span className="text-[#7A6F65] text-base">
              {rating > 0
                ? `${rating.toFixed(1)} (${reviewsCount} ${reviewsCount === 1
                  ? "Review"
                  : "Reviews"
                })`
                : "No reviews yet"}
            </span>
          </div>

          {product.shortDescription && (
            <p className="text-[#5A5249] text-base mt-4">
              {product.shortDescription}
            </p>
          )}

          {/* WEIGHT SELECTOR */}

          <div className="mt-8">
            <label className="mb-3 block text-lg font-bold text-[#2D2A26]">
              Select Weight
            </label>

            <select
              value={selectedIndex}
              onChange={(e) =>
                handleSelectWeight(
                  Number(e.target.value)
                )
              }
              className="w-full max-w-md rounded-2xl border-2 border-[#E8DDD1] bg-white px-5 py-4 text-lg font-bold text-[#2D2A26]"
            >
              {displayWeights.map(
                (weight, index) => {
                  const label =
                    weight.size ||
                    weight.quantity ||
                    weight.weight ||
                    "Size";

                  return (
                    <option
                      key={`${label}-${index}`}
                      value={index}
                    >
                      {label} - ₹{weight.price}
                      {weight.stock <= 0
                        ? " - Out of Stock"
                        : ""}
                    </option>
                  );
                }
              )}
            </select>

            <div className="mt-3">
              {outOfStock ? (
                <span className="text-[#6B1F1F] font-semibold">
                  Out of Stock
                </span>
              ) : (
                <span className="text-[#4F6B52] font-semibold">
                  In Stock
                </span>
              )}
            </div>
          </div>

          {selectedWeight &&
            !outOfStock && (
              <div className="mt-6">
                <span className="text-3xl font-extrabold text-[#2D2A26]">
                  ₹{selectedWeight.price}
                </span>
              </div>
            )}

          {outOfStock ? (
            <div className="mt-8 bg-white border border-[#E8DDD1] rounded-2xl p-6">
              <p className="text-[#6B1F1F] font-bold text-lg mb-4">
                Currently Out of Stock
              </p>

              {notifySubmitted ? (
                <p className="text-[#4F6B52] font-semibold">
                  ✓ You're on the notification list
                </p>
              ) : (
                <form
                  onSubmit={handleNotify}
                  className="flex flex-col sm:flex-row gap-3"
                >
                  <input
                    type="email"
                    required
                    placeholder="you@example.com"
                    value={notifyEmail}
                    onChange={(e) =>
                      setNotifyEmail(
                        e.target.value
                      )
                    }
                    className="flex-1 border border-[#E8DDD1] rounded-xl px-4 py-3"
                  />

                  <button
                    type="submit"
                    disabled={notifyLoading}
                    className="bg-[#3D5640] text-white px-6 py-3 rounded-xl font-bold"
                  >
                    {notifyLoading
                      ? "Adding..."
                      : "Notify Me"}
                  </button>
                </form>
              )}
            </div>
          ) : (
            <div className="hidden sm:grid grid-cols-2 gap-3 mt-8">
              <button
                onClick={handleAddToCart}
                className={`py-4 rounded-2xl text-lg font-bold ${added
                    ? "bg-[#4F6B52] text-white"
                    : "bg-[#1877F2] text-white"
                  }`}
              >
                {added
                  ? "Go to Cart"
                  : "Add to Cart"}
              </button>

              <button
                onClick={handleBuyNow}
                className="bg-[#3D5640] text-white py-4 rounded-2xl text-lg font-bold"
              >
                Buy Now
              </button>
            </div>
          )}

          {/* TRUST BADGES */}

          <div className="mt-10 grid grid-cols-3 gap-4 text-center">
            <div className="bg-white rounded-xl p-4 border border-[#E8DDD1]">
              <p className="text-sm font-semibold text-[#2D2A26]">
                100% Authentic
              </p>
              <p className="text-xs text-[#7A6F65] mt-1">
                Traditional recipes
              </p>
            </div>

            <div className="bg-white rounded-xl p-4 border border-[#E8DDD1]">
              <p className="text-sm font-semibold text-[#2D2A26]">
                No Preservatives
              </p>
              <p className="text-xs text-[#7A6F65] mt-1">
                Natural ingredients
              </p>
            </div>

            <div className="bg-white rounded-xl p-4 border border-[#E8DDD1]">
              <p className="text-sm font-semibold text-[#2D2A26]">
                Fast Delivery
              </p>
              <p className="text-xs text-[#7A6F65] mt-1">
                Across India
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* PRODUCT INFORMATION */}

      <section className="max-w-7xl mx-auto px-4 sm:px-6 mt-16 sm:mt-24">
        <div className="bg-white rounded-3xl shadow-lg border border-[#E8DDD1] p-4 sm:p-8">

          {/* TABS */}

          <div className="flex flex-wrap gap-3 mb-8">
            <button
              onClick={() =>
                setActiveTab("specifications")
              }
              className={`px-6 py-3 rounded-xl font-semibold ${activeTab === "specifications"
                  ? "bg-[#3D5640] text-white"
                  : "bg-[#F3EDE3] text-[#2D2A26]"
                }`}
            >
              Specifications
            </button>

            <button
              onClick={() =>
                setActiveTab("description")
              }
              className={`px-6 py-3 rounded-xl font-semibold ${activeTab === "description"
                  ? "bg-[#3D5640] text-white"
                  : "bg-[#F3EDE3] text-[#2D2A26]"
                }`}
            >
              Description
            </button>

            <button
              onClick={() =>
                setActiveTab("reviews")
              }
              className={`px-6 py-3 rounded-xl font-semibold ${activeTab === "reviews"
                  ? "bg-[#3D5640] text-white"
                  : "bg-[#F3EDE3] text-[#2D2A26]"
                }`}
            >
              Reviews
            </button>

            <button
              onClick={() =>
                setActiveTab("manufacturer")
              }
              className={`px-6 py-3 rounded-xl font-semibold ${activeTab === "manufacturer"
                  ? "bg-[#3D5640] text-white"
                  : "bg-[#F3EDE3] text-[#2D2A26]"
                }`}
            >
              Manufacturer Info
            </button>
          </div>

          {/* SPECIFICATIONS */}

          {activeTab ===
            "specifications" && (
              <div>
                <h2
                  className="text-3xl font-extrabold text-[#2D2A26] mb-8"
                  style={{
                    fontFamily: FONT_DISPLAY,
                  }}
                >
                  Specifications
                </h2>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
                  <div>
                    <p className="text-sm text-[#7A6F65]">
                      Brand
                    </p>
                    <p className="font-bold">
                      AchaarYaar
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-[#7A6F65]">
                      Type
                    </p>
                    <p className="font-bold">
                      Pickle
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-[#7A6F65]">
                      Shelf Life
                    </p>
                    <p className="font-bold">
                      18 - 24 Months
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-[#7A6F65]">
                      Delivery Time
                    </p>
                    <p className="font-bold">
                      6 - 8 Days
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-[#7A6F65]">
                      Container Type
                    </p>
                    <p className="font-bold">
                      Glass Jar
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-[#7A6F65]">
                      Country of Origin
                    </p>
                    <p className="font-bold">
                      India
                    </p>
                  </div>
                </div>
              </div>
            )}

          {/* DESCRIPTION */}

          {activeTab ===
            "description" && (
              <div className="bg-[#FFFDF8] rounded-3xl p-5 sm:p-10">
                <h2
                  className="text-3xl sm:text-4xl font-bold text-[#2D2A26] text-center"
                  style={{
                    fontFamily: FONT_DISPLAY,
                  }}
                >
                  About {product.name}
                </h2>

                <div className="max-w-5xl mx-auto mt-8">
                  <p className="text-[#3B342D] text-lg leading-8 whitespace-pre-line">
                    {product.description}
                  </p>
                </div>
              </div>
            )}

          {/* ====================================================
              REVIEWS
          ==================================================== */}

          {activeTab === "reviews" && (
            <div className="space-y-10">

              {/* REVIEW HEADER */}

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5 border-b border-[#E8DDD1] pb-8">
                <div>
                  <h2
                    className="text-3xl font-extrabold text-[#2D2A26]"
                    style={{
                      fontFamily: FONT_DISPLAY,
                    }}
                  >
                    Customer Reviews
                  </h2>

                  <div className="flex items-center gap-3 mt-3">
                    <span className="text-3xl font-extrabold text-[#2D2A26]">
                      {rating > 0
                        ? rating.toFixed(1)
                        : "0.0"}
                    </span>

                    <span className="text-[#C18A42] text-2xl">
                      {"★".repeat(fullStars)}
                      {"☆".repeat(5 - fullStars)}
                    </span>

                    <span className="text-[#7A6F65]">
                      Based on {reviewsCount}{" "}
                      {reviewsCount === 1
                        ? "review"
                        : "reviews"}
                    </span>
                  </div>
                </div>
              </div>

              {/* WRITE REVIEW FORM */}

              <div className="rounded-3xl border border-[#E8DDD1] bg-[#FFFDF8] p-5 sm:p-8">
                <h3 className="text-2xl font-bold text-[#2D2A26]">
                  Write a Review
                </h3>

                <p className="text-sm text-[#7A6F65] mt-2">
                  Share your experience with this product.
                  Photos and videos are optional.
                </p>

                <form
                  onSubmit={handleSubmitReview}
                  className="mt-6 space-y-5"
                >
                  <div className="grid sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-bold text-[#2D2A26] mb-2">
                        Your Name *
                      </label>

                      <input
                        type="text"
                        required
                        value={reviewName}
                        onChange={(e) =>
                          setReviewName(
                            e.target.value
                          )
                        }
                        placeholder="Enter your name"
                        maxLength={100}
                        className="w-full rounded-xl border border-[#E8DDD1] bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-[#C18A42]/40"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-[#2D2A26] mb-2">
                        Rating *
                      </label>

                      <select
                        value={reviewRating}
                        onChange={(e) =>
                          setReviewRating(
                            Number(e.target.value)
                          )
                        }
                        className="w-full rounded-xl border border-[#E8DDD1] bg-white px-4 py-3 outline-none"
                      >
                        <option value={5}>
                          ★★★★★ - Excellent
                        </option>
                        <option value={4}>
                          ★★★★☆ - Very Good
                        </option>
                        <option value={3}>
                          ★★★☆☆ - Good
                        </option>
                        <option value={2}>
                          ★★☆☆☆ - Fair
                        </option>
                        <option value={1}>
                          ★☆☆☆☆ - Poor
                        </option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-[#2D2A26] mb-2">
                      Review Title
                      <span className="font-normal text-[#7A6F65]">
                        {" "} (Optional)
                      </span>
                    </label>

                    <input
                      type="text"
                      value={reviewTitle}
                      onChange={(e) =>
                        setReviewTitle(
                          e.target.value
                        )
                      }
                      placeholder="Give your review a title"
                      maxLength={150}
                      className="w-full rounded-xl border border-[#E8DDD1] bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-[#C18A42]/40"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-[#2D2A26] mb-2">
                      Your Review *
                    </label>

                    <textarea
                      required
                      value={reviewComment}
                      onChange={(e) =>
                        setReviewComment(
                          e.target.value
                        )
                      }
                      placeholder="Tell us what you think about this product..."
                      maxLength={2000}
                      rows={5}
                      className="w-full resize-none rounded-xl border border-[#E8DDD1] bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-[#C18A42]/40"
                    />
                  </div>

                  {/* OPTIONAL MEDIA */}

                  <div>
                    <label className="block text-sm font-bold text-[#2D2A26] mb-2">
                      Add Photos or Video
                      <span className="font-normal text-[#7A6F65]">
                        {" "} (Optional)
                      </span>
                    </label>

                    <p className="text-xs text-[#7A6F65] mb-3">
                      Images up to 10 MB and videos up to 50 MB.
                    </p>

                    <input
                      type="file"
                      multiple
                      accept="image/*,video/*"
                      onChange={
                        handleReviewMediaUpload
                      }
                      disabled={
                        reviewUploading ||
                        reviewSubmitting
                      }
                      className="block w-full text-sm text-[#7A6F65] file:mr-4 file:rounded-xl file:border-0 file:bg-[#3D5640] file:px-4 file:py-3 file:font-bold file:text-white hover:file:bg-[#2F4533]"
                    />

                    {reviewUploading && (
                      <p className="mt-3 text-sm font-semibold text-[#C18A42]">
                        Uploading media...
                      </p>
                    )}

                    {/* IMAGE PREVIEWS */}

                    {reviewImages.length > 0 && (
                      <div className="flex flex-wrap gap-3 mt-4">
                        {reviewImages.map(
                          (url, index) => (
                            <div
                              key={`${url}-${index}`}
                              className="relative h-24 w-24 overflow-hidden rounded-xl border border-[#E8DDD1]"
                            >
                              <Image
                                src={url}
                                alt={`Review upload ${index + 1}`}
                                fill
                                sizes="96px"
                                className="object-cover"
                              />

                              <button
                                type="button"
                                onClick={() =>
                                  removeReviewImage(
                                    index
                                  )
                                }
                                className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/70 text-white"
                              >
                                ×
                              </button>
                            </div>
                          )
                        )}
                      </div>
                    )}

                    {/* VIDEO PREVIEWS */}

                    {reviewVideos.length > 0 && (
                      <div className="flex flex-wrap gap-3 mt-4">
                        {reviewVideos.map(
                          (url, index) => (
                            <div
                              key={`${url}-${index}`}
                              className="relative h-32 w-40 overflow-hidden rounded-xl border border-[#E8DDD1] bg-black"
                            >
                              <video
                                src={url}
                                controls
                                className="h-full w-full object-cover"
                              />

                              <button
                                type="button"
                                onClick={() =>
                                  removeReviewVideo(
                                    index
                                  )
                                }
                                className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/70 text-white"
                              >
                                ×
                              </button>
                            </div>
                          )
                        )}
                      </div>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={
                      reviewSubmitting ||
                      reviewUploading
                    }
                    className="rounded-xl bg-[#3D5640] px-7 py-3.5 font-bold text-white transition hover:bg-[#2F4533] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {reviewSubmitting
                      ? "Submitting Review..."
                      : "Submit Review"}
                  </button>
                </form>
              </div>

              {/* REVIEW LIST */}

              <div>
                <h3 className="text-2xl font-bold text-[#2D2A26] mb-6">
                  All Reviews
                </h3>

                {reviewsLoading ? (
                  <div className="py-10 text-center text-[#7A6F65]">
                    Loading reviews...
                  </div>
                ) : reviews.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-[#E8DDD1] p-10 text-center">
                    <p className="text-lg font-bold text-[#2D2A26]">
                      No reviews yet
                    </p>

                    <p className="mt-2 text-sm text-[#7A6F65]">
                      Be the first to share your experience!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-5">
                    {reviews.map((review) => (
                      <article
                        key={review._id}
                        className="rounded-2xl border border-[#E8DDD1] bg-white p-5 sm:p-7"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                          <div>
                            <h4 className="font-extrabold text-lg text-[#2D2A26]">
                              {review.name}
                            </h4>

                            <div className="mt-1 flex items-center gap-3">
                              <span className="text-[#C18A42]">
                                {"★".repeat(
                                  review.rating
                                )}
                                {"☆".repeat(
                                  5 - review.rating
                                )}
                              </span>

                              <span className="text-xs text-[#7A6F65]">
                                {review.createdAt
                                  ? new Date(
                                    review.createdAt
                                  ).toLocaleDateString(
                                    "en-IN",
                                    {
                                      day: "numeric",
                                      month: "short",
                                      year: "numeric",
                                    }
                                  )
                                  : ""}
                              </span>
                            </div>
                          </div>
                        </div>

                        {review.title && (
                          <h5 className="mt-5 font-bold text-[#2D2A26]">
                            {review.title}
                          </h5>
                        )}

                        <p className="mt-3 whitespace-pre-line leading-7 text-[#5A5249]">
                          {review.comment}
                        </p>

                        {/* REVIEW IMAGES */}

                        {review.images &&
                          review.images.length > 0 && (
                            <div className="mt-5 flex flex-wrap gap-3">
                              {review.images.map(
                                (url, index) => (
                                  <a
                                    key={`${url}-${index}`}
                                    href={url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="relative h-28 w-28 overflow-hidden rounded-xl border border-[#E8DDD1]"
                                  >
                                    <Image
                                      src={url}
                                      alt={`${review.name} review image ${index + 1}`}
                                      fill
                                      sizes="112px"
                                      className="object-cover"
                                    />
                                  </a>
                                )
                              )}
                            </div>
                          )}

                        {/* REVIEW VIDEOS */}

                        {review.videos &&
                          review.videos.length > 0 && (
                            <div className="mt-5 grid gap-4 sm:grid-cols-2">
                              {review.videos.map(
                                (url, index) => (
                                  <video
                                    key={`${url}-${index}`}
                                    src={url}
                                    controls
                                    playsInline
                                    className="w-full max-h-[350px] rounded-xl bg-black"
                                  />
                                )
                              )}
                            </div>
                          )}
                      </article>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* MANUFACTURER */}

          {activeTab ===
            "manufacturer" && (
              <div>
                <h2
                  className="text-3xl font-extrabold text-[#2D2A26] mb-8"
                  style={{
                    fontFamily: FONT_DISPLAY,
                  }}
                >
                  Manufacturer Info
                </h2>

                <div className="divide-y divide-[#E8DDD1] border-t border-b border-[#E8DDD1]">

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-1 sm:gap-4 py-4">
                    <p className="text-sm font-semibold text-[#7A6F65]">
                      Manufacturer Name & Address
                    </p>
                    <p className="sm:col-span-2 font-medium text-[#2D2A26]">
                      Arkvon Group, Siwan, Bihar, India
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-1 sm:gap-4 py-4">
                    <p className="text-sm font-semibold text-[#7A6F65]">
                      Packer Name & Address
                    </p>
                    <p className="sm:col-span-2 font-medium text-[#2D2A26]">
                      AchaarYaar, Siwan, Bihar, India
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-1 sm:gap-4 py-4">
                    <p className="text-sm font-semibold text-[#7A6F65]">
                      Importer Name & Address
                    </p>
                    <p className="sm:col-span-2 font-medium text-[#2D2A26]">
                      Not Applicable
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-1 sm:gap-4 py-4">
                    <p className="text-sm font-semibold text-[#7A6F65]">
                      Country of Origin
                    </p>
                    <p className="sm:col-span-2 font-medium text-[#2D2A26]">
                      India
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-1 sm:gap-4 py-4">
                    <p className="text-sm font-semibold text-[#7A6F65]">
                      Customer Care
                    </p>
                    <p className="sm:col-span-2 font-medium text-[#2D2A26]">
                      For any queries regarding this product, please reach out via our Contact page.
                    </p>
                  </div>
                </div>
              </div>
            )}

        </div>
      </section>
    </div>
  );
}