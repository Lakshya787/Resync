import Card from "../components/Card";

export default function About() {
  return (
    <div className="min-h-screen bg-background text-foreground px-6 py-20 relative overflow-hidden">

      {/* Decorative */}
      <div className="absolute top-[-5%] left-[-5%] w-96 h-96 bg-primary rounded-full opacity-10" />
      <div className="absolute bottom-[-10%] right-[-10%] w-64 h-64 bg-secondary rotate-45 opacity-10" />

      {/* Header */}
      <div className="max-w-6xl mx-auto text-center mb-24 relative z-10">
        <h1 className="text-5xl md:text-6xl font-extrabold mb-6 uppercase tracking-tighter">
          About Resync
        </h1>
        <p className="text-foreground/80 font-medium text-lg max-w-2xl mx-auto">
          An AI-powered execution engine designed to eliminate roadmap overwhelm
          and enforce disciplined, structured skill development.
        </p>
      </div>

      {/* Platform Philosophy */}
      <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8 mb-32 relative z-10">
        <Card title="🎯 Goal Architecture" bgColor="bg-muted" className="hover:-translate-y-1 transition-transform">
          Resync transforms abstract ambitions into structured, trackable
          long-term goals with defined execution flow.
        </Card>

        <Card title="🧩 Step-Locked Progression" bgColor="bg-primary text-white" className="hover:-translate-y-1 transition-transform">
          Users cannot skip ahead randomly. Progression is structured,
          enforcing disciplined execution rather than passive consumption.
        </Card>

        <Card title="🤖 AI Integration" bgColor="bg-muted" className="hover:-translate-y-1 transition-transform">
          Intelligent step generation and roadmap assistance powered
          by modern AI systems to optimize learning efficiency.
        </Card>
      </div>

      {/* Developer Section */}
      <div className="max-w-5xl mx-auto relative z-10">
        <Card bgColor="bg-foreground text-white" className="p-8 md:p-12">
          <div className="flex flex-col md:flex-row items-center gap-10">

            {/* Image */}
            <div className="flex-shrink-0">
              <img
                src="/lakshya.jpeg"
                alt="Lakshya Dewangan"
                className="w-40 h-40 md:w-52 md:h-52 object-cover rounded-lg border-4 border-primary shadow-none"
              />
            </div>

            {/* Text */}
            <div className="text-white/80 leading-relaxed space-y-4 font-medium text-lg">
              <h2 className="text-3xl font-extrabold text-white uppercase tracking-tight mb-6">About the Developer</h2>
              <p>
                <span className="font-extrabold text-white uppercase tracking-wider">
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