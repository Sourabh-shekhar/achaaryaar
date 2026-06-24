export default function StatsSection() {
  return (
    <section className="bg-orange-600 py-20">
      <div className="max-w-7xl mx-auto px-6">

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">

          <div>
            <h2 className="text-5xl font-bold text-white">5000+</h2>
            <p className="text-orange-100 mt-2">Happy Customers</p>
          </div>

          <div>
            <h2 className="text-5xl font-bold text-white">20+</h2>
            <p className="text-orange-100 mt-2">Pickle Varieties</p>
          </div>

          <div>
            <h2 className="text-5xl font-bold text-white">100%</h2>
            <p className="text-orange-100 mt-2">Homemade</p>
          </div>

          <div>
            <h2 className="text-5xl font-bold text-white">4.9★</h2>
            <p className="text-orange-100 mt-2">Customer Rating</p>
          </div>

        </div>

      </div>
    </section>
  );
}