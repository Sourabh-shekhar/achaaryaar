import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import ProductCard from "@/components/ProductCard";

async function getProducts() {
  const res = await fetch(
  `${process.env.NEXT_PUBLIC_SITE_URL}/api/products`,
  {
    cache: "no-store",
  }
);

  const data = await res.json();

  return data.products || [];
}

export default async function Home() {
  const products = await getProducts();

  return (
    <>
      <Navbar />
      <Hero />

      <section className="max-w-7xl mx-auto px-6 py-16">
        <h2 className="text-4xl font-bold text-center mb-12">
          Featured Pickles
        </h2>

        <div className="grid md:grid-cols-3 gap-8">
          {products.map((product: any) => (
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
      </section>
    </>
  );
}