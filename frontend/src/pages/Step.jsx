import { useEffect, useState } from "react";
import api from "../Api";

export default function Step() {
  const [activeStep, setActiveStep] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchData = async () => {
    try {
      const [activeRes, historyRes] = await Promise.all([
        api.get("/step/active"),
        api.get("/step/history"),
      ]);

      setActiveStep(activeRes.data.data);
      setHistory(historyRes.data.data || []);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to load steps");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const completeStep = async () => {
    try {
      setActionLoading(true);
      await api.post("/step/complete");
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message);
    } finally {
      setActionLoading(false);
    }
  };

  const generateNextStep = async () => {
    try {
      setActionLoading(true);
      await api.post("/step/create");
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-slate-400">
        Loading steps…
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* ACTIVE STEP */}
      <div className="bg-[#0F172A] border border-white/10 p-6 rounded-2xl">
        <h2 className="text-lg font-semibold mb-2">Active Step</h2>

        {activeStep ? (
          <>
            <h3 className="text-xl font-medium">
              {activeStep.title}
            </h3>

            <p className="text-sm text-slate-400 mt-2">
              {activeStep.description}
            </p>

            <p className="text-xs text-slate-500 mt-2">
              Deadline: {new Date(activeStep.deadline).toDateString()}
            </p>

            <button
              onClick={completeStep}
              disabled={actionLoading}
              className="mt-4 bg-green-500 px-4 py-2 rounded-xl text-sm font-medium text-black disabled:opacity-50"
            >
              {actionLoading ? "Completing…" : "Mark as Completed"}
            </button>
          </>
        ) : (
          <>
            <p className="text-slate-400 mb-4">
              No active step right now
            </p>

            <button
              onClick={generateNextStep}
              disabled={actionLoading}
              className="bg-sky-500 text-black px-4 py-2 rounded-xl font-medium disabled:opacity-50"
            >
              {actionLoading ? "Generating…" : "Generate Next Step"}
            </button>
          </>
        )}
      </div>

      {/* STEP HISTORY */}
      <div className="bg-[#0F172A] border border-white/10 p-6 rounded-2xl">
        <h2 className="text-lg font-semibold mb-4">
          Completed Steps
        </h2>

        {history.length === 0 && (
          <p className="text-slate-400">
            No steps completed yet
          </p>
        )}

        <div className="space-y-3">
          {history.map((s) => (
            <div
              key={s.stepId}
              className="bg-[#020617] p-4 rounded-xl"
            >
              <h3 className="font-medium">
                {s.stepName}
              </h3>

              <p className="text-xs text-slate-400 mt-1">
                Completed on {new Date(s.completedAt).toDateString()}
              </p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}