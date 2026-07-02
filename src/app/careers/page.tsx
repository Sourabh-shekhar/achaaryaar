import Link from "next/link";
import {
  FiBriefcase,
  FiHeadphones,
  FiPackage,
  FiShoppingBag,
  FiTrendingUp,
  FiUsers,
} from "react-icons/fi";

const futureAreas = [
  { label: "Operations", icon: FiPackage },
  { label: "Marketing", icon: FiTrendingUp },
  { label: "Sales", icon: FiShoppingBag },
  { label: "E-commerce", icon: FiBriefcase },
  { label: "Customer Support", icon: FiHeadphones },
  { label: "Food Production", icon: FiUsers },
];

export default function CareersPage() {
  return (
    <div className="min-h-screen bg-[#FBF7F1]">
      <section className="bg-[#2E3F30] px-6 py-20 text-center text-white">
        <p className="mb-4 text-sm font-extrabold uppercase tracking-[0.22em] text-[#D9A85F]">
          Careers
        </p>
        <h1 className="mx-auto max-w-3xl text-4xl font-black leading-tight md:text-6xl">
          Join Our Journey
        </h1>
        <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-white/78">
          We are not hiring at the moment, but we are always excited to connect
          with talented people.
        </p>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-14">
        <div className="rounded-3xl border border-[#E8DDD1] bg-white p-8 shadow-[0_18px_50px_rgba(28,61,46,0.08)] md:p-12">
          <h2 className="text-3xl font-black text-[#2D2A26]">
            We are building a brand that celebrates authentic Indian flavors.
          </h2>
          <p className="mt-5 max-w-4xl text-base leading-8 text-[#5C5249]">
            As we grow, we will be looking for passionate people in operations,
            marketing, sales, e-commerce, customer support, food production, and
            more.
          </p>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {futureAreas.map((area) => {
              const Icon = area.icon;

              return (
                <div
                  key={area.label}
                  className="rounded-2xl border border-[#E8DDD1] bg-[#FBF7F1] p-5"
                >
                  <Icon className="mb-4 text-[#C18A42]" size={24} />
                  <h3 className="font-extrabold text-[#2D2A26]">
                    {area.label}
                  </h3>
                </div>
              );
            })}
          </div>

          <div className="mt-10 rounded-2xl bg-[#4F6B52]/10 p-6">
            <p className="text-sm leading-7 text-[#4F6B52]">
              Want to stay connected? Follow AchaarYaar on social media or send
              us a note through the contact page. When openings are available,
              we will share them publicly.
            </p>
            <Link
              href="/contact"
              className="mt-5 inline-flex rounded-xl bg-[#C18A42] px-5 py-3 font-extrabold text-[#2D2A26]"
            >
              Contact us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
