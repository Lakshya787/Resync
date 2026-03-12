import Card from "../components/Card";

export default function About() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-[#0f172a] to-black text-white px-6 py-16">

      {/* Header */}
      <div className="max-w-6xl mx-auto text-center mb-20">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          About Resync
        </h1>
        <p className="text-gray-400 max-w-2xl mx-auto">
          An AI-powered execution engine designed to eliminate roadmap overwhelm
          and enforce disciplined, structured skill development.
        </p>
      </div>

      {/* Platform Philosophy */}
      <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8 mb-24">
        <Card title="🎯 Goal Architecture">
          Resync transforms abstract ambitions into structured, trackable
          long-term goals with defined execution flow.
        </Card>

        <Card title="🧩 Step-Locked Progression">
          Users cannot skip ahead randomly. Progression is structured,
          enforcing disciplined execution rather than passive consumption.
        </Card>

        <Card title="🤖 AI Integration">
          Intelligent step generation and roadmap assistance powered
          by modern AI systems to optimize learning efficiency.
        </Card>
      </div>

      {/* Developer Section */}
      <div className="max-w-5xl mx-auto">
        <Card title="About the Developer">
          <div className="flex flex-col md:flex-row items-center gap-10">

            {/* Image */}
            <div className="flex-shrink-0">
              <img
                src="/lakshya.jpeg"
                alt="Lakshya Dewangan"
                className="w-40 h-40 md:w-52 md:h-52 object-cover rounded-2xl border border-white/10 shadow-lg"
              />
            </div>

            {/* Text */}
            <div className="text-gray-300 leading-relaxed space-y-4">
              <p>
                <span className="font-semibold text-white">
                  Lakshya Dewangan
                </span>{" "}
                is a Computer Science undergraduate at IIIT Naya Raipur and
                the developer of Resync — an AI-powered execution engine
                designed to eliminate roadmap overwhelm and enforce disciplined
                skill development.
              </p>

              <p>
                He specializes in full-stack development using the MERN stack,
                backend architecture, secure authentication systems, and AI
                integration with the Gemini API. His focus is on building
                structured, progression-locked systems that prioritize real
                execution over passive learning.
              </p>

              <p>
                Resync reflects his belief that mastery comes from controlled,
                step-by-step execution — not scattered tutorials or unchecked
                flexibility.
              </p>
            </div>

          </div>
        </Card>
      </div>

    </div>
  );
}