export default function ProductCard({ product }) {
  return (
    <div className="group">

      <div className="relative overflow-hidden rounded-sm">

        <img
          src={product.image}
          alt={product.name}
          className="w-full h-[315px] object-cover transition duration-500 group-hover:scale-105"
        />

        <button className="absolute top-3 right-3 z-20 hover:scale-105 transition">
        <img
          src="/assets/wishlist.png"
          alt="Wishlist"
          className="w-9 h-9"
        />
        </button>

      </div>

      <h3 className="mt-4 text-[16px] font-medium text-[#4B4B4B] leading-snug">
        {product.name}
      </h3>

      <p className="uppercase text-[10px] tracking-[1.6px] text-[#C39A32] mt-1">
        {product.category}
      </p>

      <p className="mt-1 text-[30px] text-[#D49E28] font-medium">
        {product.price}
      </p>

    </div>
  );
}