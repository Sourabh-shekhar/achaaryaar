"use client";
import Link from "next/link";
import { useCartStore } from "@/store/cartStore";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
const FONT_DISPLAY = "'Playfair Display', Georgia, serif";

type RazorpayPaymentResponse = {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
};

type RazorpayCheckoutOptions = {
    key: string;
    amount: number;
    currency: string;
    name: string;
    description: string;
    order_id: string;
    prefill: {
        name: string;
        email: string;
        contact: string;
    };
    theme: {
        color: string;
    };
    handler: (response: RazorpayPaymentResponse) => void;
    modal: {
        ondismiss: () => void;
    };
};

declare global {
    interface Window {
        Razorpay?: new (options: RazorpayCheckoutOptions) => { open: () => void };
    }
}

type SavedAddress = {
    _id: string;
    fullName: string;
    phone: string;
    addressLine: string;
    city: string;
    pincode: string;
    type: "Home" | "Work" | "Other";
    isDefault: boolean;
};

const emptyAddressForm = {
    fullName: "",
    phone: "",
    addressLine: "",
    city: "",
    pincode: "",
    type: "Home" as SavedAddress["type"],
};

export default function CheckoutPage() {
    const router = useRouter();
    const { data: session, status } = useSession();

    const [isPlacingOrder, setIsPlacingOrder] = useState(false);
    const [appliedCoupon, setAppliedCoupon] = useState("");

    const [email, setEmail] = useState("");
    const [paymentMethod, setPaymentMethod] = useState<"cod" | "razorpay">("cod");

    // Saved addresses - Flipkart style
    const [addresses, setAddresses] = useState<SavedAddress[]>([]);
    const [addressesLoading, setAddressesLoading] = useState(true);
    const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
    const [showAddForm, setShowAddForm] = useState(false);
    const [addressForm, setAddressForm] = useState(emptyAddressForm);
    const [isSavingAddress, setIsSavingAddress] = useState(false);
    const [addressError, setAddressError] = useState("");

    const items = useCartStore((state) => state.items);
    const clearCart = useCartStore((state) => state.clearCart);

    useEffect(() => {
        if (status !== "authenticated") return;
        setEmail((current) => current || session?.user?.email || "");
    }, [session?.user?.email, status]);

    // Fetch saved addresses once logged in
    useEffect(() => {
        if (status !== "authenticated") return;

        const fetchAddresses = async () => {
            setAddressesLoading(true);
            try {
                const res = await fetch("/api/addresses");
                const data = await res.json();

                if (data.success) {
                    setAddresses(data.addresses);

                    if (data.addresses.length === 0) {
                        setShowAddForm(true);
                    } else {
                        const defaultAddr =
                            data.addresses.find((a: SavedAddress) => a.isDefault) ||
                            data.addresses[0];
                        setSelectedAddressId(defaultAddr._id);
                    }
                }
            } catch (error) {
                console.error(error);
            } finally {
                setAddressesLoading(false);
            }
        };

        fetchAddresses();
    }, [status]);

    const subtotal = items.reduce((total, item) => {
        const price =
            typeof item.price === "number"
                ? item.price
                : parseInt(String(item.price).match(/\d+/)?.[0] || "0", 10);

        return total + price * item.quantity;
    }, 0);

    const shipping = items.length > 0 ? 50 : 0;
    const couponMap: Record<string, number> = {
        WELCOME10: 10,
        BIHAR10: 10,
    };
    const discountPercent = appliedCoupon ? couponMap[appliedCoupon] || 0 : 0;
    const discount = Math.round((subtotal * discountPercent) / 100);
    const total = Math.max(0, subtotal - discount + shipping);

    useEffect(() => {
        const savedCoupon = localStorage.getItem("achaaryaar_coupon") || "";
        if (couponMap[savedCoupon]) {
            setAppliedCoupon(savedCoupon);
        }
    }, []);

    const handleAddressFormChange = (
        field: keyof typeof emptyAddressForm,
        value: string
    ) => {
        setAddressForm((current) => ({ ...current, [field]: value }));
    };

    const handleSaveAddress = async (e: React.FormEvent) => {
        e.preventDefault();
        setAddressError("");

        if (!addressForm.fullName.trim()) {
            setAddressError("Please enter your full name");
            return;
        }
        if (!/^[0-9]{10}$/.test(addressForm.phone)) {
            setAddressError("Please enter a valid 10-digit phone number");
            return;
        }
        if (!addressForm.addressLine.trim()) {
            setAddressError("Please enter your address");
            return;
        }
        if (!addressForm.city.trim()) {
            setAddressError("Please enter your city");
            return;
        }
        if (!/^[0-9]{6}$/.test(addressForm.pincode)) {
            setAddressError("Please enter a valid 6-digit pincode");
            return;
        }

        setIsSavingAddress(true);

        try {
            const res = await fetch("/api/addresses", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(addressForm),
            });

            const data = await res.json();

            if (data.success) {
                setAddresses(data.addresses);
                const newest = data.addresses[data.addresses.length - 1];
                setSelectedAddressId(newest._id);
                setShowAddForm(false);
                setAddressForm(emptyAddressForm);
            } else {
                setAddressError(data.message || "Could not save address");
            }
        } catch (error) {
            console.error(error);
            setAddressError("Something went wrong - please try again");
        } finally {
            setIsSavingAddress(false);
        }
    };

    const handleDeleteAddress = async (id: string) => {
        try {
            const res = await fetch(`/api/addresses/${id}`, { method: "DELETE" });
            const data = await res.json();

            if (data.success) {
                setAddresses(data.addresses);

                if (selectedAddressId === id) {
                    const fallback = data.addresses.find((a: SavedAddress) => a.isDefault) ||
                        data.addresses[0];
                    setSelectedAddressId(fallback ? fallback._id : null);
                }

                if (data.addresses.length === 0) {
                    setShowAddForm(true);
                }
            }
        } catch (error) {
            console.error(error);
        }
    };

    const selectedAddress = addresses.find((a) => a._id === selectedAddressId);

    const handlePlaceOrder = async () => {
        if (!selectedAddress) {
            alert("Please select or add a delivery address");
            return;
        }

        if (!/^\S+@\S+\.\S+$/.test(email)) {
            alert("Please enter a valid email address");
            return;
        }

        if (items.length === 0) {
            alert("Your cart is empty");
            return;
        }

        setIsPlacingOrder(true);

        const orderPayload = {
            fullName: selectedAddress.fullName,
            phone: selectedAddress.phone,
            address: selectedAddress.addressLine,
            city: selectedAddress.city,
            pincode: selectedAddress.pincode,
            email,
            paymentMethod,
            items,
            subtotal,
            shipping,
            discount,
            couponCode: appliedCoupon,
            total,
        };

        try {
            if (paymentMethod === "razorpay") {
                const scriptLoaded = await loadRazorpayScript();

                if (!scriptLoaded || !window.Razorpay) {
                    setIsPlacingOrder(false);
                    alert("Unable to load Razorpay. Please try again.");
                    return;
                }

                const paymentOrderResponse = await fetch("/api/payments/razorpay/order", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        amount: total,
                    }),
                });

                const paymentOrderData = await paymentOrderResponse.json();

                if (!paymentOrderData.success) {
                    setIsPlacingOrder(false);
                    alert(paymentOrderData.message || "Payment could not be started");
                    return;
                }

                const razorpay = new window.Razorpay({
                    key: paymentOrderData.keyId,
                    amount: paymentOrderData.order.amount,
                    currency: paymentOrderData.order.currency,
                    name: "AchaarYaar",
                    description: "Pickle order payment",
                    order_id: paymentOrderData.order.id,
                    prefill: {
                        name: selectedAddress.fullName,
                        email,
                        contact: selectedAddress.phone,
                    },
                    theme: {
                        color: "#C18A42",
                    },
                    handler: async (paymentResponse) => {
                        try {
                            const verifyResponse = await fetch(
                                "/api/payments/razorpay/verify",
                                {
                                    method: "POST",
                                    headers: {
                                        "Content-Type": "application/json",
                                    },
                                    body: JSON.stringify({
                                        ...paymentResponse,
                                        orderPayload,
                                    }),
                                }
                            );

                            const verifyData = await verifyResponse.json();

                            if (verifyData.success) {
                                clearCart();
                                router.push(`/order-success?orderId=${verifyData.order._id}`);
                            } else {
                                alert(verifyData.message || "Payment verification failed");
                            }
                        } catch (error) {
                            console.error(error);
                            alert("Payment verification failed");
                        } finally {
                            setIsPlacingOrder(false);
                        }
                    },
                    modal: {
                        ondismiss: () => setIsPlacingOrder(false),
                    },
                });

                razorpay.open();
                return;
            }

            const response = await fetch("/api/orders", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(orderPayload),
            });

            const data = await response.json();

            if (data.success) {
                clearCart();
                router.push(`/order-success?orderId=${data.order._id}`);
            } else {
                alert("Order failed");
            }
        } catch (error) {
            console.error(error);
            alert("Something went wrong");
        } finally {
            if (paymentMethod !== "razorpay") {
                setIsPlacingOrder(false);
            }
        }
    };

    const inputClasses =
        "w-full border border-[#E8DDD1] bg-white rounded-xl px-4 py-3 text-[#2D2A26] font-medium placeholder:text-[#9C9388] focus:outline-none focus:ring-2 focus:ring-[#C18A42] focus:border-[#C18A42] transition";

    const labelClasses = "block text-[#4F6B52] font-semibold mb-2 text-sm tracking-wide";

    const loadRazorpayScript = () =>
        new Promise<boolean>((resolve) => {
            if (window.Razorpay) {
                resolve(true);
                return;
            }

            const script = document.createElement("script");
            script.src = "https://checkout.razorpay.com/v1/checkout.js";
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });

    if (status === "loading") {
        return (
            <div className="min-h-screen bg-[#FBF7F1] px-6 py-12">
                <div className="mx-auto max-w-3xl rounded-3xl border border-[#E8DDD1] bg-white p-8 text-center text-[#5C5249]">
                    Checking your account...
                </div>
            </div>
        );
    }

    if (status === "unauthenticated") {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[#FBF7F1] px-6 py-12">
                <div className="max-w-lg rounded-3xl border border-[#E8DDD1] bg-white p-8 text-center shadow-[0_18px_50px_rgba(28,61,46,0.1)]">
                    <h1
                        className="text-4xl font-black text-[#2D2A26]"
                        style={{ fontFamily: FONT_DISPLAY }}
                    >
                        Login first to place an order
                    </h1>
                    <p className="mt-4 leading-7 text-[#5C5249]">
                        Please sign in before checkout so we can save your order
                        history and tracking updates in your profile.
                    </p>
                    <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-center">
                        <Link
                            href="/login"
                            className="rounded-xl bg-[#C18A42] px-6 py-3 font-extrabold text-[#2D2A26]"
                        >
                            Login
                        </Link>
                        <Link
                            href="/signup"
                            className="rounded-xl border border-[#4F6B52] px-6 py-3 font-bold text-[#4F6B52]"
                        >
                            Create account
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#FBF7F1] py-12 px-6">
            <div className="max-w-6xl mx-auto">

                <h1
                    className="text-5xl font-extrabold text-[#2D2A26] mb-2"
                    style={{ fontFamily: FONT_DISPLAY }}
                >
                    Checkout
                </h1>
                <p className="text-[#7A6F65] mb-8">
                    Review your order and complete your purchase.
                </p>

                <div className="grid lg:grid-cols-3 gap-8">

                    {/* Shipping Details */}
                    <div className="lg:col-span-2 bg-white rounded-3xl shadow-xl border border-[#E8DDD1] p-8">

                        <h2
                            className="text-3xl font-bold text-[#2D2A26] mb-6"
                            style={{ fontFamily: FONT_DISPLAY }}
                        >
                            Delivery Address
                        </h2>

                        {/* Saved address cards - Flipkart style */}
                        {addressesLoading ? (
                            <p className="text-[#7A6F65]">Loading your addresses...</p>
                        ) : (
                            <div className="space-y-3 mb-6">
                                {addresses.map((addr) => {
                                    const isSelected = addr._id === selectedAddressId;
                                    return (
                                        <div
                                            key={addr._id}
                                            onClick={() => {
                                                setSelectedAddressId(addr._id);
                                                setShowAddForm(false);
                                            }}
                                            className={`relative flex gap-3 rounded-2xl border-2 p-4 cursor-pointer transition ${isSelected
                                                ? "border-[#C18A42] bg-[#FBF3E7]"
                                                : "border-[#E8DDD1] bg-white hover:border-[#C18A42]/50"
                                                }`}
                                        >
                                            <input
                                                type="radio"
                                                checked={isSelected}
                                                onChange={() => setSelectedAddressId(addr._id)}
                                                className="mt-1 accent-[#C18A42]"
                                            />

                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <span className="font-bold text-[#2D2A26]">
                                                        {addr.fullName}
                                                    </span>
                                                    <span className="text-[10px] font-bold uppercase tracking-wide bg-[#3D5640] text-white px-2 py-0.5 rounded-full">
                                                        {addr.type}
                                                    </span>
                                                    {addr.isDefault && (
                                                        <span className="text-[10px] font-bold uppercase tracking-wide bg-[#C18A42] text-white px-2 py-0.5 rounded-full">
                                                            Default
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-sm text-[#5A5249] mt-1 leading-6">
                                                    {addr.addressLine}, {addr.city} - {addr.pincode}
                                                </p>
                                                <p className="text-sm text-[#7A6F65] mt-1">
                                                    Phone: {addr.phone}
                                                </p>
                                            </div>

                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDeleteAddress(addr._id);
                                                }}
                                                className="self-start text-xs font-semibold text-[#6B1F1F] hover:underline"
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    );
                                })}

                                {!showAddForm && (
                                    <button
                                        type="button"
                                        onClick={() => setShowAddForm(true)}
                                        className="w-full flex items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-[#C18A42] py-4 font-bold text-[#C18A42] hover:bg-[#FBF3E7] transition"
                                    >
                                        + Add New Address
                                    </button>
                                )}
                            </div>
                        )}

                        {/* Add new address form */}
                        {showAddForm && (
                            <form
                                onSubmit={handleSaveAddress}
                                className="space-y-4 border-t border-[#E8DDD1] pt-6"
                            >
                                <h3
                                    className="text-xl font-bold text-[#2D2A26]"
                                    style={{ fontFamily: FONT_DISPLAY }}
                                >
                                    Add a new address
                                </h3>

                                {addressError && (
                                    <p className="text-sm font-semibold text-[#6B1F1F]">
                                        {addressError}
                                    </p>
                                )}

                                <div>
                                    <label className={labelClasses}>Full Name</label>
                                    <input
                                        type="text"
                                        placeholder="Enter your full name"
                                        value={addressForm.fullName}
                                        onChange={(e) =>
                                            handleAddressFormChange("fullName", e.target.value)
                                        }
                                        className={inputClasses}
                                    />
                                </div>

                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <label className={labelClasses}>Phone Number</label>
                                        <input
                                            type="tel"
                                            placeholder="10-digit mobile number"
                                            value={addressForm.phone}
                                            onChange={(e) =>
                                                handleAddressFormChange("phone", e.target.value)
                                            }
                                            className={inputClasses}
                                        />
                                    </div>

                                    <div>
                                        <label className={labelClasses}>Address Type</label>
                                        <div className="flex gap-2">
                                            {(["Home", "Work", "Other"] as const).map((t) => (
                                                <button
                                                    type="button"
                                                    key={t}
                                                    onClick={() => handleAddressFormChange("type", t)}
                                                    className={`flex-1 rounded-xl py-3 text-sm font-bold border-2 transition ${addressForm.type === t
                                                        ? "border-[#C18A42] bg-[#FBF3E7] text-[#2D2A26]"
                                                        : "border-[#E8DDD1] bg-white text-[#7A6F65]"
                                                        }`}
                                                >
                                                    {t}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className={labelClasses}>Address</label>
                                    <textarea
                                        rows={4}
                                        placeholder="House no, street, locality"
                                        value={addressForm.addressLine}
                                        onChange={(e) =>
                                            handleAddressFormChange("addressLine", e.target.value)
                                        }
                                        className={inputClasses}
                                    />
                                </div>

                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <label className={labelClasses}>City</label>
                                        <input
                                            type="text"
                                            placeholder="Enter city"
                                            value={addressForm.city}
                                            onChange={(e) =>
                                                handleAddressFormChange("city", e.target.value)
                                            }
                                            className={inputClasses}
                                        />
                                    </div>

                                    <div>
                                        <label className={labelClasses}>Pincode</label>
                                        <input
                                            type="text"
                                            placeholder="6-digit pincode"
                                            value={addressForm.pincode}
                                            onChange={(e) =>
                                                handleAddressFormChange("pincode", e.target.value)
                                            }
                                            className={inputClasses}
                                        />
                                    </div>
                                </div>

                                <div className="flex gap-3 pt-2">
                                    <button
                                        type="submit"
                                        disabled={isSavingAddress}
                                        className="flex-1 bg-[#3D5640] hover:bg-[#2F4533] text-white py-3 rounded-xl font-bold transition disabled:opacity-50"
                                    >
                                        {isSavingAddress ? "Saving..." : "Save Address"}
                                    </button>

                                    {addresses.length > 0 && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setShowAddForm(false);
                                                setAddressError("");
                                            }}
                                            className="rounded-xl border-2 border-[#E8DDD1] px-6 py-3 font-bold text-[#5A5249] hover:bg-[#F3EDE3] transition"
                                        >
                                            Cancel
                                        </button>
                                    )}
                                </div>
                            </form>
                        )}

                        {/* Email + payment method */}
                        <div className="mt-8 border-t border-[#E8DDD1] pt-6 space-y-5">
                            <div>
                                <label className={labelClasses}>Email</label>
                                <input
                                    type="email"
                                    placeholder="you@example.com"
                                    value={email}
                                    readOnly={Boolean(session?.user?.email)}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className={`${inputClasses} ${session?.user?.email ? "bg-[#F3EDE3]" : ""}`}
                                />
                                {session?.user?.email && (
                                    <p className="mt-1 text-xs text-[#7A6F65]">
                                        Orders will appear in this account profile.
                                    </p>
                                )}
                            </div>

                            <div>
                                <h3
                                    className="text-2xl font-bold text-[#2D2A26] mb-4"
                                    style={{ fontFamily: FONT_DISPLAY }}
                                >
                                    Payment Method
                                </h3>

                                <div className="space-y-3">

                                    <label
                                        className={`flex items-center gap-3 border rounded-xl p-4 cursor-pointer transition ${paymentMethod === "cod"
                                            ? "border-[#C18A42] bg-[#FBF3E7]"
                                            : "border-[#E8DDD1] bg-white"
                                            }`}
                                    >
                                        <input
                                            type="radio"
                                            name="payment"
                                            value="cod"
                                            checked={paymentMethod === "cod"}
                                            onChange={(e) =>
                                                setPaymentMethod(e.target.value as "cod" | "razorpay")
                                            }
                                            className="accent-[#C18A42]"
                                        />
                                        <span className="font-medium text-[#2D2A26]">
                                            Cash on Delivery (COD)
                                        </span>
                                    </label>

                                    <label
                                        className={`flex items-center gap-3 border rounded-xl p-4 cursor-pointer transition ${paymentMethod === "razorpay"
                                            ? "border-[#C18A42] bg-[#FBF3E7]"
                                            : "border-[#E8DDD1] bg-white"
                                            }`}
                                    >
                                        <input
                                            type="radio"
                                            name="payment"
                                            value="razorpay"
                                            checked={paymentMethod === "razorpay"}
                                            onChange={(e) =>
                                                setPaymentMethod(e.target.value as "cod" | "razorpay")
                                            }
                                            className="accent-[#C18A42]"
                                        />
                                        <span className="font-medium text-[#2D2A26]">
                                            Pay Online (UPI, Card, Net Banking)
                                        </span>
                                    </label>

                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Order Summary */}
                    <div className="bg-white rounded-3xl shadow-xl border border-[#E8DDD1] p-8 h-fit sticky top-8">

                        <h2
                            className="text-2xl font-bold text-[#2D2A26] mb-6"
                            style={{ fontFamily: FONT_DISPLAY }}
                        >
                            Order Summary
                        </h2>

                        {items.length === 0 ? (
                            <p className="text-[#7A6F65] text-sm mb-4">
                                Your cart is empty.{" "}
                                <Link
                                    href="/products"
                                    className="text-[#C18A42] font-semibold underline"
                                >
                                    Browse pickles →
                                </Link>
                            </p>
                        ) : (
                            <>
                                <div className="space-y-3 mb-4 max-h-64 overflow-y-auto pr-1">
                                    {items.map((item) => (
                                        <div
                                            key={`${item._id}-${item.selectedVariant}`}
                                            className="flex justify-between text-sm">
                                        
                                            <span className="text-[#2D2A26]">
                                                {item.name}
                                                <span className="text-[#9C9388]">
                                                    {" "}({item.selectedVariant}) x {item.quantity}
                                                </span>
                                            </span>

                                            <span className="font-medium text-[#2D2A26]">
                                                ₹{item.price}
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                <div className="space-y-4 border-t border-[#E8DDD1] pt-4">
                                    <div className="flex justify-between">
                                        <span className="text-[#7A6F65]">Subtotal</span>
                                        <span className="font-semibold text-[#2D2A26]">
                                            ₹{subtotal}
                                        </span>
                                    </div>

                                    <div className="flex justify-between">
                                        <span className="text-[#7A6F65]">Shipping</span>
                                        <span className="font-semibold text-[#2D2A26]">
                                            ₹{shipping}
                                        </span>
                                    </div>

                                    {discount > 0 && (
                                        <div className="flex justify-between">
                                            <span className="text-[#7A6F65]">
                                                Coupon ({appliedCoupon})
                                            </span>
                                            <span className="font-semibold text-[#4F6B52]">
                                                -₹{discount}
                                            </span>
                                        </div>
                                    )}

                                    <hr className="border-[#E8DDD1]" />

                                    <div className="flex justify-between text-xl font-bold">
                                        <span className="text-[#2D2A26]">Total</span>
                                        <span className="text-[#C18A42]">
                                            ₹{total}
                                        </span>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={handlePlaceOrder}
                                        disabled={items.length === 0 || isPlacingOrder || !selectedAddress}
                                        className="w-full bg-[#C18A42] text-white py-4 rounded-xl font-bold text-lg hover:bg-[#A8742F] transition mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isPlacingOrder
                                            ? "Processing..."
                                            : paymentMethod === "razorpay"
                                                ? "Pay Securely"
                                                : "Place COD Order"}
                                    </button>

                                    {!selectedAddress && (
                                        <p className="text-center text-xs text-[#6B1F1F] mt-2">
                                            Select or add a delivery address to continue
                                        </p>
                                    )}

                                    <p className="text-center text-xs text-[#9C9388] mt-2">
                                        ðŸ”’ Secure checkout Â· Handcrafted with care in Bihar
                                    </p>
                                </div>
                            </>
                        )}

                    </div>

                </div>

            </div>
        </div>
    );
}

