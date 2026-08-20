// "use client";

// import { useEffect, useState } from "react";
// import { useParams, useRouter } from "next/navigation";
   

// const PRODUCT_SIZES = ["120g", "220g", "330g", "430g"];

// function normalizeEditableWeights(weights: any[] = []) {
//     return PRODUCT_SIZES.map((size) => {
//         const existing = weights.find(
//             (weight) => (weight.size || weight.quantity || weight.weight) === size
//         );

//         return {
//             size,
//             price: existing?.price ?? "",
//             stock: existing?.stock ?? "",
//         };
//     });
// }

// // Same idea as normalizeEditableWeights, but for combo weight options.
// // If the product already has a comboVariants array (new-style), each row
// // is pre-filled from it. If not — an older combo saved before this field
// // existed — the single legacy comboUnitWeight/comboPrice/comboStock value
// // is placed into whichever row matches it, so nothing gets lost.
// function normalizeComboVariants(
//     comboVariants: any[] = [],
//     legacyUnitWeight?: string,
//     legacyPrice?: any,
//     legacyStock?: any
// ) {
//     return PRODUCT_SIZES.map((size) => {
//         const existing = comboVariants.find((v) => v.unitWeight === size);
//         if (existing) {
//             return {
//                 unitWeight: size,
//                 price: existing.price ?? "",
//                 stock: existing.stock ?? "",
//             };
//         }

//         if (comboVariants.length === 0 && legacyUnitWeight === size) {
//             return {
//                 unitWeight: size,
//                 price: legacyPrice ?? "",
//                 stock: legacyStock ?? "",
//             };
//         }

//         return { unitWeight: size, price: "", stock: "" };
//     });
// }

// export default function EditProductPage() {
//     const params = useParams<{ id: string }>();
//     const router = useRouter();

//     const id = params?.id;

//     // Photos already saved on the product (fetched from the server).
//     const [existingImages, setExistingImages] = useState<string[]>([]);
//     // New photos picked in this session, not uploaded yet.
//     const [newImageFiles, setNewImageFiles] = useState<File[]>([]);

//     const [formData, setFormData] = useState<any>({
//         name: "",
//         image: "",
//         description: "",
//         shortDescription: "",
//         isCombo: false,
//         comboSize: 2,
//         comboVariants: [] as { unitWeight: string; price: any; stock: any }[],
//         weights: [],
//     });

//     useEffect(() => {
//         if (id) {
//             fetchProduct();
//         }
//     }, [id]);

//     const fetchProduct = async () => {
//         if (!id) return;
//         try {
//             const res = await fetch(`/api/products/${id}`, {
//                 cache: "no-store",
//             });

//             const data = await res.json();

//             if (data.success) {
//                 setFormData({
//                     name: data.product.name || "",
//                     image: data.product.image || "",
//                     description: data.product.description || "",
//                     shortDescription: data.product.shortDescription || "",
//                     isCombo: data.product.isCombo === true,
//                     comboSize: data.product.comboSize || 2,
//                     comboVariants: data.product.isCombo
//                         ? normalizeComboVariants(
//                               data.product.comboVariants,
//                               data.product.comboUnitWeight,
//                               data.product.comboPrice,
//                               data.product.comboStock
//                           )
//                         : [],
//                     weights: data.product.isCombo ? [] : normalizeEditableWeights(data.product.weights),
//                 });

//                 // Fall back to the single `image` field for older products
//                 // that were saved before multi-photo support existed.
//                 const productImages =
//                     Array.isArray(data.product.images) && data.product.images.length > 0
//                         ? data.product.images
//                         : data.product.image
//                             ? [data.product.image]
//                             : [];

//                 setExistingImages(productImages);
//             }
//         } catch (error) {
//             console.error(error);
//         }
//     };

//     const handleNewImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
//         if (!e.target.files || e.target.files.length === 0) return;
//         const picked = Array.from(e.target.files);
//         setNewImageFiles((current) => [...current, ...picked]);
//         e.target.value = "";
//     };

//     const removeExistingImage = (index: number) => {
//         setExistingImages((current) => current.filter((_, i) => i !== index));
//     };

//     const removeNewImage = (index: number) => {
//         setNewImageFiles((current) => current.filter((_, i) => i !== index));
//     };

//     const handleUpdate = async (e: React.FormEvent) => {
//         e.preventDefault();

//         if (
//             formData.isCombo &&
//             !formData.comboVariants.some(
//                 (v: any) => v.price !== "" && Number(v.price) > 0
//             )
//         ) {
//             alert("Please enter a price for at least one weight option");
//             return;
//         }

//         try {
//             // Upload any newly-added photos first.
//             const uploadedUrls: string[] = [];

//             for (const file of newImageFiles) {
//                 const data = new FormData();
//                 data.append("file", file);

//                 const uploadRes = await fetch(`/api/upload`, {
//                     method: "POST",
//                     body: data,
//                 });

//                 const uploadData = await uploadRes.json();

//                 if (!uploadData.success || !(uploadData.url || uploadData.image)) {
//                     alert("One of the image uploads failed");
//                     return;
//                 }

//                 uploadedUrls.push(uploadData.url || uploadData.image);
//             }

//             const allImages = [...existingImages, ...uploadedUrls];

//             if (allImages.length === 0) {
//                 alert("Please keep at least one product photo");
//                 return;
//             }

//             const validComboVariants = formData.isCombo
//                 ? formData.comboVariants
//                       .filter((v: any) => v.price !== "" && Number(v.price) > 0)
//                       .map((v: any) => ({
//                           unitWeight: v.unitWeight,
//                           price: Number(v.price),
//                           stock: Number(v.stock || 0),
//                       }))
//                 : [];

//             const res = await fetch(
//                 `/api/products/${id}`,
//                 {
//                     method: "PATCH",
//                     headers: {
//                         "Content-Type": "application/json",
//                     },
//                     body: JSON.stringify({
//                         ...formData,
//                         image: allImages[0],
//                         images: allImages,
//                         ...(formData.isCombo
//                             ? {
//                                 isCombo: true,
//                                 comboSize: Number(formData.comboSize),
//                                 comboVariants: validComboVariants,
//                                 // legacy single-value fields kept in sync with the
//                                 // first variant, so any older code reading them
//                                 // directly still works
//                                 comboUnitWeight: validComboVariants[0]?.unitWeight || "",
//                                 comboPrice: validComboVariants[0]?.price || 0,
//                                 comboStock: validComboVariants[0]?.stock || 0,
//                                 weights: [],
//                               }
//                             : {
//                                 isCombo: false,
//                                 weights: formData.weights
//                                   .filter((v: any) => v.price !== "" && Number(v.price) > 0)
//                                   .map((v: any) => ({
//                                     size: v.size || v.quantity,
//                                     price: Number(v.price),
//                                     stock: Number(v.stock || 0),
//                                   })),
//                               }),
//                     }),
//                 }
//             );


//             const data = await res.json();

//             if (data.success) {
//                 alert("Product updated successfully!");
//                 router.push("/admin/products");
//             } else {
//                 alert("Failed to update product");
//             }
//         } catch (error) {
//             console.error(error);
//             alert("Something went wrong");
//         }
//     };

//     return (
//         <div className="min-h-screen bg-gray-100 p-8">
//             <div className="max-w-3xl mx-auto bg-white p-8 rounded-2xl shadow-lg">

//                 <h1 className="text-3xl font-bold text-gray-900 mb-6">
//                     Edit Product
//                 </h1>

//                 <form onSubmit={handleUpdate} className="space-y-5">

//                     <input
//                         type="text"
//                         placeholder="Product Name"
//                         value={formData.name}
//                         onChange={(e) =>
//                             setFormData({
//                                 ...formData,
//                                 name: e.target.value,
//                             })
//                         }
//                         className="w-full border rounded-xl p-3 text-gray-900"
//                         required
//                     />

//                     {formData.isCombo ? (
//                         <div className="rounded-xl border border-orange-200 bg-orange-50 p-4 space-y-4">
//                             <p className="font-bold text-orange-900">
//                                 Combo Weight Options ({formData.comboSize}-Pack)
//                             </p>
//                             <p className="text-sm text-gray-600">
//                                 Set a price for each weight you want to offer for this
//                                 combo. Leave a price blank to skip that option.
//                             </p>

//                             {formData.comboVariants.map((variant: any, index: number) => (
//                                 <div key={variant.unitWeight} className="border p-4 rounded-xl bg-white">
//                                     <h4 className="font-semibold mb-2 text-gray-900">
//                                         {variant.unitWeight} per jar × {formData.comboSize} jars
//                                     </h4>

//                                     <input
//                                         type="number"
//                                         placeholder="Combo Price"
//                                         value={variant.price}
//                                         onChange={(e) => {
//                                             const updated = [...formData.comboVariants];
//                                             updated[index].price = e.target.value;
//                                             setFormData({ ...formData, comboVariants: updated });
//                                         }}
//                                         className="w-full border rounded-xl p-3 mb-3 text-gray-900"
//                                     />

//                                     <input
//                                         type="number"
//                                         placeholder="Combo Stock"
//                                         value={variant.stock}
//                                         onChange={(e) => {
//                                             const updated = [...formData.comboVariants];
//                                             updated[index].stock = e.target.value;
//                                             setFormData({ ...formData, comboVariants: updated });
//                                         }}
//                                         className="w-full border rounded-xl p-3 text-gray-900"
//                                     />
//                                 </div>
//                             ))}
//                         </div>
//                     ) : formData.weights.map((variant: any, index: number) => (
//                         <div key={index} className="border p-4 rounded-xl">

//                             <h3 className="font-bold mb-2">
//                                 {variant.size}
//                             </h3>

//                             <input
//                                 type="number"
//                                 placeholder="Price"
//                                 value={variant.price}
//                                 onChange={(e) => {
//                                     const updated = [...formData.weights];
//                                     updated[index].price = e.target.value;

//                                     setFormData({
//                                         ...formData,
//                                         weights: updated,
//                                     });
//                                 }}
//                                 className="w-full border rounded-xl p-3 mb-3 text-gray-900"
//                             />

//                             <input
//                                 type="number"
//                                 placeholder="Stock"
//                                 value={variant.stock}
//                                 onChange={(e) => {
//                                     const updated = [...formData.weights];
//                                     updated[index].stock = e.target.value;

//                                     setFormData({
//                                         ...formData,
//                                         weights: updated,
//                                     });
//                                 }}
//                                 className="w-full border rounded-xl p-3 text-gray-900"
//                             />
//                         </div>
//                     ))}

//                     {/* Existing photos — remove any that no longer apply */}
//                     <div>
//                         <label className="block text-sm font-semibold text-gray-700 mb-2">
//                             Current Photos
//                         </label>

//                         {existingImages.length === 0 ? (
//                             <p className="text-sm text-gray-500 mb-2">
//                                 No photos yet — add some below.
//                             </p>
//                         ) : (
//                             <div className="flex flex-wrap gap-3 mb-2">
//                                 {existingImages.map((url, index) => (
//                                     <div key={`${url}-${index}`} className="relative">
//                                         <img
//                                             src={url}
//                                             alt={`Product photo ${index + 1}`}
//                                             className="w-20 h-20 object-cover rounded-lg border"
//                                         />
//                                         {index === 0 && (
//                                             <span className="absolute -top-2 -left-2 bg-orange-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
//                                                 Cover
//                                             </span>
//                                         )}
//                                         <button
//                                             type="button"
//                                             onClick={() => removeExistingImage(index)}
//                                             className="absolute -top-2 -right-2 bg-red-600 text-white w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center"
//                                         >
//                                             ×
//                                         </button>
//                                     </div>
//                                 ))}
//                             </div>
//                         )}

//                         <label className="block text-sm font-semibold text-gray-700 mb-2 mt-4">
//                             Add New Photos
//                         </label>
//                         <input
//                             type="file"
//                             accept="image/*"
//                             multiple
//                             onChange={handleNewImageSelect}
//                             className="w-full border rounded-xl p-3 text-gray-900"
//                         />

//                         {newImageFiles.length > 0 && (
//                             <div className="flex flex-wrap gap-3 mt-3">
//                                 {newImageFiles.map((file, index) => (
//                                     <div key={`${file.name}-${index}`} className="relative">
//                                         <img
//                                             src={URL.createObjectURL(file)}
//                                             alt={file.name}
//                                             className="w-20 h-20 object-cover rounded-lg border"
//                                         />
//                                         <button
//                                             type="button"
//                                             onClick={() => removeNewImage(index)}
//                                             className="absolute -top-2 -right-2 bg-red-600 text-white w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center"
//                                         >
//                                             ×
//                                         </button>
//                                     </div>
//                                 ))}
//                             </div>
//                         )}
//                     </div>

//                     <textarea
//                         rows={4}
//                         placeholder="Description"
//                         value={formData.description}
//                         onChange={(e) =>
//                             setFormData({
//                                 ...formData,
//                                 description: e.target.value,
//                             })
//                         }
//                         className="w-full border rounded-xl p-3 text-gray-900"
//                         required
//                     />

//                     <button
//                         type="submit"
//                         className="bg-green-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-green-700"
//                     >
//                         Update Product
//                     </button>

//                 </form>
//             </div>
//         </div>
//     );
// }

"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

const PRODUCT_SIZES = ["120g", "220g", "330g", "430g"];

function normalizeEditableWeights(weights: any[] = []) {
  return PRODUCT_SIZES.map((size) => {
    const existing = weights.find(
      (weight) =>
        (weight.size || weight.quantity || weight.weight) === size
    );

    return {
      size,
      price: existing?.price ?? "",
      stock: existing?.stock ?? "",
    };
  });
}

function normalizeComboVariants(
  comboVariants: any[] = [],
  legacyUnitWeight?: string,
  legacyPrice?: any,
  legacyStock?: any
) {
  return PRODUCT_SIZES.map((size) => {
    const existing = comboVariants.find(
      (v) => v.unitWeight === size
    );

    if (existing) {
      return {
        unitWeight: size,
        price: existing.price ?? "",
        stock: existing.stock ?? "",
      };
    }

    if (
      comboVariants.length === 0 &&
      legacyUnitWeight === size
    ) {
      return {
        unitWeight: size,
        price: legacyPrice ?? "",
        stock: legacyStock ?? "",
      };
    }

    return {
      unitWeight: size,
      price: "",
      stock: "",
    };
  });
}

export default function EditProductPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const id = params?.id;

  /* ---------------- PHOTOS ---------------- */

  const [existingImages, setExistingImages] =
    useState<string[]>([]);

  const [newImageFiles, setNewImageFiles] =
    useState<File[]>([]);

  /* ---------------- VIDEOS ---------------- */

  const [existingVideos, setExistingVideos] =
    useState<string[]>([]);

  const [newVideoFiles, setNewVideoFiles] =
    useState<File[]>([]);

  const [uploading, setUploading] =
    useState(false);

  const [formData, setFormData] = useState<any>({
    name: "",
    image: "",
    description: "",
    shortDescription: "",
    isCombo: false,
    comboSize: 2,
    comboVariants: [] as {
      unitWeight: string;
      price: any;
      stock: any;
    }[],
    weights: [],
  });

  useEffect(() => {
    if (id) {
      fetchProduct();
    }
  }, [id]);

  /* ---------------- FETCH PRODUCT ---------------- */

  const fetchProduct = async () => {
    if (!id) return;

    try {
      const res = await fetch(
        `/api/products/${id}`,
        {
          cache: "no-store",
        }
      );

      const data = await res.json();

      if (data.success) {
        setFormData({
          name: data.product.name || "",
          image: data.product.image || "",
          description:
            data.product.description || "",
          shortDescription:
            data.product.shortDescription || "",
          isCombo:
            data.product.isCombo === true,
          comboSize:
            data.product.comboSize || 2,

          comboVariants:
            data.product.isCombo
              ? normalizeComboVariants(
                  data.product.comboVariants,
                  data.product.comboUnitWeight,
                  data.product.comboPrice,
                  data.product.comboStock
                )
              : [],

          weights:
            data.product.isCombo
              ? []
              : normalizeEditableWeights(
                  data.product.weights
                ),
        });

        /* PHOTOS */

        const productImages =
          Array.isArray(data.product.images) &&
          data.product.images.length > 0
            ? data.product.images
            : data.product.image
            ? [data.product.image]
            : [];

        setExistingImages(productImages);

        /* VIDEOS */

        const productVideos =
          Array.isArray(data.product.videos)
            ? data.product.videos
            : [];

        setExistingVideos(productVideos);
      }
    } catch (error) {
      console.error(error);
    }
  };

  /* ---------------- IMAGE SELECT ---------------- */

  const handleNewImageSelect = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (
      !e.target.files ||
      e.target.files.length === 0
    ) {
      return;
    }

    const picked = Array.from(
      e.target.files
    );

    setNewImageFiles((current) => [
      ...current,
      ...picked,
    ]);

    e.target.value = "";
  };

  /* ---------------- VIDEO SELECT ---------------- */

  const handleNewVideoSelect = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (
      !e.target.files ||
      e.target.files.length === 0
    ) {
      return;
    }

    const picked = Array.from(
      e.target.files
    );

    const validVideos = picked.filter(
      (file) =>
        file.type.startsWith("video/")
    );

    if (validVideos.length === 0) {
      alert(
        "Please select valid video files."
      );
      return;
    }

    setNewVideoFiles((current) => [
      ...current,
      ...validVideos,
    ]);

    e.target.value = "";
  };

  /* ---------------- REMOVE MEDIA ---------------- */

  const removeExistingImage = (
    index: number
  ) => {
    setExistingImages((current) =>
      current.filter((_, i) => i !== index)
    );
  };

  const removeNewImage = (
    index: number
  ) => {
    setNewImageFiles((current) =>
      current.filter((_, i) => i !== index)
    );
  };

  const removeExistingVideo = (
    index: number
  ) => {
    setExistingVideos((current) =>
      current.filter((_, i) => i !== index)
    );
  };

  const removeNewVideo = (
    index: number
  ) => {
    setNewVideoFiles((current) =>
      current.filter((_, i) => i !== index)
    );
  };

  /* ---------------- UPLOAD SINGLE FILE ---------------- */

  const uploadFile = async (
    file: File
  ): Promise<string | null> => {
    const data = new FormData();

    data.append("file", file);

    const uploadRes = await fetch(
      "/api/upload",
      {
        method: "POST",
        body: data,
      }
    );

    const uploadData =
      await uploadRes.json();

    if (
      !uploadData.success ||
      !(
        uploadData.url ||
        uploadData.image ||
        uploadData.video
      )
    ) {
      return null;
    }

    return (
      uploadData.url ||
      uploadData.image ||
      uploadData.video
    );
  };

  /* ---------------- UPDATE PRODUCT ---------------- */

  const handleUpdate = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (
      formData.isCombo &&
      !formData.comboVariants.some(
        (v: any) =>
          v.price !== "" &&
          Number(v.price) > 0
      )
    ) {
      alert(
        "Please enter a price for at least one weight option"
      );
      return;
    }

    try {
      setUploading(true);

      /* UPLOAD NEW PHOTOS */

      const uploadedImageUrls: string[] =
        [];

      for (
        const file of newImageFiles
      ) {
        const uploadedUrl =
          await uploadFile(file);

        if (!uploadedUrl) {
          alert(
            "One of the image uploads failed"
          );
          setUploading(false);
          return;
        }

        uploadedImageUrls.push(
          uploadedUrl
        );
      }

      /* UPLOAD NEW VIDEOS */

      const uploadedVideoUrls: string[] =
        [];

      for (
        const file of newVideoFiles
      ) {
        const uploadedUrl =
          await uploadFile(file);

        if (!uploadedUrl) {
          alert(
            "One of the video uploads failed"
          );
          setUploading(false);
          return;
        }

        uploadedVideoUrls.push(
          uploadedUrl
        );
      }

      /* FINAL MEDIA */

      const allImages = [
        ...existingImages,
        ...uploadedImageUrls,
      ];

      const allVideos = [
        ...existingVideos,
        ...uploadedVideoUrls,
      ];

      if (allImages.length === 0) {
        alert(
          "Please keep at least one product photo"
        );
        setUploading(false);
        return;
      }

      /* COMBO VARIANTS */

      const validComboVariants =
        formData.isCombo
          ? formData.comboVariants
              .filter(
                (v: any) =>
                  v.price !== "" &&
                  Number(v.price) > 0
              )
              .map((v: any) => ({
                unitWeight:
                  v.unitWeight,
                price: Number(v.price),
                stock: Number(
                  v.stock || 0
                ),
              }))
          : [];

      /* SAVE PRODUCT */

      const res = await fetch(
        `/api/products/${id}`,
        {
          method: "PATCH",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            ...formData,

            /* PHOTOS */

            image: allImages[0],

            images: allImages,

            /* VIDEOS */

            videos: allVideos,

            /* COMBO */

            ...(formData.isCombo
              ? {
                  isCombo: true,

                  comboSize: Number(
                    formData.comboSize
                  ),

                  comboVariants:
                    validComboVariants,

                  comboUnitWeight:
                    validComboVariants[0]
                      ?.unitWeight || "",

                  comboPrice:
                    validComboVariants[0]
                      ?.price || 0,

                  comboStock:
                    validComboVariants[0]
                      ?.stock || 0,

                  weights: [],
                }
              : {
                  isCombo: false,

                  weights:
                    formData.weights
                      .filter(
                        (v: any) =>
                          v.price !== "" &&
                          Number(v.price) >
                            0
                      )
                      .map(
                        (v: any) => ({
                          size:
                            v.size ||
                            v.quantity,

                          price: Number(
                            v.price
                          ),

                          stock: Number(
                            v.stock || 0
                          ),
                        })
                      ),
                }),
          }),
        }
      );

      const data =
        await res.json();

      if (data.success) {
        alert(
          "Product updated successfully!"
        );

        router.push(
          "/admin/products"
        );
      } else {
        alert(
          data.message ||
            "Failed to update product"
        );
      }
    } catch (error) {
      console.error(error);

      alert(
        "Something went wrong"
      );
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-2xl shadow-lg">

        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          Edit Product
        </h1>

        <form
          onSubmit={handleUpdate}
          className="space-y-5"
        >

          {/* PRODUCT NAME */}

          <input
            type="text"
            placeholder="Product Name"
            value={formData.name}
            onChange={(e) =>
              setFormData({
                ...formData,
                name:
                  e.target.value,
              })
            }
            className="w-full border rounded-xl p-3 text-gray-900"
            required
          />

          {/* WEIGHTS */}

          {formData.isCombo ? (
            <div className="rounded-xl border border-orange-200 bg-orange-50 p-4 space-y-4">

              <p className="font-bold text-orange-900">
                Combo Weight Options (
                {formData.comboSize}-Pack)
              </p>

              {formData.comboVariants.map(
                (
                  variant: any,
                  index: number
                ) => (
                  <div
                    key={
                      variant.unitWeight
                    }
                    className="border p-4 rounded-xl bg-white"
                  >
                    <h4 className="font-semibold mb-2 text-gray-900">
                      {variant.unitWeight} per jar ×{" "}
                      {formData.comboSize} jars
                    </h4>

                    <input
                      type="number"
                      placeholder="Combo Price"
                      value={
                        variant.price
                      }
                      onChange={(e) => {
                        const updated = [
                          ...formData.comboVariants,
                        ];

                        updated[
                          index
                        ].price =
                          e.target.value;

                        setFormData({
                          ...formData,
                          comboVariants:
                            updated,
                        });
                      }}
                      className="w-full border rounded-xl p-3 mb-3 text-gray-900"
                    />

                    <input
                      type="number"
                      placeholder="Combo Stock"
                      value={
                        variant.stock
                      }
                      onChange={(e) => {
                        const updated = [
                          ...formData.comboVariants,
                        ];

                        updated[
                          index
                        ].stock =
                          e.target.value;

                        setFormData({
                          ...formData,
                          comboVariants:
                            updated,
                        });
                      }}
                      className="w-full border rounded-xl p-3 text-gray-900"
                    />
                  </div>
                )
              )}
            </div>
          ) : (
            formData.weights.map(
              (
                variant: any,
                index: number
              ) => (
                <div
                  key={index}
                  className="border p-4 rounded-xl"
                >

                  <h3 className="font-bold mb-2">
                    {variant.size}
                  </h3>

                  <input
                    type="number"
                    placeholder="Price"
                    value={
                      variant.price
                    }
                    onChange={(e) => {
                      const updated = [
                        ...formData.weights,
                      ];

                      updated[
                        index
                      ].price =
                        e.target.value;

                      setFormData({
                        ...formData,
                        weights:
                          updated,
                      });
                    }}
                    className="w-full border rounded-xl p-3 mb-3 text-gray-900"
                  />

                  <input
                    type="number"
                    placeholder="Stock"
                    value={
                      variant.stock
                    }
                    onChange={(e) => {
                      const updated = [
                        ...formData.weights,
                      ];

                      updated[
                        index
                      ].stock =
                        e.target.value;

                      setFormData({
                        ...formData,
                        weights:
                          updated,
                      });
                    }}
                    className="w-full border rounded-xl p-3 text-gray-900"
                  />

                </div>
              )
            )
          )}

          {/* ================= PHOTOS ================= */}

          <div>

            <label className="block text-lg font-bold text-gray-900 mb-3">
              Product Photos
            </label>

            {existingImages.length > 0 && (
              <>
                <p className="text-sm font-semibold text-gray-700 mb-2">
                  Current Photos
                </p>

                <div className="flex flex-wrap gap-3 mb-5">

                  {existingImages.map(
                    (url, index) => (
                      <div
                        key={`${url}-${index}`}
                        className="relative"
                      >

                        <img
                          src={url}
                          alt={`Product photo ${
                            index + 1
                          }`}
                          className="w-24 h-24 object-cover rounded-lg border"
                        />

                        {index === 0 && (
                          <span className="absolute -top-2 -left-2 bg-orange-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                            Cover
                          </span>
                        )}

                        <button
                          type="button"
                          onClick={() =>
                            removeExistingImage(
                              index
                            )
                          }
                          className="absolute -top-2 -right-2 bg-red-600 text-white w-6 h-6 rounded-full font-bold flex items-center justify-center"
                        >
                          ×
                        </button>

                      </div>
                    )
                  )}

                </div>
              </>
            )}

            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Add New Photos
            </label>

            <input
              type="file"
              accept="image/*"
              multiple
              onChange={
                handleNewImageSelect
              }
              className="w-full border rounded-xl p-3 text-gray-900"
            />

            {newImageFiles.length > 0 && (
              <div className="flex flex-wrap gap-3 mt-4">

                {newImageFiles.map(
                  (file, index) => (
                    <div
                      key={`${file.name}-${index}`}
                      className="relative"
                    >

                      <img
                        src={URL.createObjectURL(
                          file
                        )}
                        alt={file.name}
                        className="w-24 h-24 object-cover rounded-lg border"
                      />

                      <button
                        type="button"
                        onClick={() =>
                          removeNewImage(
                            index
                          )
                        }
                        className="absolute -top-2 -right-2 bg-red-600 text-white w-6 h-6 rounded-full font-bold flex items-center justify-center"
                      >
                        ×
                      </button>

                    </div>
                  )
                )}

              </div>
            )}

          </div>

          {/* ================= VIDEOS ================= */}

          <div className="border-t pt-6">

            <label className="block text-lg font-bold text-gray-900 mb-1">
              Product Videos
            </label>

            <p className="text-sm text-gray-500 mb-4">
              Upload product videos such as a jar showcase,
              preparation video, or product demonstration.
            </p>

            {/* CURRENT VIDEOS */}

            {existingVideos.length > 0 && (
              <div className="mb-5">

                <p className="text-sm font-semibold text-gray-700 mb-2">
                  Current Videos
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                  {existingVideos.map(
                    (url, index) => (
                      <div
                        key={`${url}-${index}`}
                        className="relative border rounded-xl overflow-hidden bg-black"
                      >

                        <video
                          src={url}
                          controls
                          preload="metadata"
                          className="w-full aspect-video object-contain"
                        />

                        <button
                          type="button"
                          onClick={() =>
                            removeExistingVideo(
                              index
                            )
                          }
                          className="absolute top-2 right-2 bg-red-600 text-white w-7 h-7 rounded-full font-bold flex items-center justify-center shadow"
                          aria-label="Remove video"
                        >
                          ×
                        </button>

                      </div>
                    )
                  )}

                </div>

              </div>
            )}

            {/* UPLOAD NEW VIDEOS */}

            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Add New Videos
            </label>

            <input
              type="file"
              accept="video/mp4,video/webm,video/ogg,video/quicktime"
              multiple
              onChange={
                handleNewVideoSelect
              }
              className="w-full border rounded-xl p-3 text-gray-900"
            />

            <p className="text-xs text-gray-500 mt-2">
              Supported: MP4, WebM, OGG and MOV.
            </p>

            {/* NEW VIDEO PREVIEWS */}

            {newVideoFiles.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">

                {newVideoFiles.map(
                  (file, index) => (
                    <div
                      key={`${file.name}-${index}`}
                      className="relative border rounded-xl overflow-hidden bg-black"
                    >

                      <video
                        src={URL.createObjectURL(
                          file
                        )}
                        controls
                        preload="metadata"
                        className="w-full aspect-video object-contain"
                      />

                      <button
                        type="button"
                        onClick={() =>
                          removeNewVideo(
                            index
                          )
                        }
                        className="absolute top-2 right-2 bg-red-600 text-white w-7 h-7 rounded-full font-bold flex items-center justify-center shadow"
                        aria-label="Remove video"
                      >
                        ×
                      </button>

                      <p className="bg-white text-xs text-gray-700 px-3 py-2 truncate">
                        {file.name}
                      </p>

                    </div>
                  )
                )}

              </div>
            )}

          </div>

          {/* DESCRIPTION */}

          <textarea
            rows={4}
            placeholder="Description"
            value={
              formData.description
            }
            onChange={(e) =>
              setFormData({
                ...formData,
                description:
                  e.target.value,
              })
            }
            className="w-full border rounded-xl p-3 text-gray-900"
            required
          />

          {/* UPDATE */}

          <button
            type="submit"
            disabled={uploading}
            className="bg-green-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-green-700 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {uploading
              ? "Uploading Media..."
              : "Update Product"}
          </button>

        </form>
      </div>
    </div>
  );
}