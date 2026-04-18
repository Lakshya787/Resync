import { useEffect, useState } from "react";
import api from "../Api";

export default function Roadmap() {
  const [steps, setSteps] = useState([]);

  useEffect(() => {
    async function fetchRoadmap() {
      try {
        const res = await api.get("/step/history");
        setSteps(res.data.data || []);
      } catch (err) {
        console.error(err);
      }
    }

    fetchRoadmap();
  }, []);

  return (
    <div className="max-w-4xl mx-auto py-12 px-6">
      <h2 className="text-4xl font-extrabold text-primary text-center mb-16 uppercase tracking-tighter">
        Learning Roadmap
      </h2>

      <div className="relative">

        {/* Custom solid road line */}
        <div className="absolute left-1/2 top-0 h-full w-2 bg-muted -translate-x-1/2 rounded-full overflow-hidden">
          <div className="absolute top-0 w-full h-[10%] bg-primary animate-pulse" />
        </div>

        {steps.map((step, index) => {
          const isLeft = index % 2 === 0;

          // Flat design status definitions
          let statusColor = "bg-muted";
          let badgeColor = "bg-foreground text-white";
          if (step.status === "completed") {
            statusColor = "bg-secondary";
            badgeColor = "bg-secondary text-white";
          }
          if (step.status === "active") {
            statusColor = "bg-accent";
            badgeColor = "bg-accent text-white";
          }

          return (
            <div
              key={step.stepId ?? index}
              className={`relative flex items-center mb-12 ${
                isLeft ? "justify-start" : "justify-end"
              }`}
            >
              {/* card */}
              <div
                className={`w-5/12 p-6 rounded-lg transition-transform hover:-translate-y-1 ${
                  step.status === "completed"
                    ? "bg-secondary/10 border-4 border-secondary"
                    : step.status === "active"
                    ? "bg-accent/10 border-4 border-accent"
                    : "bg-background border-4 border-muted"
                }`}
              >
                <div className="flex justify-between items-start mb-2 gap-4">
                  <h3 className="font-extrabold text-xl text-foreground capitalize">{step.title}</h3>
                  <span className={`px-2 py-1 text-[10px] font-bold uppercase tracking-widest rounded-md ${badgeColor}`}>
                    {step.status}
                  </span>
                </div>

                <p className="text-sm text-foreground/80 font-medium mb-4">
                  {step.description}
                </p>

                <div className="text-xs font-bold text-foreground/50 uppercase tracking-widest">
                  Type: {step.type}
                </div>

                {step.completedAt && (
                  <div className="text-xs mt-3 font-bold text-secondary uppercase tracking-wider">
                    Completed: {new Date(step.completedAt).toLocaleDateString("en-IN", {
                      timeZone: "UTC"
                    })}
                  </div>
                )}
              </div>

              {/* dot */}
              <div
                className={`absolute left-1/2 w-8 h-8 rounded-full border-4 border-background ${statusColor} transform -translate-x-1/2 shadow-none z-10`}
              ></div>
            </div>
          );
        })}
      </div>
    </div>
  );
}