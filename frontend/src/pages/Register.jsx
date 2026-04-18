import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import ResyncLogo from "../components/ResyncLogo";
import api from "../Api.js";
import Button from "../components/Button";
import Input from "../components/Input";
import Card from "../components/Card";

export default function Register() {
  const navigate = useNavigate();

  const [fullname, setFullname]   = useState("");
  const [username, setUsername]   = useState("");
  const [email, setEmail]         = useState("");
  const [password, setPassword]   = useState("");

  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState(null);

  const validate = () => {
    if (fullname.trim().length < 2) return "Full name must be at least 2 characters.";
    if (username.trim().length < 3) return "Username must be at least 3 characters.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Enter a valid email address.";
    if (password.length < 8) return "Password must be at least 8 characters.";
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

      navigate("/login", { state: { registered: true } });
    } catch (err) {
      setError(
        err.response?.data?.message || "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden">
      
      {/* Decorative */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-secondary rounded-full opacity-10" />
      <div className="absolute bottom-[-10%] right-[-10%] w-80 h-80 bg-primary rotate-[30deg] opacity-10" />

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
            <h2 className="text-3xl font-extrabold uppercase tracking-tighter text-foreground">Register</h2>
            <p className="text-foreground/70 mt-2 font-medium">Create your secure account</p>
          </div>

          {error && (
            <div className="mb-6 bg-error text-white font-bold px-4 py-4 rounded-md uppercase tracking-wide text-sm text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-6" noValidate>
            <div>
              <label className="block text-sm font-bold text-foreground mb-2 uppercase tracking-wide">
                Full Name
              </label>
              <Input
                type="text"
                required
                autoComplete="name"
                value={fullname}
                onChange={(e) => setFullname(e.target.value)}
                placeholder="John Doe"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-foreground mb-2 uppercase tracking-wide">
                Username
              </label>
              <Input
                type="text"
                required
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="johndoe"
              />
            </div>

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
                autoComplete="new-password"
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
              {loading ? "CREATING ACCOUNT…" : "CREATE ACCOUNT"}
            </Button>
          </form>

          <p className="mt-8 text-center font-bold text-sm text-foreground/70 uppercase tracking-widest">
            Already have an account?{" "}
            <Link to="/login" className="text-primary hover:text-blue-600 transition-colors">
              Log in
            </Link>
          </p>
        </Card>
      </div>
    </div>
  );
}