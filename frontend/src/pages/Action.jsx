import { useEffect, useState } from "react";
import api from "../Api";

export default function Action() {
  const [action, setAction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchAction = async () => {
    try {
      const res = await api.get("/actions/active");
      setAction(res.data.data);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to load action");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAction();
  }, []);

  /* Stopwatch */

  useEffect(() => {
    let interval;

    if (running) {
      interval = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [running]);

  const formatTime = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  /* Start */

  const startSession = async () => {
    try {
      setActionLoading(true);

      await api.post("/actions/start-session", {
        actionId: action._id,
      });

      setRunning(true);
    } catch (err) {
      alert(err.response?.data?.message);
    } finally {
      setActionLoading(false);
    }
  };

  /* Stop */

  const stopSession = async () => {
    try {
      setActionLoading(true);

      await api.post("/actions/stop-session", {
        actionId: action._id,
      });

      setRunning(false);
      setSeconds(0);

      fetchAction();
    } catch (err) {
      alert(err.response?.data?.message);
    } finally {
      setActionLoading(false);
    }
  };

  /* Complete */

  const completeAction = async () => {
    try {
      setActionLoading(true);

      await api.post("/actions/complete", {
        actionId: action._id,
      });

      setRunning(false);
      setSeconds(0);

      fetchAction();
    } catch (err) {
      alert(err.response?.data?.message);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <div className="text-slate-400">Loading action…</div>;
  }

  return (
    <div className="space-y-6">

      <div className="bg-[#0F172A] border border-white/10 p-6 rounded-2xl">

        <h2 className="text-lg font-semibold mb-4">
          Current Action
        </h2>

        {!action && (
          <p className="text-slate-400">
            No pending action for current step
          </p>
        )}

        {action && (
          <>
            <h3 className="text-xl font-medium">
              {action.title}
            </h3>

            <p className="text-sm text-slate-400 mt-2">
              {action.description}
            </p>

            <p className="text-xs text-slate-500 mt-2">
              Required Minutes: {action.minRequiredMinutes}
            </p>

            <p className="text-xs text-slate-500">
              Tracked Minutes: {action.totalTrackedMinutes}
            </p>

            {/* Timer */}

            <div className="mt-4 text-3xl font-mono">
              {formatTime(seconds)}
            </div>

            {/* Controls */}

            <div className="flex gap-3 mt-4">

              {!running ? (
                <button
                  onClick={startSession}
                  disabled={actionLoading}
                  className="bg-green-500 px-4 py-2 rounded-xl text-black font-medium"
                >
                  Start
                </button>
              ) : (
                <button
                  onClick={stopSession}
                  disabled={actionLoading}
                  className="bg-yellow-400 px-4 py-2 rounded-xl text-black font-medium"
                >
                  Stop
                </button>
              )}

              <button
                onClick={completeAction}
                disabled={actionLoading}
                className="bg-sky-500 text-black px-4 py-2 rounded-xl font-medium"
              >
                Complete
              </button>

            </div>
          </>
        )}
      </div>

    </div>
  );
}