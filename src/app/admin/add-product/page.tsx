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

        price220: "",
        stock220: "",

        price330: "",
        stock330: "",

        price430: "",
        stock430: "",
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
        if (form.price220) {
            weights.push({
                size: "220g",
                price: Number(form.price220),
                stock: Number(form.stock220),
            });
        }

        if (form.price330) {
            weights.push({
                size: "330g",
                price: Number(form.price330),
                stock: Number(form.stock330),
            });
        }

        if (form.price430) {
            weights.push({
                size: "430g",
                price: Number(form.price430),
                stock: Number(form.stock430),
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

                price220: "",
                stock220: "",

                price330: "",
                stock330: "",

                price430: "",
                stock430: "",
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
                            220g Variant
                        </h2>

                        <input
                            type="number"
                            name="price220"
                            placeholder="Price"
                            value={form.price220}
                            onChange={handleChange}
                            className="w-full p-3 border rounded-xl mb-3 text-black"
                        />

                        <input
                            type="number"
                            name="stock220"
                            placeholder="Stock"
                            value={form.stock220}
                            onChange={handleChange}
                            className="w-full p-3 border rounded-xl text-black"
                        />
                    </div>

                    <div className="border p-5 rounded-xl">
                        <h2 className="font-bold text-xl mb-4 text-black">
                            330g Variant
                        </h2>

                        <input
                            type="number"
                            name="price330"
                            placeholder="Price"
                            value={form.price330}
                            onChange={handleChange}
                            className="w-full p-3 border rounded-xl mb-3 text-black"
                        />

                        <input
                            type="number"
                            name="stock330"
                            placeholder="Stock"
                            value={form.stock330}
                            onChange={handleChange}
                            className="w-full p-3 border rounded-xl text-black"
                        />
                    </div>

                    <div className="border p-5 rounded-xl">
                        <h2 className="font-bold text-xl mb-4 text-black">
                            430g Variant
                        </h2>

                        <input
                            type="number"
                            name="price430"
                            placeholder="Price"
                            value={form.price430}
                            onChange={handleChange}
                            className="w-full p-3 border rounded-xl mb-3 text-black"
                        />

                        <input
                            type="number"
                            name="stock430"
                            placeholder="Stock"
                            value={form.stock430}
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

