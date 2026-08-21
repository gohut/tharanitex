import Link from "next/link";

export default function AuthRequiredPage({
  title = "Sign In Required",
  message = "Please sign in to access your account.",
}) {
  return (
    <main className="min-h-screen bg-[#F8F2E8] flex items-center justify-center px-5">
      <div className="w-full max-w-md rounded-3xl border border-[#E8DCC8] bg-[#FFFDF9] p-8 text-center shadow-xl">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#5A1F2F]/10">
          <span className="text-2xl">🔒</span>
        </div>

        <p className="mt-6 text-[10px] font-semibold uppercase tracking-[0.3em] text-[#B58A45]">
          Tharani Textiles
        </p>

        <h1 className="mt-3 font-cormorant text-3xl font-semibold text-[#5A1F2F]">
          {title}
        </h1>

        <p className="mt-3 text-sm leading-6 text-[#6F665B]">
          {message}
        </p>

        <Link
          href="/login"
          className="mt-7 block w-full rounded-xl bg-[#5A1F2F] px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-[#471825]"
        >
          Sign In to Continue
        </Link>

        <Link
          href="/home"
          className="mt-3 block w-full rounded-xl border border-[#E8DCC8] px-5 py-3.5 text-sm font-semibold text-[#5A1F2F] transition hover:bg-[#F8F2E8]"
        >
          Continue Browsing
        </Link>
      </div>
    </main>
  );
}