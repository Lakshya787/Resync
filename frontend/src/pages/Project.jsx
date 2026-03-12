import { useEffect, useState } from "react";
import api from "../Api";

export default function Project() {
  const [repoLink, setRepoLink] = useState("");
  const [description, setDescription] = useState("");
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const fetchHistory = async () => {
    try {
      const res = await api.get("/project/history");
      setHistory(res.data.data);
    } catch (err) {
      alert(
        err.response?.data?.message || "Failed to load project history"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const submitProject = async () => {
    if (!repoLink) {
      return alert("Repository link is required");
    }

    try {
      setSubmitting(true);

      await api.post("/project/submit", {
        repoLink,
        description,
      });

      setRepoLink("");
      setDescription("");

      fetchHistory();

      alert("Project submitted successfully");
    } catch (err) {
      alert(err.response?.data?.message || "Submission failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">

      {/* SUBMIT PROJECT */}
      <div className="bg-[#0F172A] border border-white/10 p-6 rounded-2xl">
        <h2 className="text-lg font-semibold mb-4">
          Submit Project
        </h2>

        <div className="space-y-3">
          <input
            value={repoLink}
            onChange={(e) => setRepoLink(e.target.value)}
            placeholder="GitHub / Repository link"
            className="w-full p-2 rounded bg-[#020617]"
          />

          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description (optional)"
            className="w-full p-2 rounded bg-[#020617]"
          />

          <button
            onClick={submitProject}
            disabled={submitting}
            className="bg-sky-500 text-black px-4 py-2 rounded-xl font-medium disabled:opacity-50"
          >
            {submitting ? "Submitting…" : "Submit Project"}
          </button>
        </div>
      </div>

      {/* PROJECT HISTORY */}
      <div className="bg-[#0F172A] border border-white/10 p-6 rounded-2xl">
        <h2 className="text-lg font-semibold mb-4">
          Project History
        </h2>

        {loading && (
          <p className="text-slate-400">Loading…</p>
        )}

        {!loading && history.length === 0 && (
          <p className="text-slate-400">
            No projects submitted yet
          </p>
        )}

        <div className="space-y-4">
          {history.map((p) => (
            <div
              key={p.projectId}
              className="bg-[#020617] p-4 rounded-xl"
            >
              <h3 className="font-medium">
                {p.stepName}
              </h3>

              <p className="text-xs text-slate-400 mt-1">
                Type: {p.stepType}
              </p>

              <a
                href={p.repoLink}
                target="_blank"
                rel="noreferrer"
                className="text-sky-400 text-sm block mt-2"
              >
                {p.repoLink}
              </a>

              {p.description && (
                <p className="text-sm text-slate-400 mt-2">
                  {p.description}
                </p>
              )}

              <p className="text-xs text-slate-500 mt-2">
                Submitted on{" "}
                {new Date(p.submittedAt).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}