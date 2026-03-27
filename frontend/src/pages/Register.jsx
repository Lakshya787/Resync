import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import ResyncLogo from "../components/ResyncLogo";
import api from "../Api.js";

export default function Register() {
  const navigate = useNavigate();

  const [fullname, setFullname]   = useState("");
  const [username, setUsername]   = useState("");
  const [email, setEmail]         = useState("");
  const [password, setPassword]   = useState("");

  const [loading, setLoading]     = useState(false);  // ✅ prevents spam-clicks
  const [error, setError]         = useState(null);   // ✅ visible error instead of silent console.log

  // ✅ Basic client-side validation before hitting the API
  const validate = () => {
    if (fullname.trim().length < 2)
      return "Full name must be at least 2 characters.";
    if (username.trim().length < 3)
      return "Username must be at least 3 characters.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return "Enter a valid email address.";
    if (password.length < 8)
      return "Password must be at least 8 characters.";
    return null;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(null);

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setLoading(true);

      await api.post("/auth/signup", {
        email,
        password,
        fullname,
        username,
      });

      // ✅ Navigate with a success flag instead of alert()
      navigate("/login", { state: { registered: true } });
    } catch (err) {
      // ✅ Always show the error to the user
      setError(
        err.response?.data?.message || "Registration failed. Please try again."
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
          <h2 className="text-xl font-semibold text-softwhite">Register</h2>
          <p className="text-sm text-slate mt-1">Create your secure account</p>
        </div>

        {/* ✅ Inline error banner */}
        {error && (
          <div className="mb-4 rounded-lg bg-red-500/10 border border-red-500/30 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4" noValidate>
          <div>
            <label className="block text-xs font-medium text-slate mb-1">
              Full Name
            </label>
            <input
              type="text"
              required
              autoComplete="name"
              value={fullname}
              onChange={(e) => setFullname(e.target.value)}
              className="w-full rounded-lg px-3 py-2 text-sm bg-navy border border-border-subtle
                         text-softwhite focus:outline-none focus:border-sync"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate mb-1">
              Username
            </label>
            <input
              type="text"
              required
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded-lg px-3 py-2 text-sm bg-navy border border-border-subtle
                         text-softwhite focus:outline-none focus:border-sync"
            />
          </div>

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
                         text-softwhite placeholder:text-slate focus:outline-none focus:border-sync"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate mb-1">
              Password
            </label>
            <input
              type="password"
              required
              autoComplete="new-password"
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
            {loading ? "Creating account…" : "Create account"}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-slate">
          Already have an account?{" "}
          <Link to="/login" className="text-softwhite hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}