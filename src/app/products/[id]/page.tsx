import { notFound } from "next/navigation";

async function getProduct(id: string) {
  const res = await fetch(
    `${process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000"}/api/products/${id}`,
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
    `${process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000"}/api/products`,
    {
      cache: "no-store",
    }
  );

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
    <div className="min-h-screen bg-gray-50 py-16">

      <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-16">

        <div>
          <img
            src={product.image}
            alt={product.name}
            className="rounded-3xl shadow-xl w-full"
          />
        </div>

        <div>
          <span className="bg-red-600 text-white px-4 py-2 rounded-full">
            Bestseller
          </span>

          <h1 className="text-5xl font-bold mt-6 text-gray-900">
            {product.name}
          </h1>

          <div className="mt-4 text-yellow-500 text-xl">
            ⭐⭐⭐⭐⭐
            <span className="text-gray-600 ml-2 text-lg">
              (124 Reviews)
            </span>
          </div>

          <p className="text-gray-700 text-lg leading-8 mt-6">
            {product.description}
          </p>

          <div className="mt-8 space-y-4">
            {product.variants.map((variant: any, index: number) => (
              <div
                key={index}
                className="border p-4 rounded-2xl bg-white shadow-sm"
              >
                <div className="flex justify-between">
                  <h3 className="font-bold text-xl">
                    {variant.quantity}
                  </h3>

                  <p className="text-orange-600 font-bold text-xl">
                    ₹{variant.price}
                  </p>
                </div>

                {variant.stock <= 5 ? (
                  <p className="text-red-600 mt-2">
                    Only {variant.stock} left
                  </p>
                ) : (
                  <p className="text-green-600 mt-2">
                    In Stock
                  </p>
                )}
              </div>
            ))}
          </div>

          <button className="w-full mt-8 bg-orange-600 hover:bg-orange-700 text-white py-4 rounded-2xl text-xl font-bold">
            Add to Cart
          </button>
        </div>

      </div>

      {/* Related Products */}
      <section className="max-w-7xl mx-auto px-6 mt-24">
        <h2 className="text-4xl font-bold mb-10 text-center">
          You May Also Like
        </h2>

        <div className="grid md:grid-cols-3 gap-8">
          {relatedProducts.map((item: any) => (
            <a
              key={item._id}
              href={`/products/${item._id}`}
              className="bg-white rounded-3xl shadow-lg overflow-hidden hover:shadow-2xl transition"
            >
              <img
                src={item.image}
                alt={item.name}
                className="h-64 w-full object-cover"
              />

              <div className="p-6">
                <h3 className="text-2xl font-bold">
                  {item.name}
                </h3>

                <p className="text-orange-600 font-bold mt-2">
                  ₹{item.variants[0]?.price}
                </p>
              </div>
            </a>
          ))}
        </div>
      </section>

    </div>
  );
}