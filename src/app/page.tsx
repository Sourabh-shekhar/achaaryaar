//import Navbar from "@/components/Navbar";
import Image from "next/image";
import Hero from "@/components/Hero";
import ProductCard from "@/components/ProductCard";
import WhyChooseUs from "@/components/WhyChooseUs";
import Footer from "@/components/Footer";
import Testimonials from "@/components/Testimonials";
import WhatsAppButton from "@/components/WhatsAppButton";
import StatsSection from "@/components/StatsSection";
import Link from "next/link";
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

export default async function Home() {
  const products = await getProducts();

  return (
    <>
      {/* New Full Banner */}
      <Link href="/products">
        <section className="relative w-full h-[500px] md:h-[700px] cursor-pointer">
          <Image
            src="/image/banner.jpg"
            alt="Achaaryaar Banner"
            fill
            priority
            className="object-cover"
          />
        </section>
      </Link>
      <Hero />
      <StatsSection />
      <WhyChooseUs />
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-center  text-gray-900 mb-12">
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
        </div>
      </section>
      <Testimonials />
      <Footer />
      <WhatsAppButton />
    </>
  );
}