import { useCallback, useEffect, useRef, useState } from "react";
import api from "../Api";

// Pure utility — defined outside to avoid re-creation on every render
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
  const [error, setError]             = useState(null);   // ✅ No more alert()

  // Keep a stable ref to the interval so we never leave a ghost timer
  const intervalRef = useRef(null);

  // ─── Timer ────────────────────────────────────────────────────────────────
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

  // Clear interval on unmount to prevent memory leaks
  useEffect(() => () => clearInterval(intervalRef.current), []);

  // ─── Fetch ─────────────────────────────────────────────────────────────────
  const fetchAction = useCallback(async () => {
    setError(null);
    try {
      const res = await api.get("/actions/active");
      const data = res.data.data;
      setAction(data);

      // ✅ BUG FIX: Resume timer if the server says a session is already running.
      // Assumes the API returns `activeSessionStartedAt` (ISO string) when live.
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

  // ─── Start ─────────────────────────────────────────────────────────────────
  const startSession = useCallback(async () => {
    if (running || actionLoading) return;   // guard against double-tap
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

  // ─── Stop ──────────────────────────────────────────────────────────────────
  const stopSession = useCallback(async () => {
    if (!running || actionLoading) return;  // guard
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

  // ─── Complete ──────────────────────────────────────────────────────────────
  const completeAction = useCallback(async () => {
    if (actionLoading) return;
    setError(null);
    try {
      setActionLoading(true);

      // ✅ BUG FIX: Stop running session before completing to avoid dangling sessions
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

  // ─── Render ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="text-slate-400 animate-pulse">Loading action…</div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-[#0F172A] border border-white/10 p-6 rounded-2xl">
        <h2 className="text-lg font-semibold mb-4">Current Action</h2>

        {/* ✅ Inline error banner instead of alert() */}
        {error && (
          <div className="mb-4 rounded-xl bg-red-500/10 border border-red-500/30 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        {!action && !error && (
          <p className="text-slate-400">No pending action for current step</p>
        )}

        {action && (
          <>
            <h3 className="text-xl font-medium">{action.title}</h3>

            <p className="text-sm text-slate-400 mt-2">{action.description}</p>

            <div className="mt-2 flex gap-4 text-xs text-slate-500">
              <span>Required: {action.minRequiredMinutes} min</span>
              <span>Tracked: {action.totalTrackedMinutes} min</span>
            </div>

            {/* Timer */}
            <div
              className="mt-4 text-3xl font-mono tabular-nums"
              aria-live="polite"
              aria-label={`Timer: ${formatTime(seconds)}`}
            >
              {formatTime(seconds)}
            </div>

            {/* Controls */}
            <div className="flex gap-3 mt-4">
              {!running ? (
                <button
                  onClick={startSession}
                  disabled={actionLoading}
                  className="bg-green-500 px-4 py-2 rounded-xl text-black font-medium
                             disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
                >
                  {actionLoading ? "Starting…" : "Start"}
                </button>
              ) : (
                <button
                  onClick={stopSession}
                  disabled={actionLoading}
                  className="bg-yellow-400 px-4 py-2 rounded-xl text-black font-medium
                             disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
                >
                  {actionLoading ? "Stopping…" : "Stop"}
                </button>
              )}

              <button
                onClick={completeAction}
                disabled={actionLoading}
                className="bg-sky-500 text-black px-4 py-2 rounded-xl font-medium
                           disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
              >
                {actionLoading ? "Completing…" : "Complete"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}