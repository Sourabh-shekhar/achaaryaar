export default function WhyChooseUs() {
  const features = [
    {
      icon: "🌿",
      title: "100% Homemade",
      desc: "Prepared using traditional family recipes with love and care.",
    },

    {
      icon: "🥭",
      title: "Premium Ingredients",
      desc: "Only carefully selected fresh mangoes and spices are used.",
    },

    {
      icon: "🚚",
      title: "Pan India Delivery",
      desc: "Fresh homemade pickles delivered safely across India.",
    },

    {
      icon: "❤️",
      title: "Traditional Taste",
      desc: "Authentic Bihar flavours that remind you of home.",
    },
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6">

        <h2 className="text-4xl font-bold text-center text-gray-900 mb-4">
          Why Choose AchaarYaar?
        </h2>

        <p className="text-center text-gray-600 mb-12">
          Experience the real taste of homemade pickles.
        </p>

        <div className="grid md:grid-cols-4 gap-8">

          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl p-8 shadow-md hover:shadow-2xl hover:-translate-y-2 transition"
            >
              <div className="text-5xl mb-4">
                {feature.icon}
              </div>

              <h3 className="text-xl font-bold text-gray-900 mb-3">
                {feature.title}
              </h3>

              <p className="text-gray-600">
                {feature.desc}
              </p>
            </div>
          ))}

        </div>

      </div>
    </section>
  );
}