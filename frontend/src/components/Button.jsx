export default function Button({
  children,
  variant = 'primary',
  className = '',
  ...props
}) {
  const baseStyle = "inline-flex items-center justify-center font-semibold rounded-md transition-all duration-200 uppercase tracking-wider text-sm";
  const sizeStyle = "h-14 px-6";

  const variants = {
    primary: "bg-primary text-white hover:bg-blue-600 hover:scale-105",
    secondary: "bg-muted text-foreground hover:bg-gray-200 hover:scale-105",
    outline: "border-4 border-foreground text-foreground hover:bg-foreground hover:text-white bg-transparent",
    danger: "bg-error text-white hover:bg-red-600 hover:scale-105",
  };

  const currentVariant = variants[variant] || variants.primary;

  return (
    <button className={`${baseStyle} ${sizeStyle} ${currentVariant} ${className}`} {...props}>
      {children}
    </button>
  );
}
