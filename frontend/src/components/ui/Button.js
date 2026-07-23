export default function Button({ children, onClick, variant = "primary", size = "md", className = "", type = "button", disabled = false }) {
  const variants = {
    primary: "bg-gold-600 hover:bg-gold-500 text-green-950 font-semibold shadow-gold-sm hover:shadow-gold-md",
    secondary: "bg-green-800 hover:bg-green-700 text-white border border-green-700",
    danger: "bg-red-800 hover:bg-red-700 text-white",
    ghost: "bg-transparent hover:bg-green-800 text-green-300 hover:text-white",
    outline: "bg-transparent border border-gold-600 text-gold-400 hover:bg-gold-600/10",
  };
  const sizes = {
    xs: "px-2 py-1 text-xs",
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-2.5 text-base",
  };
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center gap-1.5 rounded-lg transition-all duration-150 ${variants[variant]} ${sizes[size]} ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"} ${className}`}
    >
      {children}
    </button>
  );
}
