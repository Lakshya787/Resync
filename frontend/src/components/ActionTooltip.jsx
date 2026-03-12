import React from "react";

const ActionTooltip = ({ tooltip }) => {

  if (!tooltip) return null;

  const { x, y, date, actions } = tooltip;

  return (
    <div
      style={{
        position: "fixed",
        top: y + 12,
        left: x + 12
      }}
      className="bg-white border shadow-xl rounded-lg p-4 w-64 z-50"
    >
      <h3 className="font-semibold text-sm mb-2">
        {new Date(date).toDateString()}
      </h3>

      {actions.length === 0 ? (
        <p className="text-xs text-gray-500">
          No actions completed
        </p>
      ) : (
        <div className="space-y-1">
          {actions.map((action) => (
            <div
              key={action._id}
              className="text-xs text-gray-700"
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