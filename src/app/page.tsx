import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import ProductCard from "@/components/ProductCard";

export default function Home() {
  return (
    <>
      <Navbar />
      <Hero />

      <section className="max-w-7xl mx-auto px-6 py-16">
        <h2 className="text-4xl font-bold text-center mb-12">
          Featured Pickles
        </h2>

        <div className="grid md:grid-cols-3 gap-8">
          <ProductCard
            name="Aam Ka Aachar"
            description="Traditional Bihar Mango Pickle"
            price="₹99 / 250g"
          />

          <ProductCard
            name="Garlic Pickle"
            description="Rich garlic flavour with spices"
            price="₹109 / 250g"
          />

          <ProductCard
            name="Elephant Yam Pickle"
            description="Authentic Suran Pickle"
            price="₹129 / 250g"
          />
        </div>
      </section>
    </>
  );
}