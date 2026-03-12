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
    <div className="max-w-5xl mx-auto py-12 px-4">
      <h2 className="text-3xl font-bold text-center mb-12">
        Learning Roadmap
      </h2>

      <div className="relative">

{/* road */}
            <div className="absolute left-1/2 top-0 h-full w-16 bg-gray-700 -translate-x-1/2"></div>

            {/* center dashed divider */}
            <div
            className="absolute left-1/2 top-0 h-full -translate-x-1/2"
            style={{
                width: "4px",
                background:
                "repeating-linear-gradient(to bottom, white 0px, white 25px, transparent 25px, transparent 60px)"
            }}
            ></div>

        {steps.map((step, index) => {
          const isLeft = index % 2 === 0;

          let statusColor = "bg-gray-400";
          if (step.status === "completed") statusColor = "bg-green-500";
          if (step.status === "active") statusColor = "bg-yellow-500";

          return (
            <div
              key={step.stepId}
              className={`relative flex items-center mb-12 ${
                isLeft ? "justify-start" : "justify-end"
              }`}
            >
           {/* card */}
            <div
            className={`w-5/12 border rounded-lg shadow-md p-4
            ${
                step.status === "completed"
                ? "bg-emerald-900/20 border-emerald-400"
                : step.status === "active"
                ? "bg-blue-900/30 border-blue-400"
                : "bg-slate-900 border-blue-900"
            }`}
            >
            <h3 className="font-semibold text-lg text-white">{step.title}</h3>

            <p className="text-sm text-blue-200 mt-1">
                {step.description}
            </p>

            <div className="text-xs text-blue-300 mt-2">
                Type: {step.type}
            </div>

 {step.completedAt && (
  <div className="text-xs mt-1 text-emerald-400">
    Completed: {new Date(step.completedAt).toLocaleDateString("en-IN", {
      timeZone: "UTC"
    })}
  </div>
)}
            </div>
              {/* dot */}
              <div
                className={`absolute left-1/2 w-5 h-5 rounded-full ${statusColor} transform -translate-x-1/2`}
              ></div>
            </div>
          );
        })}
      </div>
    </div>
  );
}