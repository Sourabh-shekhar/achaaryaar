export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">

      {/* Hero */}
      <section className="bg-gradient-to-r from-orange-600 to-yellow-500 text-white py-24">
        <div className="max-w-6xl mx-auto px-6 text-center">

          <h1 className="text-5xl md:text-6xl font-extrabold mb-6">
            Our Story
          </h1>

          <p className="text-xl max-w-3xl mx-auto">
            Bringing the authentic taste of homemade Bihar pickles
            to every family across India.
          </p>

        </div>
      </section>

      {/* Story */}
      <section className="max-w-7xl mx-auto px-6 py-20 grid md:grid-cols-2 gap-14 items-center">

        <div>
          <img
            src="/image/logo.png"
            alt="Achaaryaar"
            className="rounded-3xl shadow-2xl w-full"
          />
        </div>

        <div>
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            The Beginning
          </h2>

          <p className="text-gray-700 text-lg leading-8 mb-5">
            Achaaryaar started with a simple dream — to preserve
            the traditional taste of homemade pickles prepared
            using recipes passed down through generations.
          </p>

          <p className="text-gray-700 text-lg leading-8">
            Every jar is prepared with carefully selected ingredients,
            traditional spices and lots of love to recreate the
            authentic taste of home.
          </p>
        </div>

      </section>

      {/* Mission & Vision */}
      <section className="bg-orange-50 py-20">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-8">

          <div className="bg-white p-10 rounded-3xl shadow-lg">
            <h3 className="text-3xl font-bold text-orange-600 mb-4">
              Our Mission
            </h3>

            <p className="text-gray-700 text-lg leading-8">
              To deliver authentic homemade pickles made with
              traditional recipes while maintaining the highest
              quality standards.
            </p>
          </div>

          <div className="bg-white p-10 rounded-3xl shadow-lg">
            <h3 className="text-3xl font-bold text-orange-600 mb-4">
              Our Vision
            </h3>

            <p className="text-gray-700 text-lg leading-8">
              To become India's most trusted homemade pickle brand
              known for purity, tradition and unforgettable taste.
            </p>
          </div>

        </div>
      </section>

      {/* Founder Message */}
      <section className="max-w-5xl mx-auto px-6 py-20">

        <div className="bg-white border-l-8 border-orange-600 shadow-xl rounded-3xl p-10">

          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Founder Message
          </h2>

          <p className="text-gray-700 text-lg leading-8 italic">
            "Our goal is simple — every customer should feel the
            same warmth and happiness that homemade pickles bring
            to our own family."
          </p>

          <p className="mt-6 font-bold text-orange-600">
            — Founder, Achaaryaar
          </p>

        </div>

      </section>

      {/* Stats */}
      <section className="bg-gray-50 py-20">

        <div className="max-w-7xl mx-auto px-6">

          <div className="grid md:grid-cols-4 gap-8">

            <div className="bg-white p-8 rounded-3xl shadow-lg text-center">
              <h3 className="text-5xl font-bold text-orange-600">
                500+
              </h3>
              <p className="mt-3 text-gray-600">
                Happy Customers
              </p>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-lg text-center">
              <h3 className="text-5xl font-bold text-orange-600">
                100%
              </h3>
              <p className="mt-3 text-gray-600">
                Homemade
              </p>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-lg text-center">
              <h3 className="text-5xl font-bold text-orange-600">
                0
              </h3>
              <p className="mt-3 text-gray-600">
                Preservatives
              </p>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-lg text-center">
              <h3 className="text-5xl font-bold text-orange-600">
                50+
              </h3>
              <p className="mt-3 text-gray-600">
                Orders Every Month
              </p>
            </div>

          </div>

        </div>

      </section>

    </div>
  );
}