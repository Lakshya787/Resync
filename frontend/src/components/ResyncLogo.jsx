import { Link } from "react-router-dom";

export default function ResyncLogo({ size = "md" }) {
  const sizes = {
    sm: "w-8 h-8 text-base",
    md: "w-10 h-10 text-lg",
    lg: "w-12 h-12 text-xl",
  };

  return (
    <Link to="/" className="flex items-center gap-3 group">
      <div className="relative flex justify-center items-center">
        <div className="absolute w-24 h-24 bg-[#38BDF8]/20 rounded-full blur-2xl group-hover:scale-110 transition" />
        <img
          src="/Icon.png"
          alt="Resync Logo"
          className={`${sizes[size]} object-contain logo-rotate relative z-10`}
        />
      </div>

      <span className={`font-semibold ${sizes[size].split(" ")[2]}`}>
        Resync
      </span>
    </Link>
  );
}