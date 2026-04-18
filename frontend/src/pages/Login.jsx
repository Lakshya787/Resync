import { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import ResyncLogo from "../components/ResyncLogo";
import api from "../Api.js";
import Button from "../components/Button";
import Input from "../components/Input";
import Card from "../components/Card";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState(null);

  const justRegistered = location.state?.registered;

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);

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
      setError(
        err.response?.data?.message || "Login failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden">
      
      {/* Decorative */}
      <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-primary rounded-full opacity-10" />
      <div className="absolute bottom-[-10%] left-[-10%] w-64 h-64 bg-accent rotate-45 opacity-10" />

      {/* LOGO */}
      <div className="mb-8 relative z-10 hover:scale-105 transition-transform">
        <Link to="/">
          <ResyncLogo size="lg" />
        </Link>
      </div>

      {/* CARD */}
      <div className="w-full max-w-md relative z-10">
        <Card bgColor="bg-background">
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-extrabold uppercase tracking-tighter text-foreground">Login</h2>
            <p className="text-foreground/70 mt-2 font-medium">
              Secure access to your workspace
            </p>
          </div>

          {justRegistered && (
            <div className="mb-6 bg-secondary text-white font-bold px-4 py-4 rounded-md uppercase tracking-wide text-sm text-center">
              Account created! Please log in.
            </div>
          )}

          {error && (
            <div className="mb-6 bg-error text-white font-bold px-4 py-4 rounded-md uppercase tracking-wide text-sm text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6" noValidate>
            <div>
              <label className="block text-sm font-bold text-foreground mb-2 uppercase tracking-wide">
                Email
              </label>
              <Input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-foreground mb-2 uppercase tracking-wide">
                Password
              </label>
              <Input
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full mt-4"
              variant="primary"
            >
              {loading ? "LOGGING IN…" : "LOG IN"}
            </Button>
          </form>

          <p className="mt-8 text-center font-bold text-sm text-foreground/70 uppercase tracking-widest">
            Don't have an account?{" "}
            <Link to="/register" className="text-primary hover:text-blue-600 transition-colors">
              Register
            </Link>
          </p>
        </Card>
      </div>
    </div>
  );
}