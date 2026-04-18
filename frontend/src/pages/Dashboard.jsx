import { useCallback, useEffect, useState } from "react";
import api from "../Api.js";
import StreakFire from "../components/StreakFire.jsx";
import Card from "../components/Card.jsx";
import Button from "../components/Button.jsx";

const Dashboard = () => {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/dashboard");
      if (res.data.success) {
        setDashboard(res.data.data);
      } else {
        setError(res.data.message || "Failed to load dashboard");
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  if (loading) {
    return (
      <Card bgColor="bg-background" className="animate-pulse">
        <p className="text-foreground/50 font-bold uppercase tracking-wider">Loading dashboard…</p>
      </Card>
    );
  }

  if (error) {
    return (
      <Card variant="danger" bgColor="bg-background">
        <p className="text-error font-bold mb-4">{error}</p>
        <Button onClick={fetchDashboard} variant="danger">
          RETRY
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div className="bg-primary text-white p-8 rounded-lg">
        <h1 className="text-4xl font-extrabold uppercase tracking-tight mb-2">
          Welcome Back, {dashboard?.username || "User"}
        </h1>
        <p className="text-white/80 font-medium text-lg">
          Stay consistent. Execution beats motivation.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <Card bgColor="bg-background" className="flex flex-col items-center text-center">
          <p className="text-sm text-foreground/50 font-bold uppercase tracking-widest">Current Streak</p>
          <h2 className="text-4xl font-extrabold mt-2 text-primary">
            {dashboard.streak}
          </h2>
          <div className="mt-2 text-accent">
            <StreakFire streak={dashboard.streak} />
          </div>
        </Card>

        <Card bgColor="bg-background" className="text-center">
          <p className="text-sm text-foreground/50 font-bold uppercase tracking-widest">Completed</p>
          <h2 className="text-4xl font-extrabold mt-2 text-secondary">
            {dashboard.completedSteps}
          </h2>
        </Card>

        <Card bgColor="bg-background" className="text-center">
          <p className="text-sm text-foreground/50 font-bold uppercase tracking-widest">Projects</p>
          <h2 className="text-4xl font-extrabold mt-2 text-accent">
            {dashboard.projectCount}
          </h2>
        </Card>

        <Card bgColor="bg-background" className="text-center">
          <p className="text-sm text-foreground/50 font-bold uppercase tracking-widest">Pace</p>
          <h2 className="text-2xl font-extrabold mt-2 text-foreground capitalize">
            {dashboard.pacePreference || "—"}
          </h2>
        </Card>
      </div>

      {/* Goal Section */}
      <Card bgColor="bg-background">
        <h2 className="text-xl font-extrabold mb-6 uppercase tracking-tight">Active Goal</h2>

        {dashboard.activeGoal ? (
          <p className="text-primary font-bold text-2xl mb-6">
            {dashboard.activeGoal}
          </p>
        ) : (
          <p className="text-foreground/60 mb-6 font-medium">No active goal</p>
        )}

        {/* Active Step */}
        {dashboard.activeStep && (
          <div className="bg-muted rounded-lg p-6 mb-8 border-l-4 border-secondary">
            <h3 className="font-extrabold text-xl mb-2 tracking-tight">
              {dashboard.activeStep.title}
            </h3>
            <p className="text-sm text-foreground/60 font-bold uppercase tracking-widest mb-2">
              Type: {dashboard.activeStep.type}
            </p>
            {dashboard.activeStep.deadline && !isNaN(new Date(dashboard.activeStep.deadline)) && (
              <p className="text-sm text-secondary font-bold uppercase tracking-wide">
                Deadline: {new Date(dashboard.activeStep.deadline).toLocaleDateString()}
              </p>
            )}
          </div>
        )}

        {/* Current Action */}
        <div>
          <h3 className="text-xl font-extrabold mb-4 uppercase tracking-tight">Current Action</h3>

          {dashboard.currentAction ? (
            <div className="bg-primary/10 border-4 border-primary rounded-lg p-6">
              <p className="font-extrabold text-primary text-lg">
                {dashboard.currentAction.title}
              </p>
              {dashboard.currentAction.description && (
                <p className="text-sm text-foreground/80 mt-2 font-medium">
                  {dashboard.currentAction.description}
                </p>
              )}
              <p className="text-xs text-foreground/50 mt-4 font-bold uppercase tracking-widest">
                Step Action #{dashboard.currentAction.sequence}
              </p>
            </div>
          ) : (
            <p className="text-foreground/50 font-medium">No pending actions</p>
          )}
        </div>
      </Card>
    </div>
  );
};

export default Dashboard;