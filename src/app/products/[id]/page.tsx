import { notFound } from "next/navigation";
import ProductDetailsClient from "./ProductDetailsClient";
import { baseUrl } from "@/lib/baseUrl";

export const revalidate = 60;

async function getProduct(id: string) {
  const res = await fetch(
    `${baseUrl}/api/products/${id}`,
    {
      next: { revalidate },
    }
  );

  if (!res.ok) return null;

  const data = await res.json();
  return data.product;
}

async function getAllProducts() {
  const res = await fetch(
    `${baseUrl}/api/products`,
    {
      next: { revalidate },
    }
  );

  if (!res.ok) return [];

  const data = await res.json();
  return data.products || [];
}

export default async function ProductDetails({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const product = await getProduct(id);

  if (!product) return notFound();

  const allProducts = await getAllProducts();

  const relatedProducts = allProducts
    .filter((p: any) => p._id !== product._id)
    .slice(0, 3);

  return (
    <ProductDetailsClient
      product={product}
      relatedProducts={relatedProducts}
    />
  );
}
