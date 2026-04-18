const CalendarDay = ({ day, dateStr, actions, onHover, onLeave }) => {

  const count = actions ? actions.length : 0;

  let bg = "bg-muted";
  let text = "text-foreground font-bold";

  if (count === 1) { bg = "bg-secondary/40"; text = "text-foreground font-bold"; }
  if (count === 2) { bg = "bg-secondary/80"; text = "text-white font-bold"; }
  if (count >= 3) { bg = "bg-secondary"; text = "text-white font-extrabold scale-105"; }

  return (
    <div
      onMouseEnter={(e) => onHover(dateStr, e)}
      onMouseLeave={onLeave}
      className={`h-24 rounded-lg flex items-start justify-end p-3 
      uppercase tracking-widest ${bg} ${text} hover:border-4 border-primary transition-all duration-200 cursor-pointer shadow-none`}
    >
      {day}
    </div>
  );
};

export default CalendarDay;