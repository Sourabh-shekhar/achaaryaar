import Image from "next/image";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#FCF8F3] text-[#2F2925]">

      {/* Hero */}
      <section className="bg-gradient-to-r from-[#6B1F1F] via-[#8A2F2B] to-[#C7862F] text-white py-24 md:py-28">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <span className="inline-block rounded-full bg-white/10 px-5 py-2 text-sm font-medium tracking-[0.18em] uppercase border border-white/20">
            Our Story
          </span>

          <h1 className="mt-6 font-heading text-5xl md:text-6xl font-bold leading-tight">
            Rooted in Tradition,
            <span className="block">
              Crafted for Modern Homes
            </span>
          </h1>

          <p className="mt-6 text-lg md:text-xl max-w-3xl mx-auto leading-8 text-[#F8ECDD]">
            Achaaryaar brings together the warmth of regional pickle traditions,
            thoughtful craftsmanship, and the comfort of authentic flavour in every jar.
          </p>
        </div>
      </section>

      {/* Story Section */}
      <section className="max-w-7xl mx-auto px-6 py-20 md:py-24 grid md:grid-cols-2 gap-14 items-center">
        <div>
          <img
            src="/image/story.jpg"
            alt="Achaaryaar story"
            className="rounded-[32px] shadow-[0_18px_45px_rgba(0,0,0,0.10)] w-full h-[600px] object-cover"
          />
        </div>

        <div>
          <div className="mb-8">
            <Image
              src="/image/logo.png"
              alt="Achaaryaar Logo"
              width={400}
              height={120}
              className="w-[280px] md:w-[340px]"
            />
          </div>

          <span className="text-[#C7862F] font-semibold uppercase tracking-[0.25em] text-sm">
            Our Journey
          </span>

          <h2 className="font-heading text-4xl md:text-6xl font-bold text-[#2F2925] mt-4 mb-8 leading-tight">
            Preserving the richness of Bihar's pickle traditions
          </h2>

          <p className="text-[#675E56] text-lg md:text-xl leading-9 mb-7">
            Achaaryaar began with a simple intention - to carry forward the
            bold, comforting, and deeply familiar flavours that define traditional
            homemade pickles. Inspired by family recipes and the food memories
            they hold, we set out to create a brand that feels both rooted and relevant.
          </p>

          <p className="text-[#675E56] text-lg md:text-xl leading-9 mb-7">
            Every jar is thoughtfully prepared using carefully selected ingredients,
            balanced spice blends, and a process that respects patience over speed.
            For us, pickle-making is not just about taste - it is about preserving
            tradition, craft, and a sense of home.
          </p>

          <p className="text-[#675E56] text-lg md:text-xl leading-9">
            Today, Achaaryaar serves customers across India while staying committed
            to authenticity, care, and the enduring joy of handmade food.
          </p>
        </div>
      </section>

      {/* Promise in a Jar — Poster Banner */}
      <section className="bg-[#2F2925] py-20 md:py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <span className="text-[#C7862F] font-semibold uppercase tracking-[0.25em] text-sm">
              Our Promise
            </span>
            <h2 className="font-heading text-4xl md:text-6xl font-bold text-white mt-5">
              What Goes Into Every Jar
            </h2>
            <p className="mt-6 text-lg md:text-xl text-[#D9CFC2] max-w-3xl mx-auto leading-9">
              No shortcuts, no preservatives, no artificial colours. Just handpicked
              produce, traditional spice blends, and the same care our grandmothers
              put into theirs — made fresh in small batches, never mass-produced.
            </p>
          </div>

          <div className="rounded-[28px] overflow-hidden shadow-[0_24px_60px_rgba(0,0,0,0.35)] border border-white/10 max-w-3xl mx-auto">
            <Image
              src="/image/poster.png"
              alt="Achaar Yaar — pure tradition, authentic taste, homemade pickles made fresh in small batches with no preservatives, no artificial colours, no artificial flavours"
              width={1024}
              height={1536}
              className="w-full h-auto block"
            />
          </div>

          <p className="text-center mt-10 text-[#D9CFC2] text-base md:text-lg max-w-2xl mx-auto leading-8">
            Aapka pyaar, hamari pehchaan — your love is what we're known for.
            Every order is a small business's way of saying thank you for choosing
            homemade goodness over a factory shelf.
          </p>
        </div>
      </section>

      {/* Mission and Vision */}
      <section className="bg-[#F8F1E8] py-20">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-8">
          <div className="rounded-[28px] border border-[#E8DBCD] bg-[#FFFDF9] p-10 shadow-[0_10px_30px_rgba(0,0,0,0.04)]">
            <h3 className="font-heading text-3xl font-bold text-[#6B1F1F] mb-4">
              Our Mission
            </h3>

            <p className="text-[#675E56] text-lg leading-8">
              To craft honest, flavourful pickles inspired by regional traditions,
              while maintaining care, consistency, and a deeply homemade character.
            </p>
          </div>

          <div className="rounded-[28px] border border-[#E8DBCD] bg-[#FFFDF9] p-10 shadow-[0_10px_30px_rgba(0,0,0,0.04)]">
            <h3 className="font-heading text-3xl font-bold text-[#6B1F1F] mb-4">
              Our Vision
            </h3>

            <p className="text-[#675E56] text-lg leading-8">
              To become a trusted modern Indian pickle brand known for preserving
              food heritage with authenticity, quality, and cultural pride.
            </p>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-24 bg-[#FCF8F3]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-[#C7862F] font-semibold uppercase tracking-[0.25em] text-sm">
              Our Values
            </span>

            <h2 className="font-heading text-4xl md:text-6xl font-bold text-[#2F2925] mt-5">
              What Shapes Every Jar
            </h2>

            <p className="mt-6 text-lg md:text-xl text-[#6B625A] max-w-3xl mx-auto leading-9">
              Achaaryaar is guided by values that keep our food thoughtful,
              trustworthy, and true to its roots.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              {
                number: "01",
                title: "Tradition",
                text: "We honour household recipes and regional methods that carry the richness of generations.",
              },
              {
                number: "02",
                title: "Purity",
                text: "We focus on clean preparation, quality ingredients, and flavour that feels honest and familiar.",
              },
              {
                number: "03",
                title: "Care",
                text: "Every batch is prepared with attention to balance, texture, freshness, and consistency.",
              },
              {
                number: "04",
                title: "Trust",
                text: "We want every order to feel dependable, from taste and packaging to delivery and service.",
              },
            ].map((item) => (
              <div
                key={item.number}
                className="rounded-[28px] border border-[#EEE2D7] bg-[#FFFDF9] p-10 text-center shadow-[0_10px_30px_rgba(0,0,0,0.04)] hover:shadow-[0_16px_40px_rgba(0,0,0,0.06)] transition"
              >
                <div className="mx-auto mb-6 h-16 w-16 rounded-full bg-[#F3E7DA] flex items-center justify-center text-2xl font-bold text-[#6B1F1F]">
                  {item.number}
                </div>

                <h3 className="font-heading text-2xl font-bold text-[#2F2925] mb-4">
                  {item.title}
                </h3>

                <p className="text-[#6B625A] leading-8">
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Cause */}
      <section className="bg-[#F3E7DA] py-24">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <span className="text-[#C7862F] font-semibold uppercase tracking-[0.25em] text-sm">
            More Than a Jar
          </span>

          <h2 className="mt-5 font-heading text-4xl md:text-6xl font-bold text-[#2F2925]">
            Preserving regional food heritage
          </h2>

          <p className="mt-6 text-lg md:text-xl text-[#675E56] leading-9 max-w-4xl mx-auto">
            Achaaryaar is our effort to keep traditional pickle-making relevant in
            modern homes. We believe regional food knowledge, handmade methods,
            and the emotional value of familiar flavours deserve to be preserved
            with pride and passed forward with care.
          </p>
        </div>
      </section>

      {/* Founder Message */}
      <section className="max-w-5xl mx-auto px-6 py-20">
        <div className="rounded-[30px] border border-[#E8DBCD] bg-[#FFFDF9] shadow-[0_10px_30px_rgba(0,0,0,0.04)] p-10 md:p-12">
          <h2 className="font-heading text-4xl font-bold text-[#2F2925] mb-6">
            Founder Message
          </h2>

          <p className="text-[#675E56] text-lg leading-8 italic">
            "We started Achaaryaar with the belief that traditional flavours
            should not be lost in modern convenience. Every jar we make is our
            way of carrying memory, care, and authenticity forward."
          </p>

          <p className="mt-6 font-semibold text-[#6B1F1F]">
            - Founder, Achaaryaar
          </p>
        </div>
      </section>

      {/* Customer Promise */}
      <section className="py-24 bg-[#F8F1E8]">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <span className="text-[#C7862F] font-semibold uppercase tracking-[0.25em] text-sm">
            Customer Promise
          </span>

          <h2 className="font-heading text-4xl md:text-6xl font-bold text-[#2F2925] mt-5">
            What customers can expect from us
          </h2>

          <p className="mt-6 text-lg md:text-xl text-[#6B625A] max-w-4xl mx-auto leading-9">
            We want every jar of Achaaryaar to feel dependable, flavourful,
            and worthy of the trust placed in us.
          </p>

          <div className="grid md:grid-cols-3 gap-10 mt-16">
            <div className="rounded-[28px] border border-[#E8DBCD] bg-[#FFFDF9] p-10 shadow-[0_10px_30px_rgba(0,0,0,0.04)]">
              <h3 className="font-heading text-2xl font-bold mb-4 text-[#2F2925]">
                Authentic Taste
              </h3>
              <p className="text-[#6B625A] leading-8">
                Inspired by regional Bihar recipes that feel familiar, bold,
                and deeply satisfying.
              </p>
            </div>

            <div className="rounded-[28px] border border-[#E8DBCD] bg-[#FFFDF9] p-10 shadow-[0_10px_30px_rgba(0,0,0,0.04)]">
              <h3 className="font-heading text-2xl font-bold mb-4 text-[#2F2925]">
                Careful Delivery
              </h3>
              <p className="text-[#6B625A] leading-8">
                Packed thoughtfully to help every order arrive fresh,
                secure, and ready to enjoy.
              </p>
            </div>

            <div className="rounded-[28px] border border-[#E8DBCD] bg-[#FFFDF9] p-10 shadow-[0_10px_30px_rgba(0,0,0,0.04)]">
              <h3 className="font-heading text-2xl font-bold mb-4 text-[#2F2925]">
                Honest Quality
              </h3>
              <p className="text-[#6B625A] leading-8">
                A consistent focus on ingredients, preparation, flavour balance,
                and customer trust.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-[#FCF8F3] py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { value: "4.8K+", label: "Happy Customers" },
              { value: "100%", label: "Handcrafted Feel" },
              { value: "0", label: "Shortcuts in Taste" },
              { value: "50+", label: "Cities Covered" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-[28px] border border-[#E8DBCD] bg-[#FFFDF9] p-8 text-center shadow-[0_10px_30px_rgba(0,0,0,0.04)]"
              >
                <h3 className="font-heading text-5xl font-bold text-[#6B1F1F]">
                  {stat.value}
                </h3>
                <p className="mt-3 text-[#6B625A]">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}