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
 
      {/* RECOMMENDED VIDEOS */}
      {activeGoal?.goal?.resources && activeGoal.goal.resources.length > 0 && (
        <Card bgColor="bg-background">
          <h2 className="text-xl font-extrabold mb-2 uppercase tracking-tight text-primary">Recommended Resources</h2>
          <p className="text-sm font-medium text-foreground/60 mb-6">Expert-selected learning materials to help you with your active goal.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeGoal.goal.resources.map((video, idx) => (
              <a
                key={idx}
                href={video.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block p-4 border-2 border-border rounded-lg hover:border-primary transition-colors bg-muted"
              >
                <div className="flex flex-col h-full justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-lg leading-tight">{video.title}</h3>
                    <p className="text-sm text-foreground/70 mt-2 line-clamp-2">{video.description}</p>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-auto pt-2">
                    {video.channel && (
                      <span className="text-xs font-bold uppercase py-1 px-2 border border-border bg-background rounded-full">
                        {video.channel}
                      </span>
                    )}
                    {video.duration && (
                      <span className="text-xs font-bold uppercase py-1 px-2 border border-border rounded-full">
                        {video.duration}
                      </span>
                    )}
                    {video.difficulty_level && (
                      <span className="text-xs font-bold uppercase py-1 px-2 bg-primary/10 text-primary rounded-full">
                        {video.difficulty_level}
                      </span>
                    )}
                  </div>
                </div>
              </a>
            ))}
          </div>
        </Card>
      )}
 
      {/* RECOMMENDED ROADMAP */}
      {activeGoal?.goal?.roadmap && activeGoal.goal.roadmap.length > 0 && (
        <Card bgColor="bg-background">
          <h2 className="text-xl font-extrabold mb-2 uppercase tracking-tight text-primary">Recommended Roadmap</h2>
          <p className="text-sm font-medium text-foreground/60 mb-6">A step-by-step learning path generated specifically for your goal.</p>
          
          <div className="space-y-4">
            {activeGoal.goal.roadmap.map((step, idx) => (
              <div key={idx} className="p-4 border-2 border-border rounded-lg bg-muted flex flex-col md:flex-row gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-primary/20 text-primary font-black text-xl rounded-full flex items-center justify-center">
                  {step.step_number || idx + 1}
                </div>
                <div className="flex-grow">
                  <h3 className="font-extrabold text-lg">{step.title}</h3>
                  <p className="text-foreground/70 text-sm mt-1 mb-3">{step.description}</p>
                  
                  <div className="flex flex-wrap gap-2 text-xs font-bold uppercase tracking-wide">
                    {step.difficulty && (
                      <span className="py-1 px-2 border-2 border-primary text-primary rounded-md">
                        {step.difficulty}
                      </span>
                    )}
                    {step.concepts && step.concepts.map((concept, cIdx) => (
                      <span key={cIdx} className="py-1 px-2 border-2 border-border bg-background rounded-md">
                        {concept}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )} 
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