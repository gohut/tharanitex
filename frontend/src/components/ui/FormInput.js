export default function FormInput({
  label,
  id,
  type = "text",
  value,
  onChange,
  placeholder,
  required,
  options,
  rows,
  className = "",
  disabled = false,
}) {
  const base =
    "w-full bg-[#FFFFFF] border border-[#E8DCC8] text-[#2F2B27] placeholder-[#9E9385] rounded-xl px-3.5 py-2.5 text-sm font-sans focus:outline-none focus:border-[#5A1F2F] focus:ring-1 focus:ring-[#5A1F2F] transition-colors disabled:opacity-60 disabled:cursor-not-allowed";

  return (
    <div className={`flex flex-col gap-1.5 font-sans ${className}`}>
      {label && (
        <label htmlFor={id} className="text-[#2F2B27] text-xs font-semibold">
          {label}
          {required && <span className="text-[#C5221F] ml-0.5">*</span>}
        </label>
      )}
      {type === "select" ? (
        <select
          id={id}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className={base}
        >
          {options?.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      ) : type === "textarea" ? (
        <textarea
          id={id}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          rows={rows || 3}
          disabled={disabled}
          className={base}
        />
      ) : (
        <input
          id={id}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          className={base}
        />
      )}
    </div>
  );
}
