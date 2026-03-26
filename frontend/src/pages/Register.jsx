import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import ResyncLogo from "../components/ResyncLogo";
import api from "../Api.js";

export default function Register() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullname, setFullname] = useState("");
  const [username, setUsername] = useState("");

const handleRegister = async (e) => {
  e.preventDefault();

  console.log("REGISTER CLICKED");

  try {
    console.log("SENDING REGISTER REQUEST");

    const res = await api.post("/auth/signup", {
      email,
      password,
      fullname,
      username,
    });

    console.log("REGISTER RESPONSE:", res.data);

    alert("Signup successful");
    navigate("/login");

  } catch (error) {
    console.log("REGISTER ERROR:", error);
    console.log("DATA:", error.response?.data);
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
          <p className="text-sm text-slate mt-1">
            Create your secure account
          </p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate mb-1">
              Full Name
            </label>
            <input
              type="text"
              required
              value={fullname}
              onChange={(e) => setFullname(e.target.value)}
              className="w-full rounded-lg px-3 py-2 text-sm bg-navy border border-border-subtle text-softwhite"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate mb-1">
              Username
            </label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded-lg px-3 py-2 text-sm bg-navy border border-border-subtle text-softwhite"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate mb-1">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="
                w-full rounded-lg px-3 py-2 text-sm
                bg-navy border border-border-subtle
                text-softwhite placeholder:text-slate
                focus:outline-none focus:border-sync
              "
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
              placeholder="••••••••"
              className="
                w-full rounded-lg px-3 py-2 text-sm
                bg-navy border border-border-subtle
                text-softwhite placeholder:text-slate
                focus:outline-none focus:border-sync
              "
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
            Create account
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