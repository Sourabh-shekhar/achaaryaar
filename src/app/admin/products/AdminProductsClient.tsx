"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { baseUrl } from "@/lib/baseUrl";
export default function AdminProductsClient() {
    const router = useRouter();
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        image: "",
        description: "",
        category: "Pickle",

        weights: [
            {
                size: "125g",
                price: "",
                stock: "",
            },

            {
                size: "225g",
                price: "",
                stock: "",
            },

            {
                size: "425g",
                price: "",
                stock: "",
            },
        ],
    });

    // Combo pack fields — used only when isCombo is checked
    const [isCombo, setIsCombo] = useState(false);
    const [comboSize, setComboSize] = useState<2 | 3 | 4>(3);
    const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
    const [comboPrice, setComboPrice] = useState("");
    const [comboStock, setComboStock] = useState("");

    const [products, setProducts] = useState<any[]>([]);
    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const res = await fetch(`/api/products`, {
                cache: "no-store",
            });
            const data = await res.json();
            console.log(data)

            if (data.success) {
                setProducts(data.products);
            }
        } catch (error) {
            console.error(error);
        }
    };
    const deleteProduct = async (id: string) => {
        const confirmDelete = confirm(
            "Are you sure you want to delete this product?"
        );

        if (!confirmDelete) return;

        try {
            const res = await fetch(`/api/products/${id}`, {
                method: "DELETE",
            });

            const data = await res.json();

            if (data.success) {
                alert("Product deleted successfully");
                fetchProducts();
            }
        } catch (error) {
            console.error(error);
            alert("Failed to delete product");
        }
    };

    // Uploads the selected file to /api/upload and returns the hosted
    // image URL. Returns null (and alerts) if nothing was selected or
    // the upload fails, so handleSubmit can bail out cleanly.
    const uploadImage = async (): Promise<string | null> => {
        if (!imageFile) {
            alert("Please choose a product image");
            return null;
        }

        setIsUploading(true);

        try {
            const uploadData = new FormData();
            uploadData.append("file", imageFile);

            const res = await fetch(`/api/upload`, {
                method: "POST",
                body: uploadData,
            });

            const data = await res.json();

            if (!data.success || !data.url) {
                alert(data.message || "Image upload failed");
                return null;
            }

            return data.url as string;
        } catch (error) {
            console.error(error);
            alert("Image upload failed");
            return null;
        } finally {
            setIsUploading(false);
        }
    };

    const toggleComboProduct = (id: string) => {
        setSelectedProductIds((current) => {
            if (current.includes(id)) {
                return current.filter((pid) => pid !== id);
            }

            if (current.length >= comboSize) {
                alert(`You can only pick ${comboSize} products for this combo`);
                return current;
            }

            return [...current, id];
        });
    };

    const resetForm = () => {
        setFormData({
            name: "",
            image: "",
            description: "",
            category: "Pickle",
            weights: [
                { size: "125g", price: "", stock: "" },
                { size: "225g", price: "", stock: "" },
                { size: "425g", price: "", stock: "" },
            ],
        });
        setImageFile(null);
        setIsCombo(false);
        setComboSize(3);
        setSelectedProductIds([]);
        setComboPrice("");
        setComboStock("");
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const imageUrl = await uploadImage();
        if (!imageUrl) return;

        if (isCombo) {
            if (selectedProductIds.length !== comboSize) {
                alert(`Please select exactly ${comboSize} products for this combo`);
                return;
            }

            if (!comboPrice || Number(comboPrice) <= 0) {
                alert("Please enter a valid combo price");
                return;
            }

            const comboItems = selectedProductIds.map((id) => {
                const product = products.find((p) => p._id === id);
                return {
                    productId: id,
                    name: product?.name || "",
                    image: product?.image || "",
                    quantity: 1,
                };
            });

            try {
                const res = await fetch(`/api/products`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        name: formData.name,
                        image: imageUrl,
                        description: formData.description,
                        category: formData.category,
                        isCombo: true,
                        comboSize,
                        comboItems,
                        comboPrice: Number(comboPrice),
                        comboStock: Number(comboStock || 0),
                    }),
                });

                const data = await res.json();

                if (data.success) {
                    alert("Combo pack added successfully!");
                    fetchProducts();
                    resetForm();
                } else {
                    alert(data.message || "Failed to add combo pack");
                }
            } catch (error) {
                console.error(error);
                alert("Something went wrong");
            }

            return;
        }

        try {
            const res = await fetch(`/api/products`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    ...formData,
                    image: imageUrl,
                    weights: formData.weights
                        .filter((v) => v.price !== "" && Number(v.price) > 0)
                        .map((v) => ({
                            size: v.size,
                            price: Number(v.price),
                            stock: Number(v.stock || 0),
                        })),
                }),
            });
            const data = await res.json();

            if (data.success) {
                alert("Product added successfully!");
                fetchProducts();
                resetForm();
            } else {
                alert(data.message || "Failed to add product");
            }
        } catch (error) {
            console.error(error);
            alert("Something went wrong");
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-8">
                Product Management
            </h1>

            <div className="bg-white p-8 rounded-2xl shadow-lg max-w-3xl">

                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                    Add New Product
                </h2>

                {/* Combo toggle */}
                <label className="flex items-center gap-3 mb-6 bg-orange-50 border border-orange-200 rounded-xl p-4 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={isCombo}
                        onChange={(e) => setIsCombo(e.target.checked)}
                        className="w-5 h-5 accent-orange-600"
                    />
                    <span className="font-bold text-gray-900">
                        This is a Combo Pack
                    </span>
                </label>

                <form onSubmit={handleSubmit} className="space-y-5">

                    <input
                        type="text"
                        placeholder={isCombo ? "Combo Pack Name (e.g. Festive Combo)" : "Product Name"}
                        value={formData.name}
                        onChange={(e) =>
                            setFormData({
                                ...formData,
                                name: e.target.value,
                            })
                        }
                        className="w-full border rounded-xl p-3 text-gray-900"
                        required
                    />
                    <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                            if (e.target.files?.[0]) {
                                setImageFile(e.target.files[0]);
                            }
                        }}
                        className="w-full border rounded-xl p-3 text-gray-900"
                    />
                    {imageFile && (
                        <p className="text-sm text-gray-600 -mt-3">
                            Selected: {imageFile.name}
                        </p>
                    )}

                    <textarea
                        placeholder="Description"
                        rows={4}
                        value={formData.description}
                        onChange={(e) =>
                            setFormData({
                                ...formData,
                                description: e.target.value,
                            })
                        }
                        className="w-full border rounded-xl p-3 text-gray-900"
                        required
                    />

                    {isCombo ? (
                        <div className="space-y-5">

                            {/* Combo size picker */}
                            <div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3">
                                    Combo Size
                                </h3>
                                <div className="flex gap-3">
                                    {([2, 3, 4] as const).map((size) => (
                                        <button
                                            type="button"
                                            key={size}
                                            onClick={() => {
                                                setComboSize(size);
                                                setSelectedProductIds([]);
                                            }}
                                            className={`flex-1 py-3 rounded-xl font-bold border-2 transition ${comboSize === size
                                                ? "border-orange-600 bg-orange-600 text-white"
                                                : "border-gray-300 bg-white text-gray-700"
                                                }`}
                                        >
                                            {size}-Pack
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Product checklist */}
                            <div>
                                <h3 className="text-xl font-bold text-gray-900 mb-1">
                                    Select {comboSize} Products
                                </h3>
                                <p className="text-sm text-gray-500 mb-3">
                                    {selectedProductIds.length} / {comboSize} selected
                                </p>

                                <div className="max-h-72 overflow-y-auto border rounded-xl divide-y">
                                    {products
                                        .filter((p) => !p.isCombo)
                                        .map((product) => {
                                            const isSelected = selectedProductIds.includes(
                                                product._id
                                            );
                                            return (
                                                <label
                                                    key={product._id}
                                                    className={`flex items-center gap-3 p-3 cursor-pointer ${isSelected ? "bg-orange-50" : "bg-white"
                                                        }`}
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={isSelected}
                                                        onChange={() =>
                                                            toggleComboProduct(product._id)
                                                        }
                                                        className="w-5 h-5 accent-orange-600"
                                                    />
                                                    <img
                                                        src={product.image}
                                                        alt={product.name}
                                                        className="w-12 h-12 rounded-lg object-cover"
                                                    />
                                                    <span className="font-semibold text-gray-900">
                                                        {product.name}
                                                    </span>
                                                </label>
                                            );
                                        })}
                                </div>
                            </div>

                            {/* Combo price + stock */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Combo Price (₹)
                                    </label>
                                    <input
                                        type="number"
                                        placeholder="e.g. 499"
                                        value={comboPrice}
                                        onChange={(e) => setComboPrice(e.target.value)}
                                        className="w-full border rounded-xl p-3 text-gray-900"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Combo Stock
                                    </label>
                                    <input
                                        type="number"
                                        placeholder="e.g. 50"
                                        value={comboStock}
                                        onChange={(e) => setComboStock(e.target.value)}
                                        className="w-full border rounded-xl p-3 text-gray-900"
                                    />
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">

                            <h3 className="text-xl font-bold text-gray-900">
                                Product Variants
                            </h3>

                            {formData.weights.map((weight, index) => (

                                <div
                                    key={index}
                                    className="border p-4 rounded-xl bg-white"
                                >
                                    <h4 className="font-semibold mb-2 text-gray-900">
                                        {weight.size}
                                    </h4>

                                    <input
                                        type="number"
                                        placeholder="Price"
                                        value={weight.price}
                                        onChange={(e) => {
                                            const updated = [...formData.weights];

                                            updated[index].price = e.target.value;

                                            setFormData({
                                                ...formData,
                                                weights: updated,
                                            });
                                        }}
                                        className="w-full border rounded-xl p-3 mb-3 text-gray-900 bg-white"
                                    />

                                    <input
                                        type="number"
                                        placeholder="Stock"
                                        value={weight.stock}
                                        onChange={(e) => {
                                            const updated = [...formData.weights];

                                            updated[index].stock = e.target.value;

                                            setFormData({
                                                ...formData,
                                                weights: updated,
                                            });
                                        }}
                                        className="w-full border rounded-xl p-3 text-gray-900"
                                    />

                                </div>

                            ))}

                        </div>
                    )}


                    <button
                        type="submit"
                        disabled={isUploading}
                        className="bg-orange-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-orange-700 disabled:opacity-50"
                    >
                        {isUploading
                            ? "Uploading image..."
                            : isCombo
                                ? "Add Combo Pack"
                                : "Add Product"}
                    </button>

                </form>

            </div>
            <div className="mt-10">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">
                    All Products
                </h2>

                <div className="grid md:grid-cols-3 gap-6">
                    {products.map((product) => (
                        <div
                            key={product._id}
                            className="bg-white p-6 rounded-2xl shadow-lg"
                        >
                            <img
                                src={product.image}
                                alt={product.name}
                                className="h-48 w-full object-cover rounded-xl mb-4"
                            />

                            <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="text-xl font-bold text-gray-900">
                                    {product.name}
                                </h3>
                                {product.isCombo && (
                                    <span className="text-[10px] font-bold uppercase tracking-wide bg-orange-600 text-white px-2 py-0.5 rounded-full">
                                        {product.comboSize}-Pack Combo
                                    </span>
                                )}
                            </div>

                            {product.isCombo ? (
                                <div className="mt-2">
                                    <p className="text-orange-600 font-bold text-lg">
                                        ₹{product.comboPrice}
                                    </p>
                                    <p className="text-gray-700 text-sm">
                                        Stock: {product.comboStock}
                                    </p>
                                    <div className="mt-2 space-y-1">
                                        {product.comboItems?.map((item: any, i: number) => (
                                            <p key={i} className="text-sm text-gray-600">
                                                • {item.name} x{item.quantity}
                                            </p>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="mt-2">
                                    {product.weights?.map((variant: any, index: number) => (
                                        <div key={index} className="border-b py-1">
                                            <p className="font-semibold">
                                                {variant.size || variant.quantity}
                                            </p>

                                            <p className="text-orange-600">
                                                ₹{variant.price}
                                            </p>

                                            <p className="text-gray-700">
                                                Stock: {variant.stock}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            )}
                            <div className="flex gap-3 mt-4">
                                <Link
                                    href={`/admin/products/edit/${product._id}`}
                                    className="bg-blue-600 text-white px-4 py-2 rounded-xl"
                                >
                                    Edit
                                </Link>
                            </div>
                            <button
                                onClick={() => deleteProduct(product._id)}
                                className="mt-4 w-full bg-red-600 text-white py-2 rounded-xl hover:bg-red-700"
                            >
                                Delete Product
                            </button>
                            <button
                                onClick={() =>
                                    router.push(`/admin/products/edit/${product._id}`)
                                }
                                className="mt-2 w-full bg-blue-600 text-white py-2 rounded-xl hover:bg-blue-700"
                            >
                                Edit Product
                            </button>
                            {product.isCombo ? (
                                product.comboStock === 0 ? (
                                    <p className="text-red-600 font-bold mt-2">
                                        ❌ Out of Stock
                                    </p>
                                ) : product.comboStock <= 10 ? (
                                    <p className="text-yellow-600 font-bold mt-2">
                                        ⚠️ Low Stock
                                    </p>
                                ) : (
                                    <p className="text-green-600 font-bold mt-2">
                                        ✅ In Stock
                                    </p>
                                )
                            ) : product.weights?.every(
                                (v: any) => v.stock === 0
                            ) ? (
                                <p className="text-red-600 font-bold mt-2">
                                    ❌ Out of Stock
                                </p>
                            ) : product.weights?.some(
                                (v: any) => v.stock <= 10
                            ) ? (
                                <p className="text-yellow-600 font-bold mt-2">
                                    ⚠️ Low Stock
                                </p>
                            ) : (
                                <p className="text-green-600 font-bold mt-2">
                                    ✅ In Stock
                                </p>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>

    );
}