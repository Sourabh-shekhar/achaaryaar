import ProductCard from "@/components/ProductCard";

async function getProducts() {
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

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: { search?: string };
}) {
  const products = await getProducts();

  const search = searchParams.search?.toLowerCase() || "";

  const filteredProducts = products.filter((product: any) =>
    product.name.toLowerCase().includes(search)
  );

  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="max-w-7xl mx-auto px-6">

        <h1 className="text-5xl font-bold text-center text-gray-900 mb-12">
          Our Pickles
        </h1>

        {search && (
          <p className="text-center text-gray-600 mb-8">
            Search Results for:
            <span className="font-bold text-orange-600">
              {" "}{search}
            </span>
          </p>
        )}

        {filteredProducts.length === 0 ? (
          <div className="text-center text-2xl text-gray-600">
            No products found 😔
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-8">
            {filteredProducts.map((product: any) => (
              <ProductCard
                key={product._id}
                _id={product._id}
                name={product.name}
                description={product.description}
                image={product.image}
                variants={product.variants}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}