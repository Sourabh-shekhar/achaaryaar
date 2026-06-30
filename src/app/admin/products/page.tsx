"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { baseUrl } from "@/lib/baseUrl";
export default function AdminProductsPage() {
    const router = useRouter();
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [formData, setFormData] = useState({
        name: "",
        image: "",
        description: "",
        category: "Pickle",

        variants: [
            {
                quantity: "150g",
                price: "",
                stock: "",
            },

            {
                quantity: "250g",
                price: "",
                stock: "",
            },

            {
                quantity: "500g",
                price: "",
                stock: "",
            },
        ],
    });
    const [products, setProducts] = useState<any[]>([]);
    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const res = await fetch("/api/products");
            const data = await res.json();

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
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const res = await fetch("/api/products", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    ...formData,
                    variants: formData.variants.map((v) => ({
                        quantity: v.quantity,
                        price: Number(v.price),
                        stock: Number(v.stock),
                    })),
                }),
            });
            const data = await res.json();

            if (data.success) {
                alert("Product added successfully!");
                fetchProducts();
                setFormData({
                    name: "",
                    image: "",
                    description: "",
                    category: "Pickle",
                    variants: [
                        { quantity: "150g", price: "", stock: "" },
                        { quantity: "250g", price: "", stock: "" },
                        { quantity: "500g", price: "", stock: "" },
                    ],
                });
            } else {
                alert("Failed to add product");
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

                <form onSubmit={handleSubmit} className="space-y-5">

                    <input
                        type="text"
                        placeholder="Product Name"
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



                    {/* <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                    /> */}
                    <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                            if (e.target.files?.[0]) {
                                setImageFile(e.target.files[0]);
                            }
                        }}
                        className="w-full border rounded-xl p-3 text-gray-900"
                    /><input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                            if (e.target.files?.[0]) {
                                setImageFile(e.target.files[0]);
                            }
                        }}
                        className="w-full border rounded-xl p-3 text-gray-900"
                    />

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
                    <div className="space-y-4">

                        <h3 className="text-xl font-bold text-gray-900">
                            Product Variants
                        </h3>

                        {formData.variants.map((variant, index) => (

                            <div
                                key={index}
                                className="border p-4 rounded-xl bg-white"
                            >
                                <h4 className="font-semibold mb-2 text-gray-900">
                                    {variant.quantity}
                                </h4>

                                <input
                                    type="number"
                                    placeholder="Price"
                                    value={variant.price}
                                    onChange={(e) => {
                                        const updated = [...formData.variants];

                                        updated[index].price = e.target.value;

                                        setFormData({
                                            ...formData,
                                            variants: updated,
                                        });
                                    }}
                                    className="w-full border rounded-xl p-3 mb-3 text-gray-900 bg-white"
                                />

                                <input
                                    type="number"
                                    placeholder="Stock"
                                    value={variant.stock}
                                    onChange={(e) => {
                                        const updated = [...formData.variants];

                                        updated[index].stock = e.target.value;

                                        setFormData({
                                            ...formData,
                                            variants: updated,
                                        });
                                    }}
                                    className="w-full border rounded-xl p-3 text-gray-900"
                                />

                            </div>

                        ))}

                    </div>


                    <button
                        type="submit"
                        className="bg-orange-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-orange-700"
                    >
                        Add Product
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

                            <h3 className="text-xl font-bold text-gray-900">
                                {product.name}
                            </h3>

                            <div className="mt-2">
                                {product.weights?.map((weight: any, index: number) => (
                                    <div key={index} className="border-b py-1">
                                        <p className="font-semibold">
                                            {weight.size}
                                        </p>

                                        <p className="text-orange-600">
                                            ₹{weight.price}
                                        </p>

                                        <p className="text-gray-700">
                                            Stock: {weight.stock}
                                        </p>
                                    </div>
                                ))}
                            </div>
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
                            {product.variants?.every(
                                (v: any) => v.stock === 0
                            ) ? (
                                <p className="text-red-600 font-bold mt-2">
                                    ❌ Out of Stock
                                </p>
                            ) : product.variants?.some(
                                (v: any) => v.stock <= 10
                            ) ? (
                                <p className="text-yellow-600 font-bold mt-2">
                                    ⚠ Low Stock
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