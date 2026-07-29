export default function Breadcrumb({ items }) {
  return (
    <nav className="text-sm text-[#7A746D] py-6">
      <ol className="flex items-center gap-2">
        {items.map((item, index) => (
          <li key={item.label} className="flex items-center gap-2">
            {index > 0 && <span>/</span>}

            {item.href ? (
              <a
                href={item.href}
                className="hover:text-[#C89A35] transition-colors"
              >
                {item.label}
              </a>
            ) : (
              <span className="text-[#2F2F2F]">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
