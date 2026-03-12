export default function Card({
  children,
  title,
  description,
  footer,
  variant = "default",
  loading = false,
  onClick,
  className = "",
}) {
  const baseStyle =
    "bg-[#0F172A] border rounded-2xl p-8 transition duration-200";

  const variants = {
    default: "border-white/10 hover:border-[#38BDF8]/40",
    active: "border-[#38BDF8]",
    danger: "border-red-500/40",
  };

  return (
    <div
      onClick={onClick}
      className={`${baseStyle} ${variants[variant]} ${
        onClick ? "cursor-pointer" : ""
      } ${className}`}
    >
      {loading ? (
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-white/10 rounded w-1/2"></div>
          <div className="h-3 bg-white/10 rounded w-3/4"></div>
          <div className="h-3 bg-white/10 rounded w-2/3"></div>
        </div>
      ) : (
        <>
          {title && (
            <h3 className="text-xl font-semibold mb-3">
              {title}
            </h3>
          )}

          {description && (
            <p className="text-[#94A3B8] text-sm mb-4">
              {description}
            </p>
          )}

          {children}

          {footer && (
            <div className="mt-6 pt-4 border-t border-white/10 text-sm">
              {footer}
            </div>
          )}
        </>
      )}
    </div>
  );
}