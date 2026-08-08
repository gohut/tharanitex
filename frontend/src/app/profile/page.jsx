import Link from "next/link";
import Navbar from "@/components/home/Navbar/Navbar";

export default function ProfilePage() {
  return (
    <main className="min-h-screen bg-[#FBF5EA]">
      <Navbar />

      <section className="mx-auto max-w-[960px] px-5 py-14 text-center sm:px-6 sm:py-20">
        <p className="text-sm uppercase tracking-[0.25em] text-[#B5986B]">
          Tharani Textiles
        </p>
        <h1 className="mt-5 font-klaristha text-[38px] uppercase tracking-[0.04em] text-[#D39A2F] sm:text-[42px] md:text-[58px]">
          My Profile
        </h1>
        <p className="mx-auto mt-5 max-w-[680px] text-base leading-7 text-[#2B2721] sm:mt-6 sm:text-[18px] sm:leading-8">
          TODO: Profile details require authentication and backend integration.
        </p>

        <div className="mt-8 flex flex-col justify-center gap-3 sm:mt-10 sm:flex-row sm:gap-4">
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
