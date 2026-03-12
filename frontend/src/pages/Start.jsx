import { Link } from "react-router-dom";
import ResyncLogo from "../components/ResyncLogo";

export default function Landing() {
  return (
    <div className="min-h-screen bg-[#0B1220] text-[#E5E7EB]">

      {/* NAVBAR */}
      <nav className="max-w-6xl mx-auto px-6 py-6 flex justify-between items-center">
        <ResyncLogo size="md" />

        <div className="flex gap-6 text-sm items-center">
          <Link to="/about" className="hover:text-[#38BDF8] transition">
            About
          </Link>

          <Link to="/login" className="hover:text-[#38BDF8] transition">
            Login
          </Link>

          <Link
            to="/register"
            className="bg-[#38BDF8] text-black px-4 py-2 rounded-xl font-semibold hover:opacity-90 transition"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* HERO */}
      <section className="max-w-6xl mx-auto px-6 py-24 grid md:grid-cols-2 gap-16 items-center">
        <div>
          <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
            Stop Planning.
            <br />
            Start Executing.
          </h1>

          <p className="text-[#94A3B8] text-lg mb-8">
            One goal. One step. No roadmap. No overwhelm.
            Resync forces structured execution through controlled progression.
          </p>

          <div className="flex gap-4">
            <Link
              to="/register"
              className="bg-[#38BDF8] text-black px-6 py-3 rounded-xl font-semibold hover:opacity-90 transition"
            >
              Start Now
            </Link>

            <Link
              to="/login"
              className="border border-[#1E3A8A] px-6 py-3 rounded-xl hover:bg-[#1E3A8A]/30 transition"
            >
              Login
            </Link>
          </div>
        </div>

        <div className="relative bg-[#0F172A] border border-white/10 rounded-2xl p-10 overflow-hidden">
          <div className="absolute w-64 h-64 bg-[#38BDF8]/10 rounded-full blur-3xl rotate-slow -top-20 -right-20"></div>

          <div className="relative space-y-4 text-sm text-[#94A3B8]">
            <div>Choose Goal</div>
            <div className="text-[#38BDF8]">↓</div>
            <div>Get One Step</div>
            <div className="text-[#38BDF8]">↓</div>
            <div>Complete</div>
            <div className="text-[#38BDF8]">↓</div>
            <div>Unlock Next Step</div>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="bg-[#0F172A] py-20 text-center">
        <h2 className="text-3xl font-semibold mb-6">
          Ready To Stop Consuming And Start Building?
        </h2>

        <Link
          to="/register"
          className="bg-[#38BDF8] text-black px-8 py-4 rounded-xl font-semibold hover:opacity-90 transition"
        >
          Start Your First Step
        </Link>
      </section>


    </div>
  );
}