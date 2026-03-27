import { useCallback, useEffect, useState } from "react";
import api from "../Api";
 
export default function Goal() {
  const [goals, setGoals]           = useState([]);
  const [activeGoal, setActiveGoal] = useState(null);
  const [loading, setLoading]       = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError]           = useState(null);   // ✅ replaces alert()
 
  // ── Form state ──────────────────────────────────────────────────────────────
  const [name, setName]             = useState("");
  const [category, setCategory]     = useState("");
  const [description, setDescription] = useState("");
  const [pace, setPace]             = useState("medium");
 
  // ✅ Per-goal pace state — fixes shared `pace` bug (see below)
  const [goalPaces, setGoalPaces]   = useState({});
 
  // ── Fetch ───────────────────────────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    setError(null);
    try {
      const [goalsRes, activeRes] = await Promise.all([
        api.get("/goal"),
        api.get("/goal/active"),
      ]);
      setGoals(goalsRes.data.data ?? []);
      setActiveGoal(activeRes.data.data ?? null);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load goals");
    } finally {
      setLoading(false);
    }
  }, []);
 
  useEffect(() => {
    fetchData();
  }, [fetchData]);
 
  // ── Create ──────────────────────────────────────────────────────────────────
  const createGoal = async () => {
    setError(null);
 
    // ✅ Inline validation — no alert()
    if (!name.trim()) {
      setError("Goal name is required.");
      return;
    }
    if (!["skill", "exam", "career"].includes(category)) {
      setError("Please select a valid category.");
      return;
    }
 
    try {
      setActionLoading(true);
 
      await api.post("/goal/create", {
        name: name.trim(),
        category,
        description,
        pacePreference: pace,
      });
 
      setName("");
      setCategory("");
      setDescription("");
      setPace("medium");
 
      await fetchData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create goal");
    } finally {
      setActionLoading(false);
    }
  };
 
  // ── Activate ─────────────────────────────────────────────────────────────────
  const activateGoal = async (goalId) => {
    setError(null);
    // ✅ Use per-goal pace, fall back to "medium"
    const selectedPace = goalPaces[goalId] || "medium";
    try {
      setActionLoading(true);
      await api.post("/goal/select", { goalId, pacePreference: selectedPace });
      await fetchData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to activate goal");
    } finally {
      setActionLoading(false);
    }
  };
 
  // ── Pause ────────────────────────────────────────────────────────────────────
  const pauseGoal = async () => {
    setError(null);
    try {
      setActionLoading(true);
      await api.patch("/goal/pause");
      await fetchData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to pause goal");
    } finally {
      setActionLoading(false);
    }
  };
 
  // ── Delete ───────────────────────────────────────────────────────────────────
  const deleteGoal = async (goalId) => {
    // ✅ window.confirm is acceptable for destructive actions — kept intentionally
    if (!window.confirm("Are you sure you want to delete this goal?")) return;
    setError(null);
    try {
      setActionLoading(true);
      await api.delete(`/goal/${goalId}`);
      await fetchData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete goal");
    } finally {
      setActionLoading(false);
    }
  };
 
  // ── Render ───────────────────────────────────────────────────────────────────
  if (loading) {
    return <div className="text-slate-400 animate-pulse">Loading goals…</div>;
  }
 
  return (
    <div className="space-y-6">
 
      {/* ✅ Centralised error banner */}
      {error && (
        <div className="rounded-xl bg-red-500/10 border border-red-500/30 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}
 
      {/* ACTIVE GOAL */}
      <div className="bg-[#0F172A] border border-white/10 p-6 rounded-2xl">
        <h2 className="text-lg font-semibold mb-2">Active Goal</h2>
 
        {activeGoal ? (
          <>
            <h3 className="text-xl font-medium">{activeGoal.goal.name}</h3>
            <p className="text-sm text-slate-400 mt-1">
              Category: {activeGoal.goal.category} · Pace: {activeGoal.pacePreference}
            </p>
            <button
              onClick={pauseGoal}
              disabled={actionLoading}
              className="mt-4 bg-yellow-500 px-4 py-2 rounded-xl text-sm
                         disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
            >
              {actionLoading ? "Pausing…" : "Pause Goal"}
            </button>
          </>
        ) : (
          <p className="text-slate-400">No active goal selected</p>
        )}
      </div>
 
      {/* CREATE GOAL */}
      {goals.length < 2 && (
        <div className="bg-[#0F172A] border border-white/10 p-6 rounded-2xl">
          <h2 className="text-lg font-semibold mb-4">Create New Goal</h2>
 
          <div className="space-y-3">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Goal name"
              className="w-full p-2 rounded bg-[#020617] text-softwhite
                         border border-white/10 focus:outline-none focus:border-sky-500"
            />
 
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full p-2 rounded bg-[#020617] text-softwhite
                         border border-white/10 focus:outline-none focus:border-sky-500"
            >
              <option value="">Select category</option>
              <option value="skill">Skill</option>
              <option value="exam">Exam</option>
              <option value="career">Career</option>
            </select>
 
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description (optional)"
              className="w-full p-2 rounded bg-[#020617] text-softwhite
                         border border-white/10 focus:outline-none focus:border-sky-500"
            />
 
            <select
              value={pace}
              onChange={(e) => setPace(e.target.value)}
              className="w-full p-2 rounded bg-[#020617] text-softwhite
                         border border-white/10 focus:outline-none focus:border-sky-500"
            >
              <option value="slow">Slow Pace</option>
              <option value="medium">Medium Pace</option>
              <option value="fast">Fast Pace</option>
            </select>
 
            <button
              onClick={createGoal}
              disabled={actionLoading}
              className="bg-sky-500 text-black px-4 py-2 rounded-xl font-medium
                         disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
            >
              {actionLoading ? "Creating…" : "Create Goal"}
            </button>
          </div>
        </div>
      )}
 
      {/* GOALS LIST */}
      <div className="bg-[#0F172A] border border-white/10 p-6 rounded-2xl">
        <h2 className="text-lg font-semibold mb-4">Your Goals</h2>
 
        {goals.length === 0 && (
          <p className="text-slate-400">No goals yet. Create one above.</p>
        )}
 
        <div className="space-y-4">
          {goals.map((goal) => {
            const isActive = activeGoal?.goal?._id === goal._id;
 
            return (
              <div
                key={goal._id}
                className={`p-4 rounded-xl flex justify-between items-center
                  ${isActive
                    ? "border border-sky-500 bg-sky-500/5"
                    : "bg-[#020617]"
                  }`}
              >
                <div>
                  <h3 className="font-medium">{goal.name}</h3>
                  <p className="text-xs text-slate-400">{goal.category}</p>
                  {/* ✅ Show active badge */}
                  {isActive && (
                    <span className="text-xs text-sky-400 mt-1 inline-block">
                      ● Active
                    </span>
                  )}
                </div>
 
                {!isActive && (
                  <div className="flex items-center gap-2">
                    {/* ✅ Per-goal pace — no longer shares state with the create form */}
                    <select
                      value={goalPaces[goal._id] || "medium"}
                      onChange={(e) =>
                        setGoalPaces((prev) => ({
                          ...prev,
                          [goal._id]: e.target.value,
                        }))
                      }
                      className="bg-[#0F172A] border border-white/10 px-2 py-1 rounded text-sm
                                 focus:outline-none focus:border-sky-500"
                    >
                      <option value="slow">Slow</option>
                      <option value="medium">Medium</option>
                      <option value="fast">Fast</option>
                    </select>
 
                    <button
                      onClick={() => activateGoal(goal._id)}
                      disabled={actionLoading}
                      className="bg-sky-500 text-black px-3 py-1 rounded-xl text-sm
                                 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
                    >
                      {actionLoading ? "…" : "Activate"}
                    </button>
 
                    <button
                      onClick={() => deleteGoal(goal._id)}
                      disabled={actionLoading}
                      className="bg-red-500 px-3 py-1 rounded-xl text-sm
                                 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
 
    </div>
  );
}