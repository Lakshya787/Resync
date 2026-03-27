import { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import ResyncLogo from "../components/ResyncLogo";
import api from "../Api.js";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading]   = useState(false);  // ✅ prevents spam-clicks
  const [error, setError]       = useState(null);   // ✅ visible error

  // ✅ Show success message if redirected here after registration
  const justRegistered = location.state?.registered;

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);

    // ✅ Basic client-side validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Enter a valid email address.");
      return;
    }
    if (password.length < 1) {
      setError("Password is required.");
      return;
    }

    try {
      setLoading(true);

      await api.post("/auth/login", { email, password });

      navigate("/home");
    } catch (err) {
      // ✅ Always surface the error to the user
      setError(
        err.response?.data?.message || "Login failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-navy flex flex-col items-center justify-center px-4">

      {/* LOGO */}
      <div className="mb-6">
        <ResyncLogo size="sm" />
      </div>

      {/* CARD */}
      <div className="w-full max-w-sm bg-navy-card border border-border-subtle rounded-lg p-8">
        <div className="mb-6 text-center">
          <h2 className="text-xl font-semibold text-softwhite">Login</h2>
          <p className="text-sm text-slate mt-1">
            Secure access to your workspace
          </p>
        </div>

        {/* ✅ Post-registration success banner */}
        {justRegistered && (
          <div className="mb-4 rounded-lg bg-green-500/10 border border-green-500/30 px-4 py-3 text-sm text-green-400">
            Account created! Please log in.
          </div>
        )}

        {/* ✅ Inline error banner */}
        {error && (
          <div className="mb-4 rounded-lg bg-red-500/10 border border-red-500/30 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4" noValidate>
          <div>
            <label className="block text-xs font-medium text-slate mb-1">
              Email
            </label>
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg px-3 py-2 text-sm bg-navy border border-border-subtle
                         text-softwhite focus:outline-none focus:border-sync"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate mb-1">
              Password
            </label>
            <input
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-lg px-3 py-2 text-sm bg-navy border border-border-subtle
                         text-softwhite placeholder:text-slate focus:outline-none focus:border-sync"
            />
          </div>

          {/* ✅ Disabled + label change while loading */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-sync text-navy font-medium py-2 rounded-lg
                       hover:bg-sync-hover disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
          >
            {loading ? "Logging in…" : "Log in"}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-slate">
          Don't have an account?{" "}
          <Link to="/register" className="text-softwhite hover:underline">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}