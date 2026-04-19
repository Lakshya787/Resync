import { Link } from "react-router-dom";
import ResyncLogo from "../components/ResyncLogo";
import Button from "../components/Button";

export default function Landing() {
  return (
    <div className="min-h-screen font-sans text-foreground">

      {/* HERO SECTION - Blue Block */}
      <section className="relative bg-primary text-white min-h-[90vh] flex flex-col overflow-hidden">
        
        {/* Geometric Background Decorations */}
        <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-white/10 rounded-full" />
        <div className="absolute bottom-[10%] left-[-10%] w-64 h-64 bg-white/10 rotate-45" />

        {/* NAVBAR */}
        <nav className="relative z-10 w-full max-w-7xl mx-auto px-6 h-24 flex justify-between items-center">
          <Link to="/" className="hover:scale-105 transition-transform duration-200">
            <ResyncLogo size="lg" />
          </Link>

          <div className="flex gap-8 font-bold uppercase tracking-wider items-center">
            <Link to="/about" className="hover:text-blue-200 transition-colors">
              About
            </Link>
            <Link to="/login" className="hover:text-blue-200 transition-colors">
              Login
            </Link>
            <Link
              to="/register"
              className="bg-white text-primary px-6 h-12 flex items-center rounded-md hover:bg-gray-100 hover:scale-105 transition-all duration-200"
            >
              Get Started
            </Link>
          </div>
        </nav>

        {/* HERO CONTENT */}
        <div className="relative z-10 flex-1 flex items-center">
          <div className="max-w-7xl mx-auto px-6 w-full grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h1 className="text-5xl lg:text-7xl font-extrabold leading-none mb-8 tracking-tighter">
                Stop Planning.
                <br />
                Start Executing.
              </h1>

              <p className="text-xl lg:text-2xl font-medium mb-10 max-w-lg leading-snug">
                One goal. One step. No roadmap. No overwhelm.
                Resync forces structured execution through controlled progression.
              </p>

              <div className="flex gap-4">
                <Link to="/register">
                  <Button variant="secondary" className="bg-white text-primary text-lg h-16 w-48">
                    START NOW
                  </Button>
                </Link>
                <Link to="/login">
                  <Button variant="outline" className="text-white border-white hover:bg-blue-300 hover:text-primary text-lg h-16 w-32 border-4">
                    LOGIN
                  </Button>
                </Link>
              </div>
            </div>

            {/* Poster Graphic Representation */}
            <div className="relative rounded-lg bg-white p-12 lg:p-16 text-foreground flex flex-col gap-6 rotate-1 hover:rotate-0 transition-transform duration-300 transform-gpu shadow-none">
              <div className="absolute top-0 right-0 w-32 h-32 bg-accent -mt-8 -mr-8 rounded-full z-[-1]" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-secondary -mb-6 -ml-6" />
              
              <div className="text-2xl font-bold uppercase tracking-tighter">The System</div>
              
              <div className="flex flex-col gap-4 text-lg font-medium">
                <div className="bg-muted p-4 rounded-md">1. Choose Goal</div>
                <div className="text-primary text-center font-bold text-2xl">↓</div>
                <div className="bg-muted p-4 rounded-md">2. Get One Step</div>
                <div className="text-primary text-center font-bold text-2xl">↓</div>
                <div className="bg-muted p-4 rounded-md">3. Execute Step</div>
                <div className="text-primary text-center font-bold text-2xl">↓</div>
                <div className="bg-primary text-white p-4 rounded-md font-bold text-xl uppercase text-center transform scale-105">Unlock Next Step</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA - Amber Block */}
      <section className="bg-accent py-32 text-center text-foreground flex flex-col items-center justify-center relative overflow-hidden">
        <div className="absolute top-[-50%] left-1/4 w-full h-full bg-white/10 rounded-full blur-[1px]" />
        
        <h2 className="text-4xl md:text-5xl font-extrabold mb-10 tracking-tighter relative z-10 max-w-3xl">
          READY TO STOP CONSUMING AND START BUILDING?
        </h2>

        <Link to="/register" className="relative z-10">
          <Button variant="primary" className="bg-foreground text-white hover:bg-gray-800 text-xl h-20 px-12 rounded-lg">
            START YOUR FIRST STEP
          </Button>
        </Link>
      </section>

    </div>
  );
}