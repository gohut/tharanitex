import Image from "next/image";

export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#FBF5EA]">
      <div className="animate-pulse">
        <Image
          src="/assets/logo.png"
          alt="Tharani Textiles"
          width={190}
          height={60}
          priority
          className="h-auto w-[170px] sm:w-[190px]"
        />
      </div>
    </div>
  );
}