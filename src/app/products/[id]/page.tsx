import { notFound } from "next/navigation";
import ProductDetailsClient from "./ProductDetailsClient";

const baseUrl =
  process.env.NODE_ENV === "production"
    ? "https://achaaryaar-git-main-sourabh-shekhars-projects.vercel.app"
    : "http://localhost:3000";

async function getProduct(id: string) {
  const res = await fetch(
    `${baseUrl}/api/products/${id}`,
    {
      cache: "no-store",
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
      cache: "no-store",
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