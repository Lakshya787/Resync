import { useEffect, useState } from "react";
import api from "../Api";
import Card from "../components/Card";
import Button from "../components/Button";
import Input from "../components/Input";
 
export default function Project() {
  const [repoLink, setRepoLink] = useState("");
  const [description, setDescription] = useState("");
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
 
  const fetchHistory = async () => {
    try {
      const res = await api.get("/project/history");
      setHistory(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load project history");
    } finally {
      setLoading(false);
    }
  };
 
  useEffect(() => {
    fetchHistory();
  }, []);
 
  const submitProject = async () => {
    setError(null);
    if (!repoLink) {
      setError("Repository link is required");
      return;
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
    } catch (err) {
      setError(err.response?.data?.message || "Submission failed");
    } finally {
      setSubmitting(false);
    }
  };
 
  return (
    <div className="space-y-8">

      {error && (
        <div className="rounded-md bg-error text-white font-bold px-4 py-4 uppercase tracking-wide text-sm">
          {error}
        </div>
      )}
 
      {/* SUBMIT PROJECT */}
      <Card bgColor="bg-background">
        <h2 className="text-xl font-extrabold mb-6 uppercase tracking-tight">
          Submit Project
        </h2>
 
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-foreground mb-2 uppercase tracking-wide">Repository Link</label>
            <Input
              value={repoLink}
              onChange={(e) => setRepoLink(e.target.value)}
              placeholder="https://github.com/..."
            />
          </div>
 
          <div>
            <label className="block text-sm font-bold text-foreground mb-2 uppercase tracking-wide">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What did you build?"
              className="w-full p-4 rounded-md bg-muted text-foreground focus:border-2 focus:border-primary outline-none h-32 resize-none"
            />
          </div>
 
          <Button
            onClick={submitProject}
            disabled={submitting}
            variant="primary"
          >
            {submitting ? "SUBMITTING…" : "SUBMIT PROJECT"}
          </Button>
        </div>
      </Card>
 
      {/* PROJECT HISTORY */}
      <Card bgColor="bg-background">
        <h2 className="text-xl font-extrabold mb-6 uppercase tracking-tight">
          Project History
        </h2>
 
        {loading && (
          <p className="text-foreground/50 font-bold uppercase tracking-widest animate-pulse">Loading…</p>
        )}
 
        {!loading && history.length === 0 && (
          <p className="text-foreground/60 font-medium">
            No projects submitted yet
          </p>
        )}
 
        <div className="space-y-4">
          {history.map((p) => (
            <div
              key={p.projectId}
              className="bg-muted p-6 rounded-lg transition-transform hover:scale-[1.01]"
            >
              <h3 className="font-extrabold text-xl">
                {p.stepName}
              </h3>
 
              <p className="text-sm font-bold text-foreground/50 uppercase tracking-widest mt-2">
                Type: {p.stepType}
              </p>
 
              <a
                href={p.repoLink}
                target="_blank"
                rel="noreferrer"
                className="text-primary font-bold text-sm block mt-4 hover:underline"
              >
                {p.repoLink}
              </a>
 
              {p.description && (
                <p className="text-base text-foreground/80 mt-4 font-medium bg-white p-4 rounded-md border-l-4 border-secondary">
                  {p.description}
                </p>
              )}
 
              <p className="text-xs text-foreground/40 mt-4 font-bold uppercase tracking-widest">
                Submitted {new Date(p.submittedAt).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      </Card>
 
    </div>
  );
}