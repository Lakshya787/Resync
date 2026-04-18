import { useEffect, useState } from "react";
import api from "../Api";

/* =========================
   XP Progress Bar
========================= */
function XPBar({ current = 0, max = 1 }) {
  const percentage = Math.min(Math.max(current / Math.max(max, 1), 0), 1);

  return (
    <div className="w-full h-3 bg-muted rounded-full overflow-hidden mt-3 border-2 border-background">
      <div
        className="h-full bg-secondary transition-all duration-500"
        style={{ width: `${percentage * 100}%` }}
      />
    </div>
  );
}

/* =========================
   User Status Card
========================= */
export default function UserStatus() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = async () => {
    try {
      const res = await api.get("/dashboard");
      setUser(res.data.data);
    } catch (err) {
      console.error(err.response?.data?.message || "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading || !user) {
    return (
      <div className="w-64 p-4 bg-background rounded-lg border-4 border-muted text-foreground/50 font-bold uppercase tracking-widest text-sm animate-pulse">
        LOADING...
      </div>
    );
  }

  return (
    <div className="w-64 p-4 bg-background rounded-lg border-4 border-foreground shadow-[4px_4px_0_0_#F3F4F6] hover:translate-x-[2px] hover:-translate-y-[2px] hover:shadow-[6px_6px_0_0_#3B82F6] transition-all cursor-default">
      
      {/* User Row */}
      <div className="flex items-center justify-between">
        
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-primary border-4 border-background -ml-6 shadow-none flex items-center justify-center text-white font-extrabold text-lg">
            {user.username.charAt(0).toUpperCase()}
          </div>

          <div>
            <p className="text-base font-extrabold text-foreground uppercase tracking-tight">
              {user.username}
            </p>
            <p className="text-xs font-bold text-foreground/60 uppercase tracking-widest mt-1">
              LEVEL {user.level}
            </p>
          </div>
        </div>

      </div>

      {/* XP */}
      <XPBar current={user.exp} max={user.nextLevelExp} />

      <p className="text-xs font-bold text-foreground/50 uppercase tracking-widest mt-2 text-right">
        {user.exp} / {user.nextLevelExp} XP
      </p>
    </div>
  );
}