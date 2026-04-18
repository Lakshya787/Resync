import { useCallback, useEffect, useState } from "react";
import api from "../Api";
import Card from "../components/Card";
import Button from "../components/Button";
import Input from "../components/Input";
 
export default function Goal() {
  const [goals, setGoals]           = useState([]);
  const [activeGoal, setActiveGoal] = useState(null);
  const [loading, setLoading]       = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError]           = useState(null);
 
  const [name, setName]             = useState("");
  const [category, setCategory]     = useState("");
  const [description, setDescription] = useState("");
  const [pace, setPace]             = useState("medium");
 
  const [goalPaces, setGoalPaces]   = useState({});
 
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
 
  const createGoal = async () => {
    setError(null);
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
 
  const activateGoal = async (goalId) => {
    setError(null);
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
 
  const deleteGoal = async (goalId) => {
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
 
  if (loading) {
    return <div className="text-foreground/50 font-bold uppercase tracking-widest animate-pulse">Loading goals…</div>;
  }
 
  return (
    <div className="space-y-8">
 
      {error && (
        <div className="rounded-md bg-error text-white font-bold px-4 py-4 uppercase tracking-wide text-sm">
          {error}
        </div>
      )}
 
      {/* ACTIVE GOAL */}
      <Card bgColor="bg-background">
        <h2 className="text-xl font-extrabold mb-4 uppercase tracking-tight text-primary">Active Goal</h2>
 
        {activeGoal ? (
          <>
            <h3 className="text-3xl font-extrabold mb-2">{activeGoal.goal.name}</h3>
            <p className="text-sm font-bold text-foreground/60 uppercase tracking-widest mb-6">
              Category: {activeGoal.goal.category} · Pace: {activeGoal.pacePreference}
            </p>
            <Button
              onClick={pauseGoal}
              disabled={actionLoading}
              variant="outline"
              className="border-accent text-accent hover:bg-accent hover:text-white"
            >
              {actionLoading ? "PAUSING…" : "PAUSE GOAL"}
            </Button>
          </>
        ) : (
          <p className="text-foreground/60 font-medium">No active goal selected</p>
        )}
      </Card>
 
      {/* CREATE GOAL */}
      {goals.length < 2 && (
        <Card bgColor="bg-background">
          <h2 className="text-xl font-extrabold mb-6 uppercase tracking-tight">Create New Goal</h2>
 
          <div className="space-y-4">
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Goal name"
            />
 
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full h-14 px-4 bg-muted text-foreground rounded-md focus:border-2 focus:border-primary outline-none"
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
              className="w-full p-4 rounded-md bg-muted text-foreground focus:border-2 focus:border-primary outline-none resize-none h-32"
            />
 
            <select
              value={pace}
              onChange={(e) => setPace(e.target.value)}
              className="w-full h-14 px-4 bg-muted text-foreground rounded-md focus:border-2 focus:border-primary outline-none"
            >
              <option value="slow">Slow Pace</option>
              <option value="medium">Medium Pace</option>
              <option value="fast">Fast Pace</option>
            </select>
 
            <Button
              onClick={createGoal}
              disabled={actionLoading}
              variant="primary"
            >
              {actionLoading ? "CREATING…" : "CREATE GOAL"}
            </Button>
          </div>
        </Card>
      )}
 
      {/* GOALS LIST */}
      <Card bgColor="bg-background">
        <h2 className="text-xl font-extrabold mb-6 uppercase tracking-tight">Your Goals</h2>
 
        {goals.length === 0 && (
          <p className="text-foreground/50 font-medium">No goals yet. Create one above.</p>
        )}
 
        <div className="space-y-4">
          {goals.map((goal) => {
            const isActive = activeGoal?.goal?._id === goal._id;
 
            return (
              <div
                key={goal._id}
                className={`p-6 rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all ${
                  isActive
                    ? "border-4 border-primary bg-primary/5"
                    : "bg-muted"
                }`}
              >
                <div>
                  <h3 className="font-extrabold text-xl">{goal.name}</h3>
                  <p className="text-sm font-bold text-foreground/60 uppercase tracking-widest mt-1">{goal.category}</p>
                  {isActive && (
                    <span className="text-sm font-bold text-primary mt-2 inline-block uppercase tracking-wider">
                      ● ACTIVE
                    </span>
                  )}
                </div>
 
                {!isActive && (
                  <div className="flex items-center gap-3">
                    <select
                      value={goalPaces[goal._id] || "medium"}
                      onChange={(e) =>
                        setGoalPaces((prev) => ({
                          ...prev,
                          [goal._id]: e.target.value,
                        }))
                      }
                      className="h-14 bg-background border-2 border-border px-4 rounded-md font-bold focus:outline-none focus:border-primary"
                    >
                      <option value="slow">Slow</option>
                      <option value="medium">Medium</option>
                      <option value="fast">Fast</option>
                    </select>
 
                    <Button
                      onClick={() => activateGoal(goal._id)}
                      disabled={actionLoading}
                      variant="primary"
                    >
                      {actionLoading ? "…" : "ACTIVATE"}
                    </Button>
 
                    <Button
                      onClick={() => deleteGoal(goal._id)}
                      disabled={actionLoading}
                      variant="danger"
                    >
                      DELETE
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Card>
 
    </div>
  );
}