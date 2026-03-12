import { useEffect, useState } from "react";
import api from "../Api";

/* =========================
   XP Progress Bar
========================= */
function XPBar({ current = 0, max = 1 }) {
  const percentage = Math.min(Math.max(current / Math.max(max, 1), 0), 1);

  return (
    <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden mt-2">
      <div
        className="h-full bg-gradient-to-r from-sky-400 to-cyan-400 transition-all duration-500"
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
      <div className="w-60 p-4 bg-slate-800 rounded-xl border border-slate-700 text-slate-400 text-sm">
        Loading...
      </div>
    );
  }

  return (
    <div className="w-60 p-4 bg-slate-800 rounded-xl border border-slate-700 shadow-lg hover:shadow-sky-500/10 transition">
      
      {/* User Row */}
      <div className="flex items-center justify-between">
        
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sky-500 to-cyan-400 flex items-center justify-center text-white font-bold">
            {user.username.charAt(0).toUpperCase()}
          </div>

          <div>
            <p className="text-sm font-semibold text-white">
              {user.username}
            </p>
            <p className="text-xs text-slate-400">
              Level {user.level}
            </p>
          </div>
        </div>

      </div>

      {/* XP */}
      <XPBar current={user.exp} max={user.nextLevelExp} />

      <p className="text-[11px] text-slate-400 mt-1 text-right">
        {user.exp} / {user.nextLevelExp} XP
      </p>
    </div>
  );
}