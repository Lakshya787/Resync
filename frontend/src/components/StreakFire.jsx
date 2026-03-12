import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import fire from "../assets/fire.lottie";

export default function StreakFire({ streak }) {

  const getFireSize = () => {
    if (streak <= 1) return 60;
    if (streak <= 3) return 80;
    if (streak <= 7) return 110;
    if (streak <= 14) return 150;
    if (streak <= 30) return 200;
    return 260;
  };

  const size = getFireSize();

  return (
    <div className="flex flex-col items-center justify-center">
      
      <div style={{ width: size, height: size }}>
        <DotLottieReact
          src={fire}
          autoplay
          loop
        />
      </div>

      <p className="text-sm text-slate-400 mt-2">
        {streak} Day Streak
      </p>

    </div>
  );
}