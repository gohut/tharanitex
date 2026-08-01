import Link from "next/link";
import Navbar from "@/components/home/Navbar/Navbar";

export default function ProfilePage() {
  return (
    <main className="min-h-screen bg-[#FBF5EA]">
      <Navbar />

      <section className="mx-auto max-w-[960px] px-6 py-20 text-center">
        <p className="text-sm uppercase tracking-[0.25em] text-[#B5986B]">
          Tharani Textiles
        </p>
        <h1 className="mt-5 font-klaristha text-[42px] uppercase tracking-[0.04em] text-[#D39A2F] md:text-[58px]">
          My Profile
        </h1>
        <p className="mx-auto mt-6 max-w-[680px] text-[18px] leading-8 text-[#2B2721]">
          TODO: Profile details require authentication and backend integration.
        </p>

        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Link
            href="/orders"
            className="rounded-full bg-[#5A1F2F] px-8 py-3 text-white transition hover:bg-[#471825]"
          >
            View Orders
          </Link>
          <Link
            href="/home"
            className="rounded-full border border-[#CDBCA2] px-8 py-3 text-[#231F1A] transition hover:border-[#E0A22E] hover:text-[#E0A22E]"
          >
            Home
          </Link>
        </div>
      </section>
    </main>
  );
}
