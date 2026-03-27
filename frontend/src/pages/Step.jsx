import { useCallback, useEffect, useState } from "react";
import api from "../Api";

// ✅ Pure utility outside component — no re-creation on every render
const formatDate = (dateStr) => {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return isNaN(d) ? "—" : d.toDateString();
};

export default function Step() {
  const [activeStep, setActiveStep]       = useState(null);
  const [history, setHistory]             = useState([]);
  const [loading, setLoading]             = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError]                 = useState(null); // ✅ replaces alert()

  // ── Fetch ───────────────────────────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    setError(null);
    try {
      const [activeRes, historyRes] = await Promise.all([
        api.get("/step/active"),
        api.get("/step/history"),
      ]);
      setActiveStep(activeRes.data.data ?? null);
      setHistory(historyRes.data.data ?? []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load steps");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ── Complete Step ────────────────────────────────────────────────────────────
  const completeStep = async () => {
    if (actionLoading) return; // ✅ guard against double-tap
    setError(null);
    try {
      setActionLoading(true);
      await api.post("/step/complete");
      await fetchData(); // ✅ await so state is fresh before spinner stops
    } catch (err) {
      setError(err.response?.data?.message || "Failed to complete step");
    } finally {
      setActionLoading(false);
    }
  };

  // ── Generate Next Step ───────────────────────────────────────────────────────
  const generateNextStep = async () => {
    if (actionLoading) return; // ✅ guard against double-tap
    setError(null);
    try {
      setActionLoading(true);
      await api.post("/step/create");
      await fetchData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to generate next step");
    } finally {
      setActionLoading(false);
    }
  };

  // ── Render ───────────────────────────────────────────────────────────────────
  if (loading) {
    return <div className="text-slate-400 animate-pulse">Loading steps…</div>;
  }

  return (
    <div className="space-y-6">

      {/* ✅ Centralised error banner */}
      {error && (
        <div className="rounded-xl bg-red-500/10 border border-red-500/30 px-4 py-3 text-sm text-red-400 flex justify-between items-center">
          <span>{error}</span>
          <button
            onClick={fetchData}
            className="ml-4 text-xs underline text-red-300 hover:text-red-200"
          >
            Retry
          </button>
        </div>
      )}

      {/* ACTIVE STEP */}
      <div className="bg-[#0F172A] border border-white/10 p-6 rounded-2xl">
        <h2 className="text-lg font-semibold mb-2">Active Step</h2>

        {activeStep ? (
          <>
            <h3 className="text-xl font-medium">{activeStep.title}</h3>

            {activeStep.description && (
              <p className="text-sm text-slate-400 mt-2">
                {activeStep.description}
              </p>
            )}

            {/* ✅ Safe date rendering — won't show "Invalid Date" */}
            <p className="text-xs text-slate-500 mt-2">
              Deadline: {formatDate(activeStep.deadline)}
            </p>

            <button
              onClick={completeStep}
              disabled={actionLoading}
              className="mt-4 bg-green-500 px-4 py-2 rounded-xl text-sm font-medium text-black
                         disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
            >
              {actionLoading ? "Completing…" : "Mark as Completed"}
            </button>
          </>
        ) : (
          <>
            <p className="text-slate-400 mb-4">No active step right now</p>

            <button
              onClick={generateNextStep}
              disabled={actionLoading}
              className="bg-sky-500 text-black px-4 py-2 rounded-xl font-medium
                         disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
            >
              {actionLoading ? "Generating…" : "Generate Next Step"}
            </button>
          </>
        )}
      </div>

      {/* STEP HISTORY */}
      <div className="bg-[#0F172A] border border-white/10 p-6 rounded-2xl">
        <h2 className="text-lg font-semibold mb-4">Completed Steps</h2>

        {history.length === 0 ? (
          <p className="text-slate-400">No steps completed yet</p>
        ) : (
          <div className="space-y-3">
            {history.map((s) => (
              // ✅ stepId may be undefined — fall back to index via key
              <div
                key={s.stepId ?? s._id ?? s.stepName}
                className="bg-[#020617] p-4 rounded-xl"
              >
                <h3 className="font-medium">{s.stepName}</h3>
                {/* ✅ Safe date rendering */}
                <p className="text-xs text-slate-400 mt-1">
                  Completed on {formatDate(s.completedAt)}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}