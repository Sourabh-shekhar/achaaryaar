"use client";

import { useState } from "react";
   
export default function AddProductPage() {
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [form, setForm] = useState({
        name: "",
        description: "",
        category: "",
        image: "",
        featured: false,

        price125: "",
        stock125: "",

        price225: "",
        stock225: "",

        price425: "",
        stock425: "",
    });

    const handleChange = (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLTextAreaElement
        >
    ) => {
        const { name, value, type, checked } = e.target as HTMLInputElement;

        setForm({
            ...form,
            [name]: type === "checkbox" ? checked : value,
        });
    };

    const handleSubmit = async (
        e: React.FormEvent
    ) => {
        e.preventDefault();

        let imageUrl = "";

        if (imageFile) {
            const reader = new FileReader();

            imageUrl = await new Promise<string>((resolve) => {
                reader.onloadend = async () => {
            const response = await fetch(`/api/upload`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            image: reader.result,
                        }),
                    });

                    const data = await response.json();

                    resolve(data.image);
                };

                reader.readAsDataURL(imageFile);
            });
        }

        const weights = [];
        if (form.price125) {
            weights.push({
                size: "125g",
                price: Number(form.price125),
                stock: Number(form.stock125),
            });
        }

        if (form.price225) {
            weights.push({
                size: "225g",
                price: Number(form.price225),
                stock: Number(form.stock225),
            });
        }

        if (form.price425) {
            weights.push({
                size: "425g",
                price: Number(form.price425),
                stock: Number(form.stock425),
            });
        }

        const res = await fetch(`/api/products`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },

            body: JSON.stringify({
                name: form.name,
                description: form.description,
                category: form.category,
                image: imageUrl,
                featured: form.featured,
                weights,
            }),
        });

        const data = await res.json();

        if (data.success) {
            alert("Product Added Successfully");

            setForm({
                name: "",
                description: "",
                category: "",
                image: "",
                featured: false,

                price125: "",
                stock125: "",

                price225: "",
                stock225: "",

                price425: "",
                stock425: "",
            });
        } else {
            alert("Failed to add product");
        }
    };

    return (
        <div className="min-h-screen bg-orange-50 py-10 px-5">

            <div className="max-w-3xl mx-auto bg-white p-10 rounded-3xl shadow-2xl">

                <h1 className="text-4xl font-bold text-center mb-10 text-gray-900">
                    Add Product
                </h1>

                <form
                    onSubmit={handleSubmit}
                    className="space-y-6"
                >

                    <input
                        type="file"
                        accept="image/*"
                        onChange={(e) =>
                            setImageFile(e.target.files?.[0] || null)
                        }
                        className="w-full p-4 border rounded-xl text-black"
                        required
                    />
                    {/* Product Name */}
                    <input
                        type="text"
                        name="name"
                        placeholder="Product Name"
                        value={form.name}
                        onChange={handleChange}
                        className="w-full p-4 border rounded-xl text-black"
                        required
                    />

                    <textarea
                        name="description"
                        placeholder="Description"
                        value={form.description}
                        onChange={handleChange}
                        className="w-full p-4 border rounded-xl text-black"
                        required
                    />

                    <input
                        type="text"
                        name="category"
                        placeholder="Category"
                        value={form.category}
                        onChange={handleChange}
                        className="w-full p-4 border rounded-xl text-black"
                        required
                    />

                    <div className="border p-5 rounded-xl">
                        <h2 className="font-bold text-xl mb-4 text-black">
                            125g Variant
                        </h2>

                        <input
                            type="number"
                            name="price125"
                            placeholder="Price"
                            value={form.price125}
                            onChange={handleChange}
                            className="w-full p-3 border rounded-xl mb-3 text-black"
                        />

                        <input
                            type="number"
                            name="stock125"
                            placeholder="Stock"
                            value={form.stock125}
                            onChange={handleChange}
                            className="w-full p-3 border rounded-xl text-black"
                        />
                    </div>

                    <div className="border p-5 rounded-xl">
                        <h2 className="font-bold text-xl mb-4 text-black">
                            225g Variant
                        </h2>

                        <input
                            type="number"
                            name="price225"
                            placeholder="Price"
                            value={form.price225}
                            onChange={handleChange}
                            className="w-full p-3 border rounded-xl mb-3 text-black"
                        />

                        <input
                            type="number"
                            name="stock225"
                            placeholder="Stock"
                            value={form.stock225}
                            onChange={handleChange}
                            className="w-full p-3 border rounded-xl text-black"
                        />
                    </div>

                    <div className="border p-5 rounded-xl">
                        <h2 className="font-bold text-xl mb-4 text-black">
                            425g Variant
                        </h2>

                        <input
                            type="number"
                            name="price425"
                            placeholder="Price"
                            value={form.price425}
                            onChange={handleChange}
                            className="w-full p-3 border rounded-xl mb-3 text-black"
                        />

                        <input
                            type="number"
                            name="stock425"
                            placeholder="Stock"
                            value={form.stock425}
                            onChange={handleChange}
                            className="w-full p-3 border rounded-xl text-black"
                        />
                    </div>

                    <label className="flex items-center gap-3 text-black">
                        <input
                            type="checkbox"
                            name="featured"
                            checked={form.featured}
                            onChange={handleChange}
                        />

                        Featured Product
                    </label>

                    <button
                        type="submit"
                        className="w-full bg-orange-600 text-white py-4 rounded-2xl font-bold text-xl hover:bg-orange-700"
                    >
                        Add Product
                    </button>

                </form>

            </div>

        </div>
    );
}

