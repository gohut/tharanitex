import homeContent from "@/data/homeContent";

export default function PromoBanner({ banner }) {
  return (
    <section className="bg-[#FBF5EA] py-10">
      <div className="max-w-[1440px] mx-auto px-10">
        <img
          src={banner.image}
          alt="Promotional Banner"
          className="w-full object-cover rounded-sm"
        />
      </div>
    </section>
  );
}