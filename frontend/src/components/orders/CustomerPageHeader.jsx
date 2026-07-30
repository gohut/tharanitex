export default function CustomerPageHeader({
  title,
  description,
}) {
  return (
    <div>
      <h1 className="font-klaristha text-[42px] uppercase tracking-[0.04em] text-[#D39A2F] md:text-[58px]">
        {title}
      </h1>

      <div className="mt-3 flex items-center gap-3 text-[#D39A2F]">
        <span className="h-px w-10 bg-[#D7AB57]" />
        <span className="text-sm">✦</span>
        <span className="h-px w-20 bg-[#D7AB57]" />
        <span className="text-sm">✦</span>
        <span className="h-px w-10 bg-[#D7AB57]" />
      </div>

      {description && (
        <p className="mt-8 text-[18px] font-medium tracking-[0.02em] text-[#2B2721]">
          {description}
        </p>
      )}
    </div>
  );
}
