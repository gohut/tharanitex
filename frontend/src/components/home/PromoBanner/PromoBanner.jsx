export default function PromoBanner({ banner }) {
  return (
    <section className="bg-[#FBF5EA]">
      <img
        src={banner.image}
        alt="Promotional Banner"
        className="block w-full h-auto"
      />
    </section>
  );
}