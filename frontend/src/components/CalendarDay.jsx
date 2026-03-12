const CalendarDay = ({ day, dateStr, actions, onHover, onLeave }) => {

  const count = actions ? actions.length : 0;

  let bg = "bg-slate-700";
  let text = "text-white";

  if (count === 1) bg = "bg-green-500";
  if (count === 2) bg = "bg-green-600";
  if (count >= 3) bg = "bg-green-700";

  return (
    <div
      onMouseEnter={(e) => onHover(dateStr, e)}
      onMouseLeave={onLeave}
      className={`h-24 rounded-xl ${bg} ${text} flex items-start justify-end p-3 
      font-semibold shadow hover:scale-105 transition cursor-pointer`}
    >
      {day}
    </div>
  );
};

export default CalendarDay;