import type { Metadata } from "next";
import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import { baseUrl } from "@/lib/baseUrl";

export const metadata: Metadata = {
  title:
    "Homemade Bihar Pickles Online | Traditional Achaar | AchaarYaar",
  description:
    "Shop authentic homemade Bihar pickles online at AchaarYaar. Explore traditional mango, lemon, garlic, chilli and other Bihari achaar varieties, delivered across India.",
  alternates: {
    canonical: "/collections/bihar-pickles",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-video-preview": -1,
      "max-snippet": -1,
    },
  },
  openGraph: {
    title:
      "Homemade Bihar Pickles Online | Traditional Achaar | AchaarYaar",
    description:
      "Explore authentic homemade Bihar pickles including mango, lemon, garlic and chilli achaar from AchaarYaar.",
    url: "https://www.achaaryaar.com/collections/bihar-pickles",
    siteName: "AchaarYaar",
    locale: "en_IN",
    type: "website",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "AchaarYaar Homemade Bihar Pickles",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title:
      "Homemade Bihar Pickles Online | Traditional Achaar | AchaarYaar",
    description:
      "Explore authentic homemade Bihar pickles from AchaarYaar, delivered across India.",
    images: ["/og-image.jpg"],
  },
};

export const revalidate = 60;

type Product = {
  _id: string;
  name: string;
  description: string;
  category?: string;
  image: string;
  featured?: boolean;
  isCombo?: boolean;
  comboSize?: number;
  comboUnitWeight?: string;
  comboPrice?: number;
  comboStock?: number;
  weights?: {
    size: string;
    price: number;
    stock: number;
  }[];
};

async function getProducts(): Promise<Product[]> {
  try {
    const res = await fetch(`${baseUrl}/api/products`, {
      next: { revalidate },
    });

    if (!res.ok) {
      return [];
    }

    const data = await res.json();

    return Array.isArray(data?.products) ? data.products : [];
  } catch (error) {
    console.error("BIHAR PICKLES PRODUCTS ERROR:", error);
    return [];
  }
}

function matchesCategory(product: Product, terms: string[]) {
  const searchableText = [
    product.category,
    product.name,
    product.description,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return terms.some((term) =>
    searchableText.includes(term.toLowerCase())
  );
}

function isInStock(product: Product) {
  if (product.isCombo) {
    return Number(product.comboStock || 0) > 0;
  }

  return (
    Array.isArray(product.weights) &&
    product.weights.some(
      (weight) => Number(weight?.stock || 0) > 0
    )
  );
}

export default async function BiharPicklesPage() {
  const products = await getProducts();

  const mangoProducts = products
    .filter((product) =>
      matchesCategory(product, ["mango", "aam"])
    )
    .slice(0, 4);

  const lemonProducts = products
    .filter((product) =>
      matchesCategory(product, ["lemon", "nimbu", "lime"])
    )
    .slice(0, 4);

  const garlicProducts = products
    .filter((product) =>
      matchesCategory(product, ["garlic", "lahsun"])
    )
    .slice(0, 4);

  const chilliProducts = products
    .filter((product) =>
      matchesCategory(product, [
        "chilli",
        "chili",
        "mirchi",
        "spicy",
      ])
    )
    .slice(0, 4);

  const comboProducts = products
    .filter((product) => product.isCombo === true)
    .slice(0, 4);

  const featuredProducts = products
    .filter((product) => product.featured && isInStock(product))
    .slice(0, 4);

  const totalProducts = products.length;

  return (
    <main className="min-h-screen bg-[#FBF7F1] text-[#2D2A26]">
      {/* HERO */}

      <section className="relative overflow-hidden bg-gradient-to-br from-[#2E3F30] to-[#4F6B52] px-5 py-20 text-center md:py-28">
        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.09) 1px, transparent 0)",
            backgroundSize: "24px 24px",
          }}
        />

        <div className="relative mx-auto max-w-4xl">
          <span className="mb-5 inline-flex rounded-full border border-[#D9A85F]/40 bg-[#C18A42]/15 px-4 py-2 text-xs font-extrabold uppercase tracking-[2px] text-[#D9A85F]">
            Authentic Bihar Achaar
          </span>

          <h1
            className="mx-auto max-w-4xl text-4xl font-black leading-tight text-white md:text-6xl"
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
            }}
          >
            Homemade Bihar Pickles Online
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-white/80 md:text-lg">
            Discover authentic homemade Bihar pickles from AchaarYaar,
            inspired by traditional recipes and the rich flavours of Bihar.
            Explore mango, lemon, garlic, chilli and delicious pickle
            combinations delivered across India.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/products"
              className="rounded-full bg-[#C18A42] px-7 py-3 font-extrabold text-[#2D2A26] transition hover:bg-[#D9A85F]"
            >
              Shop All Pickles
            </Link>

            <Link
              href="#pickle-varieties"
              className="rounded-full border border-white/30 bg-white/10 px-7 py-3 font-extrabold text-white transition hover:bg-white/20"
            >
              Explore Varieties
            </Link>
          </div>
        </div>
      </section>

      {/* INTRODUCTION */}

      <section className="mx-auto max-w-5xl px-5 py-16 md:py-20">
        <div className="text-center">
          <p className="mb-3 text-xs font-extrabold uppercase tracking-[2px] text-[#C18A42]">
            The taste of Bihar
          </p>

          <h2
            className="text-3xl font-black text-[#2E3F30] md:text-4xl"
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
            }}
          >
            Traditional Bihar Achaar, Made for Everyday Meals
          </h2>

          <p className="mx-auto mt-6 max-w-3xl text-base leading-8 text-[#5C5249]">
            Bihar has a rich tradition of homemade achaar, with bold flavours
            that complement simple everyday food. At AchaarYaar, our collection
            brings together familiar favourites and distinctive regional
            flavours so you can enjoy the character of Bihar with dal-chawal,
            roti, paratha, puri, kachori, khichdi and snacks.
          </p>
        </div>
      </section>

      {/* VARIETY LINKS */}

      <section
        id="pickle-varieties"
        className="mx-auto max-w-7xl px-5 pb-16"
      >
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {[
            {
              title: "Mango Pickle",
              text: "Classic aam achaar with the bold, tangy character loved across India.",
              href: "/products?category=mango",
            },
            {
              title: "Lemon Pickle",
              text: "A bright and tangy achaar that pairs beautifully with everyday meals.",
              href: "/products?category=lemon",
            },
            {
              title: "Garlic Pickle",
              text: "A rich and savoury pickle for those who enjoy a deeper flavour.",
              href: "/products?category=garlic",
            },
            {
              title: "Chilli Pickle",
              text: "Spicy mirchi achaar for anyone who enjoys an extra kick with their food.",
              href: "/products?category=spicy",
            },
          ].map((item) => (
            <Link
              key={item.title}
              href={item.href}
              className="group rounded-2xl border border-[#E8DDD1] bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
            >
              <h3 className="text-xl font-black text-[#2E3F30]">
                {item.title}
              </h3>

              <p className="mt-3 text-sm leading-6 text-[#5C5249]">
                {item.text}
              </p>

              <span className="mt-5 inline-block text-sm font-extrabold text-[#C18A42]">
                Explore →
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* FEATURED */}

      {featuredProducts.length > 0 && (
        <section className="mx-auto max-w-7xl px-5 pb-20">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[2px] text-[#C18A42]">
                Customer favourites
              </p>

              <h2
                className="mt-2 text-3xl font-black text-[#2E3F30]"
                style={{
                  fontFamily: "'Playfair Display', Georgia, serif",
                }}
              >
                Popular Bihar Pickles
              </h2>
            </div>

            <Link
              href="/products"
              className="hidden text-sm font-extrabold text-[#4F6B52] md:block"
            >
              View all →
            </Link>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featuredProducts.map((product) => (
              <ProductCard
                key={product._id}
                _id={product._id}
                name={product.name}
                description={product.description}
                image={product.image}
                weights={product.weights || []}
                isCombo={product.isCombo}
                comboSize={product.comboSize}
                comboUnitWeight={product.comboUnitWeight}
                comboPrice={product.comboPrice}
                comboStock={product.comboStock}
              />
            ))}
          </div>
        </section>
      )}

      {/* MANGO */}

      {mangoProducts.length > 0 && (
        <ProductSection
          title="Mango Pickles"
          description="Explore traditional mango achaar made for pairing with everyday Indian meals."
          products={mangoProducts}
          href="/products?category=mango"
        />
      )}

      {/* LEMON */}

      {lemonProducts.length > 0 && (
        <ProductSection
          title="Lemon Pickles"
          description="Discover tangy lemon achaar that adds a bright burst of flavour to your meal."
          products={lemonProducts}
          href="/products?category=lemon"
        />
      )}

      {/* GARLIC */}

      {garlicProducts.length > 0 && (
        <ProductSection
          title="Garlic Pickles"
          description="Browse savoury garlic achaar with a rich traditional flavour."
          products={garlicProducts}
          href="/products?category=garlic"
        />
      )}

      {/* CHILLI */}

      {chilliProducts.length > 0 && (
        <ProductSection
          title="Chilli Pickles"
          description="Find spicy chilli and mirchi achaar for lovers of bold flavours."
          products={chilliProducts}
          href="/products?category=spicy"
        />
      )}

      {/* COMBOS */}

      {comboProducts.length > 0 && (
        <ProductSection
          title="Bihar Pickle Combos"
          description="Try multiple flavours together with AchaarYaar pickle combo packs."
          products={comboProducts}
          href="/products?category=combo"
        />
      )}

      {/* WHY ACHARYAAR */}

      <section className="bg-[#2E3F30] px-5 py-20 text-white">
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xs font-extrabold uppercase tracking-[2px] text-[#D9A85F]">
              Why AchaarYaar
            </p>

            <h2
              className="mt-3 text-3xl font-black md:text-4xl"
              style={{
                fontFamily: "'Playfair Display', Georgia, serif",
              }}
            >
              Bringing the Flavours of Bihar to Your Table
            </h2>

            <p className="mt-5 leading-8 text-white/75">
              AchaarYaar focuses on traditional homemade pickle flavours that
              make everyday food more enjoyable. From classic mango achaar to
              bold chilli and regional favourites, our collection is designed
              for people who love the familiar taste of Indian homemade food.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              {
                title: "Traditional Flavours",
                text: "Pickle varieties inspired by the traditional taste of Bihar and Indian homemade achaar.",
              },
              {
                title: "Made for Everyday Food",
                text: "Enjoy achaar with dal-chawal, roti, paratha, puri, khichdi and your favourite snacks.",
              },
              {
                title: "Delivered Across India",
                text: "Shop online and have your favourite AchaarYaar pickles delivered across India.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-white/10 bg-white/5 p-7"
              >
                <h3 className="text-lg font-black">
                  {item.title}
                </h3>

                <p className="mt-3 text-sm leading-7 text-white/70">
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SEO CONTENT */}

      <section className="mx-auto max-w-5xl px-5 py-20">
        <h2
          className="text-3xl font-black text-[#2E3F30] md:text-4xl"
          style={{
            fontFamily: "'Playfair Display', Georgia, serif",
          }}
        >
          What Makes Bihar Pickles Special?
        </h2>

        <div className="mt-6 space-y-5 text-base leading-8 text-[#5C5249]">
          <p>
            Bihar's food culture is known for comforting everyday dishes and
            strong, memorable flavours. Achaar is an important part of that
            food tradition, adding tanginess, spice and depth to simple meals.
          </p>

          <p>
            Mango, lemon, garlic and chilli are among the most familiar pickle
            varieties enjoyed with Indian food. Depending on the recipe,
            achaar can bring a combination of tangy, spicy, savoury or sweet
            flavours to the plate.
          </p>

          <p>
            AchaarYaar brings these traditional pickle flavours together in an
            online collection, making it easier to explore Bihar-inspired
            achaar from anywhere in India.
          </p>
        </div>
      </section>

      {/* FAQ */}

      <section className="border-t border-[#E8DDD1] bg-white px-5 py-20">
        <div className="mx-auto max-w-4xl">
          <p className="text-xs font-extrabold uppercase tracking-[2px] text-[#C18A42]">
            Frequently asked questions
          </p>

          <h2
            className="mt-3 text-3xl font-black text-[#2E3F30] md:text-4xl"
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
            }}
          >
            Bihar Pickle FAQs
          </h2>

          <div className="mt-8 divide-y divide-[#E8DDD1]">
            <Faq
              question="What are Bihar pickles?"
              answer="Bihar pickles are traditional Indian achaar varieties associated with the flavours and food culture of Bihar. Common varieties include mango, lemon, garlic and chilli pickles."
            />

            <Faq
              question="Which Bihar pickle should I try first?"
              answer="Mango pickle is a classic starting point if you enjoy tangy and spicy achaar. You can also explore lemon, garlic, chilli and combo varieties to find your preferred flavour."
            />

            <Faq
              question="Can I buy Bihar pickles online?"
              answer="Yes. AchaarYaar offers homemade Bihar-inspired pickles online with delivery across India."
            />

            <Faq
              question="What can I eat Bihar pickle with?"
              answer="Achaar can be enjoyed with dal-chawal, roti, paratha, puri, kachori, khichdi, curd rice and many Indian snacks."
            />

            <Faq
              question="Does AchaarYaar deliver across India?"
              answer="Yes. AchaarYaar delivers its homemade pickle collection across India."
            />
          </div>
        </div>
      </section>

      {/* FINAL CTA */}

      <section className="px-5 py-20 text-center">
        <div className="mx-auto max-w-3xl">
          <h2
            className="text-3xl font-black text-[#2E3F30] md:text-4xl"
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
            }}
          >
            Bring a Taste of Bihar to Your Next Meal
          </h2>

          <p className="mx-auto mt-5 max-w-2xl leading-7 text-[#5C5249]">
            Explore the AchaarYaar collection and discover homemade pickle
            flavours for everyday meals, family gatherings, gifting and
            cravings.
          </p>

          <Link
            href="/products"
            className="mt-8 inline-flex rounded-full bg-[#4F6B52] px-8 py-3 font-extrabold text-white transition hover:bg-[#2E3F30]"
          >
            Explore All Pickles
          </Link>
        </div>
      </section>

      {/* INTERNAL LINK FOOTER */}

      <section className="border-t border-[#E8DDD1] bg-[#FBF7F1] px-5 py-10">
        <div className="mx-auto flex max-w-7xl flex-wrap justify-center gap-x-6 gap-y-3 text-sm font-bold text-[#4F6B52]">
          <Link href="/">AchaarYaar Home</Link>
          <Link href="/products">All Pickles</Link>
          <Link href="/products?category=mango">Mango Pickle</Link>
          <Link href="/products?category=lemon">Lemon Pickle</Link>
          <Link href="/products?category=garlic">Garlic Pickle</Link>
          <Link href="/products?category=spicy">Chilli Pickle</Link>
          <Link href="/products?category=combo">Pickle Combos</Link>
        </div>
      </section>
    </main>
  );
}

function ProductSection({
  title,
  description,
  products,
  href,
}: {
  title: string;
  description: string;
  products: Product[];
  href: string;
}) {
  return (
    <section className="mx-auto max-w-7xl px-5 pb-20">
      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <h2
            className="text-3xl font-black text-[#2E3F30]"
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
            }}
          >
            {title}
          </h2>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#5C5249]">
            {description}
          </p>
        </div>

        <Link
          href={href}
          className="hidden whitespace-nowrap text-sm font-extrabold text-[#4F6B52] md:block"
        >
          View all →
        </Link>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {products.map((product) => (
          <ProductCard
            key={product._id}
            _id={product._id}
            name={product.name}
            description={product.description}
            image={product.image}
            weights={product.weights || []}
            isCombo={product.isCombo}
            comboSize={product.comboSize}
            comboUnitWeight={product.comboUnitWeight}
            comboPrice={product.comboPrice}
            comboStock={product.comboStock}
          />
        ))}
      </div>
    </section>
  );
}

function Faq({
  question,
  answer,
}: {
  question: string;
  answer: string;
}) {
  return (
    <details className="group py-5">
      <summary className="cursor-pointer list-none pr-8 text-base font-extrabold text-[#2D2A26]">
        {question}
      </summary>

      <p className="mt-3 max-w-3xl text-sm leading-7 text-[#5C5249]">
        {answer}
      </p>
    </details>
  );
}