export default function Testimonials() {
  const reviews = [
    {
      name: "Priya Sharma",
      city: "Delhi",
      review:
        "Best homemade pickle I have ever tasted. It reminds me of my grandmother's recipe.",
    },

    {
      name: "Raj Kumar",
      city: "Patna",
      review:
        "Excellent quality and authentic taste. The mango chutney is amazing!",
    },

    {
      name: "Anjali Singh",
      city: "Mumbai",
      review:
        "Beautiful packaging and delicious taste. Highly recommended.",
    },
  ];

  return (
    <section className="bg-white py-20">
      <div className="max-w-7xl mx-auto px-6">

        <h2 className="text-4xl font-bold text-center text-gray-900 mb-4">
          What Our Customers Say
        </h2>

        <p className="text-center text-gray-600 mb-14">
          Loved by families across India ❤️
        </p>

        <div className="grid md:grid-cols-3 gap-8">

          {reviews.map((review, index) => (
            <div
              key={index}
              className="bg-orange-50 p-8 rounded-3xl shadow-md hover:shadow-xl transition duration-300"
            >

              <div className="text-yellow-500 text-2xl mb-4">
                ⭐⭐⭐⭐⭐
              </div>

              <p className="text-gray-700 leading-7 mb-6">
                "{review.review}"
              </p>

              <div>
                <h3 className="font-bold text-gray-900">
                  {review.name}
                </h3>

                <p className="text-gray-500">
                  {review.city}
                </p>
              </div>

            </div>
          ))}

        </div>
      </div>
    </section>
  );
}