import { useEffect, useState } from "react";
import api from "../Api";

export default function Goal() {
  const [goals, setGoals] = useState([]);
  const [activeGoal, setActiveGoal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [pace, setPace] = useState("medium");

  const fetchData = async () => {
    try {
      const [goalsRes, activeRes] = await Promise.all([
        api.get("/goal"),
        api.get("/goal/active"),
      ]);

      setGoals(goalsRes.data.data);
      setActiveGoal(activeRes.data.data);
    } catch (err) {
      console.error(err);
      alert("Failed to load goals");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

const createGoal = async () => {
  if (!name || !["skill", "exam", "career"].includes(category)) {
    return alert("Valid name and category required");
  }

  try {
    setActionLoading(true);

    await api.post("/goal/create", {
      name,
      category,
      description,
      pacePreference: pace
    });

    setName("");
    setCategory("");
    setDescription("");
    setPace("medium");

    fetchData();
  } catch (err) {
    alert(err.response?.data?.message);
  } finally {
    setActionLoading(false);
  }
};

  const activateGoal = async (goalId) => {
    try {
      setActionLoading(true);

      await api.post("/goal/select", {
        goalId,
        pacePreference: pace,
      });

      fetchData();
    } catch (err) {
      alert(err.response?.data?.message);
    } finally {
      setActionLoading(false);
    }
  };

  const pauseGoal = async () => {
    try {
      setActionLoading(true);

      await api.patch("/goal/pause");

      fetchData();
    } catch (err) {
      alert(err.response?.data?.message);
    } finally {
      setActionLoading(false);
    }
  };
  const deleteGoal = async (goalId) => {
  const confirmDelete = window.confirm("Are you sure you want to delete this goal?");
  if (!confirmDelete) return;

  try {
    setActionLoading(true);

    await api.delete(`/goal/${goalId}`);

    fetchData();
  } catch (err) {
    alert(err.response?.data?.message || "Failed to delete goal");
  } finally {
    setActionLoading(false);
  }
};

  if (loading) {
    return (
      <div className="text-slate-400">
        Loading goals…
      </div>
    );
  }

return (
  <div className="space-y-6">

    {/* ACTIVE GOAL */}
    <div className="bg-[#0F172A] border border-white/10 p-6 rounded-2xl">
      <h2 className="text-lg font-semibold mb-2">Active Goal</h2>

      {activeGoal ? (
        <>
          <h3 className="text-xl font-medium">
            {activeGoal.goal.name}
          </h3>

          <p className="text-sm text-slate-400 mt-1">
            Category: {activeGoal.goal.category} · Pace: {activeGoal.pacePreference}
          </p>

          <button
            onClick={pauseGoal}
            disabled={actionLoading}
            className="mt-4 bg-yellow-500 px-4 py-2 rounded-xl text-sm disabled:opacity-50"
          >
            Pause Goal
          </button>
        </>
      ) : (
        <p className="text-slate-400">
          No active goal selected
        </p>
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
            className="w-full p-2 rounded bg-[#020617]"
          />

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full p-2 rounded bg-[#020617]"
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
            className="w-full p-2 rounded bg-[#020617]"
          />

          <select
            value={pace}
            onChange={(e) => setPace(e.target.value)}
            className="w-full p-2 rounded bg-[#020617]"
          >
            <option value="slow">Slow Pace</option>
            <option value="medium">Medium Pace</option>
            <option value="fast">Fast Pace</option>
          </select>

          <button
            onClick={createGoal}
            disabled={actionLoading}
            className="bg-sky-500 text-black px-4 py-2 rounded-xl font-medium"
          >
            Create Goal
          </button>
        </div>
      </div>
    )}


    {/* GOALS */}
    <div className="bg-[#0F172A] border border-white/10 p-6 rounded-2xl">
      <h2 className="text-lg font-semibold mb-4">Your Goals</h2>

      <div className="space-y-4">
        {goals.map((goal) => {
          const isActive = activeGoal?.goal?._id === goal._id;

          return (
            <div
              key={goal._id}
              className={`p-4 rounded-xl flex justify-between items-center
              ${isActive ? "border border-sky-500" : "bg-[#020617]"}`}
            >
              <div>
                <h3 className="font-medium">{goal.name}</h3>
                <p className="text-xs text-slate-400">
                  {goal.category}
                </p>
              </div>

              {!isActive && (
                <div className="flex items-center gap-2">

                  <select
                    value={pace}
                    onChange={(e) => setPace(e.target.value)}
                    className="bg-[#0F172A] px-2 py-1 rounded text-sm"
                  >
                    <option value="slow">Slow</option>
                    <option value="medium">Medium</option>
                    <option value="fast">Fast</option>
                  </select>

                  <button
                    onClick={() => activateGoal(goal._id)}
                    disabled={actionLoading}
                    className="bg-sky-500 text-black px-3 py-1 rounded-xl text-sm"
                  >
                    Activate
                  </button>

                  <button
                    onClick={() => deleteGoal(goal._id)}
                    disabled={actionLoading}
                    className="bg-red-500 px-3 py-1 rounded-xl text-sm disabled:opacity-50"
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