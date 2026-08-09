"use client";

import Link from "next/link";
import Image from "next/image";
export default function Hero() {
  return (
    <section className="bg-[#FAF4EE] py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
        <div>
          <span className="inline-block rounded-full bg-[#F3E4D4] text-[#6B1F1F] px-5 py-2 text-sm font-semibold tracking-wide">
            Inspired by traditional Bihar recipes
          </span>

          <h1 className="mt-8 text-5xl md:text-7xl font-extrabold leading-tight text-[#2D2A26]">
            Handcrafted Pickles
            <span className="block text-[#6B1F1F]">
              Rooted in Tradition
            </span>
          </h1>

          <p className="mt-8 max-w-xl text-lg md:text-xl leading-9 text-[#5C534B]">
            Small-batch pickles made with carefully selected ingredients,
            balanced spices, and the warmth of regional food traditions -
            prepared for modern homes that still value authentic taste.
          </p>

          <div className="mt-10 flex flex-wrap gap-4 text-sm md:text-base font-medium text-[#3E352F]">
            <span className="rounded-full bg-white px-4 py-2 shadow-sm border border-[#E7D8C8]">
              Small-Batch Crafted
            </span>
            <span className="rounded-full bg-white px-4 py-2 shadow-sm border border-[#E7D8C8]">
              Hygienically Packed
            </span>
            <span className="rounded-full bg-white px-4 py-2 shadow-sm border border-[#E7D8C8]">
              Pan-India Delivery
            </span>
          </div>

          <p className="mt-6 text-sm md:text-base text-[#6B1F1F] font-medium">
            Preserving regional food heritage, one jar at a time.
          </p>

          <div className="mt-12 flex flex-col sm:flex-row gap-5">
            <Link
              href="/products"
              className="inline-flex items-center justify-center rounded-2xl bg-[#6B1F1F] px-10 py-5 text-white font-semibold shadow-lg transition hover:bg-[#571919]"
            >
              Shop Collection
            </Link>

            <Link
              href="/about"
              className="inline-flex items-center justify-center rounded-2xl border border-[#6B1F1F] px-10 py-5 text-[#6B1F1F] font-semibold transition hover:bg-[#6B1F1F] hover:text-white"
            >
              Our Story
            </Link>
          </div>
        </div>

        <div className="relative">
          <div className="absolute inset-0 rounded-[48px] bg-[#E8C9A8] blur-3xl opacity-30"></div>

          <div className="relative overflow-hidden rounded-[36px] bg-white p-4 shadow-[0_20px_60px_rgba(0,0,0,0.12)]">
            <Image
              src="/image/hero-pickle.png"
              alt="Authentic Homemade Bihar Pickles by AchaarYaar"
              width={700}
              height={700}
              priority
              quality={85}
              className="w-full rounded-[28px] object-cover"
            />

            <div className="absolute bottom-6 left-6 rounded-2xl bg-white/95 px-5 py-4 shadow-lg border border-[#EADBCD]">
              <h3 className="text-lg font-bold text-[#6B1F1F]">
                Authentic Bihar Flavours
              </h3>
              <p className="text-sm text-[#5C534B]">
                Crafted with care for everyday meals and gifting.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
