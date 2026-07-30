export default function Breadcrumb({ items }) {
  return (
    <nav className="pb-5 text-xs text-[#7A746D]">
      <ol className="flex flex-wrap items-center gap-1.5">
        {items.map((item, index) => (
          <li
            key={item.label}
            className="flex items-center gap-1.5"
          >
            {index > 0 && <span>/</span>}

            {item.href ? (
              <a
                href={item.href}
                className="hover:text-[#C89A35] transition-colors"
              >
                {item.label}
              </a>
            ) : (
              <span className="text-[#6C645C]">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
