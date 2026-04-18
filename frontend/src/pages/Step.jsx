import { useCallback, useEffect, useState } from "react";
import api from "../Api";
import Card from "../components/Card";
import Button from "../components/Button";
 
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
  const [error, setError]                 = useState(null);
 
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
 
  const completeStep = async () => {
    if (actionLoading) return;
    setError(null);
    try {
      setActionLoading(true);
      await api.post("/step/complete");
      await fetchData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to complete step");
    } finally {
      setActionLoading(false);
    }
  };
 
  const generateNextStep = async () => {
    if (actionLoading) return;
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
 
  if (loading) {
    return <div className="text-foreground/50 font-bold uppercase tracking-widest animate-pulse">Loading steps…</div>;
  }
 
  return (
    <div className="space-y-8">
 
      {error && (
        <div className="rounded-md bg-error text-white font-bold px-4 py-4 uppercase tracking-wide text-sm flex justify-between items-center">
          <span>{error}</span>
          <button
            onClick={fetchData}
            className="ml-4 underline text-white hover:text-white/80"
          >
            RETRY
          </button>
        </div>
      )}
 
      {/* ACTIVE STEP */}
      <Card bgColor="bg-background">
        <h2 className="text-xl font-extrabold mb-6 uppercase tracking-tight text-primary">Active Step</h2>
 
        {activeStep ? (
          <>
            <h3 className="text-3xl font-extrabold mb-4 text-foreground">{activeStep.title}</h3>
 
            {activeStep.description && (
              <p className="text-lg text-foreground/80 font-medium mb-6">
                {activeStep.description}
              </p>
            )}
 
            <p className="text-sm text-secondary font-bold uppercase tracking-widest mb-8">
              Deadline: {formatDate(activeStep.deadline)}
            </p>
 
            <Button
              onClick={completeStep}
              disabled={actionLoading}
              variant="secondary"
              className="bg-secondary text-white hover:bg-green-600 w-full md:w-auto"
            >
              {actionLoading ? "COMPLETING…" : "MARK AS COMPLETED"}
            </Button>
          </>
        ) : (
          <>
            <p className="text-foreground/60 font-medium mb-6">No active step right now</p>
 
            <Button
              onClick={generateNextStep}
              disabled={actionLoading}
              variant="primary"
            >
              {actionLoading ? "GENERATING…" : "GENERATE NEXT STEP"}
            </Button>
          </>
        )}
      </Card>
 
      {/* STEP HISTORY */}
      <Card bgColor="bg-background">
        <h2 className="text-xl font-extrabold mb-6 uppercase tracking-tight">Completed Steps</h2>
 
        {history.length === 0 ? (
          <p className="text-foreground/60 font-medium">No steps completed yet</p>
        ) : (
          <div className="space-y-4">
            {history.map((s) => (
              <div
                key={s.stepId ?? s._id ?? s.stepName}
                className="bg-muted p-6 rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-4 border-l-4 border-secondary"
              >
                <h3 className="font-extrabold text-xl">{s.stepName}</h3>
                <p className="text-sm font-bold text-foreground/50 uppercase tracking-widest">
                  Completed {formatDate(s.completedAt)}
                </p>
              </div>
            ))}
          </div>
        )}
      </Card>
 
    </div>
  );
}