export default function Card({
  children,
  title,
  description,
  footer,
  variant = "default",
  loading = false,
  onClick,
  className = "",
  bgColor = "bg-white",
}) {
  // Flat Design Card: solid bgColor, generously padded, rounded-lg.
  // We avoid shadows. Adding hover transform if interactive.
  const baseStyle = `${bgColor} rounded-lg p-6 transition-all duration-200`;
  const hoverStyle = onClick ? "cursor-pointer hover:scale-[1.02]" : "";

  // Flat design uses borders strictly for emphasis or outline variants.
  const variants = {
    default: "",
    active: "border-4 border-primary",
    danger: "border-4 border-error",
  };

  return (
    <div
      onClick={onClick}
      className={`${baseStyle} ${variants[variant]} ${hoverStyle} ${className}`}
    >
      {loading ? (
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-muted rounded w-1/2"></div>
          <div className="h-3 bg-muted rounded w-3/4"></div>
          <div className="h-3 bg-muted rounded w-2/3"></div>
        </div>
      ) : (
        <>
          {title && (
            <h3 className="text-xl font-bold mb-3 tracking-tight">
              {title}
            </h3>
          )}

          {description && (
            <p className="text-foreground/80 text-sm mb-4">
              {description}
            </p>
          )}

          {children}

          {footer && (
            <div className="mt-6 pt-4 border-t-2 border-border text-sm">
              {footer}
            </div>
          )}
        </>
      )}
    </div>
  );
}