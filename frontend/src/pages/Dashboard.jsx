import { useEffect, useState } from "react";
import api from "../Api.js";
import StreakFire from "../components/StreakFire.jsx";
const Home = () => {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const res = await api.get("/dashboard");
      if (res.data.success) {
        setDashboard(res.data.data);
      } else {
        setError(res.data.message || "Failed to load dashboard");
      }
    } catch (err) {
      setError(err.message || "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  return (
    <>
      {/* Welcome */}
      <div className="bg-gradient-to-r from-sky-500/20 to-indigo-500/20 border border-white/10 p-6 rounded-2xl backdrop-blur shadow-lg">
        <h1 className="text-3xl font-semibold">
          Welcome Back, {dashboard?.username || "User"}
        </h1>
        <p className="text-slate-400 mt-1">
          Stay consistent. Execution beats motivation.
        </p>
      </div>

      {/* Stats */}
      {!loading && dashboard && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="bg-[#0F172A] border border-white/10 p-5 rounded-xl shadow flex flex-col items-center">
  <p className="text-sm text-slate-400">Current Streak</p>

  <h2 className="text-2xl font-semibold mt-1">
    {dashboard.streak} days
  </h2>

  <StreakFire streak={dashboard.streak} />
</div>

          <div className="bg-[#0F172A] border border-white/10 p-5 rounded-xl shadow">
            <p className="text-sm text-slate-400">Completed Steps</p>
            <h2 className="text-2xl font-semibold mt-1">
              {dashboard.completedSteps}
            </h2>
          </div>

          <div className="bg-[#0F172A] border border-white/10 p-5 rounded-xl shadow">
            <p className="text-sm text-slate-400">Projects</p>
            <h2 className="text-2xl font-semibold mt-1">
              {dashboard.projectCount}
            </h2>
          </div>

          <div className="bg-[#0F172A] border border-white/10 p-5 rounded-xl shadow">
            <p className="text-sm text-slate-400">Pace</p>
            <h2 className="text-2xl font-semibold mt-1">
              {dashboard.pacePreference || "—"}
            </h2>
          </div>
        </div>
      )}

      {/* Goal Section */}
      {!loading && dashboard && (
        <div className="bg-[#0F172A] border border-white/10 p-6 rounded-2xl shadow-lg">
          <h2 className="text-lg font-semibold mb-4">Active Goal</h2>

          {dashboard.activeGoal ? (
            <p className="text-sky-400 font-medium mb-4">
              {dashboard.activeGoal}
            </p>
          ) : (
            <p className="text-slate-400">No active goal</p>
          )}

          {/* Active Step */}
          {dashboard.activeStep && (
            <div className="bg-[#020617] border border-white/10 rounded-xl p-5 mb-6">
              <h3 className="font-medium text-lg">
                {dashboard.activeStep.title}
              </h3>

              <p className="text-sm text-slate-400 mt-1">
                Type: {dashboard.activeStep.type}
              </p>

              <p className="text-sm text-sky-400 mt-2">
                Deadline:{" "}
                {new Date(
                  dashboard.activeStep.deadline
                ).toLocaleDateString()}
              </p>
            </div>
          )}

          {/* Current Action */}
          <div>
            <h3 className="text-md font-semibold mb-3">Current Action</h3>

            {dashboard.currentAction ? (
              <div className="bg-[#020617] border border-sky-500/30 rounded-xl p-5">
                <p className="font-medium text-sky-400">
                  {dashboard.currentAction.title}
                </p>

                {dashboard.currentAction.description && (
                  <p className="text-sm text-slate-400 mt-2">
                    {dashboard.currentAction.description}
                  </p>
                )}

                <p className="text-xs text-slate-500 mt-3">
                  Step Action #{dashboard.currentAction.sequence}
                </p>
              </div>
            ) : (
              <p className="text-slate-400">No pending actions</p>
            )}
          </div>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="bg-[#0F172A] border border-white/10 p-6 rounded-xl">
          <p className="text-slate-400">Loading dashboard...</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-[#0F172A] border border-red-500/30 p-6 rounded-xl">
          <p className="text-red-400">{error}</p>
          <button
            onClick={fetchDashboard}
            className="mt-4 bg-sky-500 hover:bg-sky-400 transition px-4 py-2 rounded-lg text-black font-medium"
          >
            Retry
          </button>
        </div>
      )}
    </>
  );
};

export default Home;