"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { baseUrl } from "@/lib/baseUrl";

const PRODUCT_SIZES = ["125g", "225g", "425g"];

function normalizeEditableWeights(weights: any[] = []) {
    return PRODUCT_SIZES.map((size) => {
        const existing = weights.find(
            (weight) => (weight.size || weight.quantity || weight.weight) === size
        );

        return {
            size,
            price: existing?.price ?? "",
            stock: existing?.stock ?? "",
        };
    });
}

export default function EditProductPage() {
    const params = useParams<{ id: string }>();
    const router = useRouter();

    const id = params?.id;

    const [imageFile, setImageFile] = useState<File | null>(null);

    const [formData, setFormData] = useState<any>({
        name: "",
        image: "",
        description: "",
        weights: [],
    });

    useEffect(() => {
        if (id) {
            fetchProduct();
        }
    }, [id]);

    const fetchProduct = async () => {
        if (!id) return;
        try {
            const res = await fetch(`${baseUrl}/api/products/${id}`, {
                cache: "no-store",
            });

            const data = await res.json();

            if (data.success) {
                setFormData({
                    name: data.product.name || "",
                    image: data.product.image || "",
                    description: data.product.description || "",
                    weights: normalizeEditableWeights(data.product.weights),
                });
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();


        try {
            let imageUrl = formData.image;

            if (imageFile) {
                const data = new FormData();
                data.append("file", imageFile);

                const uploadRes = await fetch(`${baseUrl}/api/upload`, {
                    method: "POST",
                    body: data,
                });

                const uploadData = await uploadRes.json();

                imageUrl = uploadData.image;
            }
            const res = await fetch(
                `${baseUrl}/api/products/${id}`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        ...formData,
                        image: imageUrl,
                        weights: formData.weights
                            .filter((v: any) => v.price !== "" && Number(v.price) > 0)
                            .map((v: any) => ({
                                size: v.size || v.quantity,
                                price: Number(v.price),
                                stock: Number(v.stock || 0),
                            })),
                    }),
                }
            );


            const data = await res.json();

            if (data.success) {
                alert("Product updated successfully!");
                router.push("/admin/products");
            } else {
                alert("Failed to update product");
            }
        } catch (error) {
            console.error(error);
            alert("Something went wrong");
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <div className="max-w-3xl mx-auto bg-white p-8 rounded-2xl shadow-lg">

                <h1 className="text-3xl font-bold text-gray-900 mb-6">
                    Edit Product
                </h1>

                <form onSubmit={handleUpdate} className="space-y-5">

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
            type="number"
            placeholder="Price"
            value={formData.price}
            onChange={(e) =>
              setFormData({
                ...formData,
                price: e.target.value,
              })
            }
            className="w-full border rounded-xl p-3 text-gray-900"
            required
          /> */}
                    {formData.weights.map((variant: any, index: number) => (
                        <div key={index} className="border p-4 rounded-xl">

                            <h3 className="font-bold mb-2">
                                {variant.size}
                            </h3>

                            <input
                                type="number"
                                placeholder="Price"
                                value={variant.price}
                                onChange={(e) => {
                                    const updated = [...formData.weights];
                                    updated[index].price = e.target.value;

                                    setFormData({
                                        ...formData,
                                        weights: updated,
                                    });
                                }}
                                className="w-full border rounded-xl p-3 mb-3 text-gray-900"
                            />

                            <input
                                type="number"
                                placeholder="Stock"
                                value={variant.stock}
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
                    {/* <input
                        type="text"
                        placeholder="Image URL"
                        value={formData.image}
                        onChange={(e) =>
                            setFormData({
                                ...formData,
                                image: e.target.value,
                            })
                        }
                        className="w-full border rounded-xl p-3 text-gray-900"
                        required
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
                    />

                    <textarea
                        rows={4}
                        placeholder="Description"
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

                    {/* <input
            type="number"
            placeholder="Stock Quantity"
            value={formData.stock}
            onChange={(e) =>
              setFormData({
                ...formData,
                stock: e.target.value,
              })
            }
            className="w-full border rounded-xl p-3 text-gray-900"
            required
          /> */}

                    <button
                        type="submit"
                        className="bg-green-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-green-700"
                    >
                        Update Product
                    </button>

                </form>
            </div>
        </div>
    );
}

