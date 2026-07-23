export default function FormInput({ label, id, type = "text", value, onChange, placeholder, required, options, rows, className = "", disabled = false }) {
  const base = "w-full bg-green-800 border border-green-700 text-white placeholder-green-500 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500 transition-colors disabled:opacity-60 disabled:cursor-not-allowed";
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && <label htmlFor={id} className="text-green-300 text-xs font-medium">{label}{required && <span className="text-gold-500 ml-0.5">*</span>}</label>}
      {type === "select" ? (
        <select id={id} value={value} onChange={onChange} disabled={disabled} className={base}>
          {options?.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
      ) : type === "textarea" ? (
        <textarea id={id} value={value} onChange={onChange} placeholder={placeholder} rows={rows || 3} disabled={disabled} className={base} />
      ) : (
        <input id={id} type={type} value={value} onChange={onChange} placeholder={placeholder} required={required} disabled={disabled} className={base} />
      )}
    </div>
  );
}
