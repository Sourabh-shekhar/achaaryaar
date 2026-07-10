"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
   

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

    // Photos already saved on the product (fetched from the server).
    const [existingImages, setExistingImages] = useState<string[]>([]);
    // New photos picked in this session, not uploaded yet.
    const [newImageFiles, setNewImageFiles] = useState<File[]>([]);

    const [formData, setFormData] = useState<any>({
        name: "",
        image: "",
        description: "",
        shortDescription: "",
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
            const res = await fetch(`/api/products/${id}`, {
                cache: "no-store",
            });

            const data = await res.json();

            if (data.success) {
                setFormData({
                    name: data.product.name || "",
                    image: data.product.image || "",
                    description: data.product.description || "",
                    shortDescription: data.product.shortDescription || "",
                    weights: normalizeEditableWeights(data.product.weights),
                });

                // Fall back to the single `image` field for older products
                // that were saved before multi-photo support existed.
                const productImages =
                    Array.isArray(data.product.images) && data.product.images.length > 0
                        ? data.product.images
                        : data.product.image
                            ? [data.product.image]
                            : [];

                setExistingImages(productImages);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleNewImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;
        const picked = Array.from(e.target.files);
        setNewImageFiles((current) => [...current, ...picked]);
        e.target.value = "";
    };

    const removeExistingImage = (index: number) => {
        setExistingImages((current) => current.filter((_, i) => i !== index));
    };

    const removeNewImage = (index: number) => {
        setNewImageFiles((current) => current.filter((_, i) => i !== index));
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            // Upload any newly-added photos first.
            const uploadedUrls: string[] = [];

            for (const file of newImageFiles) {
                const data = new FormData();
                data.append("file", file);

                const uploadRes = await fetch(`/api/upload`, {
                    method: "POST",
                    body: data,
                });

                const uploadData = await uploadRes.json();

                if (!uploadData.success || !(uploadData.url || uploadData.image)) {
                    alert("One of the image uploads failed");
                    return;
                }

                uploadedUrls.push(uploadData.url || uploadData.image);
            }

            const allImages = [...existingImages, ...uploadedUrls];

            if (allImages.length === 0) {
                alert("Please keep at least one product photo");
                return;
            }

            const res = await fetch(
                `/api/products/${id}`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        ...formData,
                        image: allImages[0],
                        images: allImages,
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

                    {/* Existing photos — remove any that no longer apply */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Current Photos
                        </label>

                        {existingImages.length === 0 ? (
                            <p className="text-sm text-gray-500 mb-2">
                                No photos yet — add some below.
                            </p>
                        ) : (
                            <div className="flex flex-wrap gap-3 mb-2">
                                {existingImages.map((url, index) => (
                                    <div key={`${url}-${index}`} className="relative">
                                        <img
                                            src={url}
                                            alt={`Product photo ${index + 1}`}
                                            className="w-20 h-20 object-cover rounded-lg border"
                                        />
                                        {index === 0 && (
                                            <span className="absolute -top-2 -left-2 bg-orange-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                                                Cover
                                            </span>
                                        )}
                                        <button
                                            type="button"
                                            onClick={() => removeExistingImage(index)}
                                            className="absolute -top-2 -right-2 bg-red-600 text-white w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center"
                                        >
                                            ×
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        <label className="block text-sm font-semibold text-gray-700 mb-2 mt-4">
                            Add New Photos
                        </label>
                        <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleNewImageSelect}
                            className="w-full border rounded-xl p-3 text-gray-900"
                        />

                        {newImageFiles.length > 0 && (
                            <div className="flex flex-wrap gap-3 mt-3">
                                {newImageFiles.map((file, index) => (
                                    <div key={`${file.name}-${index}`} className="relative">
                                        <img
                                            src={URL.createObjectURL(file)}
                                            alt={file.name}
                                            className="w-20 h-20 object-cover rounded-lg border"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removeNewImage(index)}
                                            className="absolute -top-2 -right-2 bg-red-600 text-white w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center"
                                        >
                                            ×
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

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