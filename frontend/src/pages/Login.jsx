import { useNavigate, Link } from "react-router-dom";
import { useState } from "react";
import ResyncLogo from "../components/ResyncLogo";
import api from "../Api.js";

export default function Login() {
  const navigate = useNavigate();   // 🔥 ADD THIS

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

const handleLogin = async (e) => {
  e.preventDefault();
  console.log("CLICKED");   // 1

  try {
    console.log("SENDING REQUEST"); // 2

    const res = await api.post("/auth/login", {
      email,
      password
    });

    console.log("RESPONSE:", res.data); // 3

    navigate("/home");

  } catch (err) {
    console.log("ERROR:", err); // 🔥 IMPORTANT
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

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate mb-1">
              Email
            </label>
        <input
  type="email"
  required
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  className="w-full rounded-lg px-3 py-2 text-sm bg-navy border border-border-subtle text-softwhite"
/>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate mb-1">
              Password
            </label>
           <input
  type="password"
  required
  value={password}
  onChange={(e) => setPassword(e.target.value)}
  className="w-full rounded-lg px-3 py-2 text-sm bg-navy border border-border-subtle text-softwhite"
/>
          </div>

          <button
            type="submit"
            className="
              w-full bg-sync text-navy font-medium
              py-2 rounded-lg
              hover:bg-sync-hover
            "
          >
            Log in
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-slate">
          Don’t have an account?{" "}
          <Link to="/register" className="text-softwhite hover:underline">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}