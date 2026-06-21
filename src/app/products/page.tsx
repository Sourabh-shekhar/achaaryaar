export default function ProductsPage() {
  return (
    <div className="min-h-screen p-10">
      <h1 className="text-5xl font-bold mb-8">
        Our Pickles
      </h1>

      <div className="grid md:grid-cols-3 gap-6">

        <div className="border rounded-xl p-6">
          <h2 className="text-2xl font-bold">
            Aam Ka Aachar
          </h2>

          <p className="mt-2">
            Traditional Bihar Mango Pickle
          </p>

          <div className="mt-4">
            <p>250g - ₹99</p>
            <p>500g - ₹179</p>
            <p>1kg - ₹329</p>
          </div>
        </div>

        <div className="border rounded-xl p-6">
          <h2 className="text-2xl font-bold">
            Garlic Pickle
          </h2>

          <p className="mt-2">
            Rich garlic flavour with spices
          </p>

          <div className="mt-4">
            <p>250g - ₹109</p>
            <p>500g - ₹199</p>
            <p>1kg - ₹379</p>
          </div>
        </div>

        <div className="border rounded-xl p-6">
          <h2 className="text-2xl font-bold">
            Elephant Yam Pickle
          </h2>

          <p className="mt-2">
            Traditional Suran Pickle
          </p>

          <div className="mt-4">
            <p>250g - ₹129</p>
            <p>500g - ₹239</p>
            <p>1kg - ₹449</p>
          </div>
        </div>

      </div>
    </div>
  );
}