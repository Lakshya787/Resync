import { useCallback, useEffect, useRef, useState } from "react";
import api from "../Api";
import Card from "../components/Card";
import Button from "../components/Button";

const formatTime = (sec) => {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
};

export default function Action() {
  const [action, setAction]           = useState(null);
  const [loading, setLoading]         = useState(true);
  const [running, setRunning]         = useState(false);
  const [seconds, setSeconds]         = useState(0);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError]             = useState(null);

  const intervalRef = useRef(null);

  const startTimer = useCallback((initialSeconds = 0) => {
    setSeconds(initialSeconds);
    clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);
    setRunning(true);
  }, []);

  const stopTimer = useCallback(() => {
    clearInterval(intervalRef.current);
    setRunning(false);
    setSeconds(0);
  }, []);

  useEffect(() => () => clearInterval(intervalRef.current), []);

  const fetchAction = useCallback(async () => {
    setError(null);
    try {
      const res = await api.get("/actions/active");
      const data = res.data.data;
      setAction(data);

      if (data?.activeSessionStartedAt) {
        const elapsed = Math.floor(
          (Date.now() - new Date(data.activeSessionStartedAt).getTime()) / 1000
        );
        startTimer(Math.max(0, elapsed));
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load action");
    } finally {
      setLoading(false);
    }
  }, [startTimer]);

  useEffect(() => {
    fetchAction();
  }, [fetchAction]);

  const startSession = useCallback(async () => {
    if (running || actionLoading) return;
    setError(null);
    try {
      setActionLoading(true);
      await api.post("/actions/start-session", { actionId: action._id });
      startTimer(0);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to start session");
    } finally {
      setActionLoading(false);
    }
  }, [action, running, actionLoading, startTimer]);

  const stopSession = useCallback(async () => {
    if (!running || actionLoading) return;
    setError(null);
    try {
      setActionLoading(true);
      await api.post("/actions/stop-session", { actionId: action._id });
      stopTimer();
      await fetchAction();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to stop session");
    } finally {
      setActionLoading(false);
    }
  }, [action, running, actionLoading, stopTimer, fetchAction]);

  const completeAction = useCallback(async () => {
    if (actionLoading) return;
    setError(null);
    try {
      setActionLoading(true);

      if (running) {
        await api.post("/actions/stop-session", { actionId: action._id });
        stopTimer();
      }

      await api.post("/actions/complete", { actionId: action._id });
      await fetchAction();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to complete action");
    } finally {
      setActionLoading(false);
    }
  }, [action, running, actionLoading, stopTimer, fetchAction]);

  if (loading) {
    return <div className="text-foreground/50 font-bold uppercase tracking-widest animate-pulse">Loading action…</div>;
  }

  return (
    <div className="space-y-8">
      <Card bgColor="bg-background">
        <h2 className="text-xl font-extrabold mb-6 uppercase tracking-tight">Current Action</h2>

        {error && (
          <div className="mb-6 rounded-md bg-error text-white font-bold px-4 py-4 uppercase tracking-wide text-sm flex justify-between items-center">
            <span>{error}</span>
            <button
              onClick={fetchAction}
              className="ml-4 underline hover:text-white/80"
            >
              RETRY
            </button>
          </div>
        )}

        {!action && !error && (
          <p className="text-foreground/60 font-medium">No pending action for current step</p>
        )}

        {action && (
          <>
            <h3 className="text-3xl font-extrabold mt-4 text-primary uppercase tracking-tight">{action.title}</h3>

            <p className="text-lg text-foreground/80 mt-4 font-medium">{action.description}</p>

            <div className="mt-6 flex gap-6 text-sm font-bold uppercase tracking-widest text-foreground/50">
              <span>Required: <span className="text-secondary">{action.minRequiredMinutes} min</span></span>
              <span>Tracked: <span className="text-accent">{action.totalTrackedMinutes} min</span></span>
            </div>

            {/* Timer */}
            <div
              className={`mt-8 text-7xl font-extrabold tabular-nums tracking-tighter ${running ? "text-primary scale-105" : "text-foreground"} transition-all duration-300 origin-left`}
              aria-live="polite"
              aria-label={`Timer: ${formatTime(seconds)}`}
            >
              {formatTime(seconds)}
            </div>

            {/* Controls */}
            <div className="flex gap-4 mt-12 flex-wrap">
              {!running ? (
                <Button
                  onClick={startSession}
                  disabled={actionLoading}
                  variant="primary"
                  className="bg-secondary text-white hover:bg-green-600"
                >
                  {actionLoading ? "STARTING…" : "START TIMER"}
                </Button>
              ) : (
                <Button
                  onClick={stopSession}
                  disabled={actionLoading}
                  variant="primary"
                  className="bg-accent text-white hover:bg-yellow-600"
                >
                  {actionLoading ? "STOPPING…" : "PAUSE TIMER"}
                </Button>
              )}

              <Button
                onClick={completeAction}
                disabled={actionLoading}
                variant="outline"
                className="hover:bg-primary border-primary text-primary"
              >
                {actionLoading ? "COMPLETING…" : "COMPLETE ACTION"}
              </Button>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}