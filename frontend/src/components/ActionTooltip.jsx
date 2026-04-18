import React from "react";

const ActionTooltip = ({ tooltip }) => {

  if (!tooltip) return null;

  const { x, y, date, actions } = tooltip;

  return (
    <div
      style={{
        position: "fixed",
        top: y + 16,
        left: x + 16
      }}
      className="bg-background border-4 border-foreground rounded-none p-4 w-64 z-[9999] shadow-none"
    >
      <h3 className="font-extrabold uppercase tracking-tight text-base mb-2 border-b-2 border-foreground pb-2">
        {new Date(date).toDateString()}
      </h3>

      {actions.length === 0 ? (
        <p className="text-xs font-bold uppercase tracking-widest text-foreground/50">
          No actions completed
        </p>
      ) : (
        <div className="space-y-2 mt-3">
          {actions.map((action) => (
            <div
              key={action._id}
              className="text-sm font-medium text-foreground bg-muted p-2 rounded-sm"
            >
              • {action.title}
            </div>
          ))}
        </div>
      )}
    </div>
  );

};

export default ActionTooltip;