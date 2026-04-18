import { forwardRef } from "react";

const Input = forwardRef(({ className = "", error, ...props }, ref) => {
  return (
    <div className="relative w-full">
      <input
        ref={ref}
        className={`w-full h-14 bg-muted text-foreground px-4 rounded-md outline-none transition-all duration-200 
          focus:bg-white focus:border-2 focus:border-primary placeholder:text-foreground/50
          ${error ? "border-2 border-error" : "border-0"} 
          ${className}`}
        {...props}
      />
      {error && <p className="text-error text-xs font-bold mt-1 uppercase tracking-wide">{error}</p>}
    </div>
  );
});

Input.displayName = "Input";
export default Input;
