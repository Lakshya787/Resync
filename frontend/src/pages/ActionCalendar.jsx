import { useEffect, useState } from "react";
import api from "../Api";
import CalendarDay from "../components/CalendarDay";
import ActionTooltip from "../components/ActionTooltip";

const weekDays = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

const ActionCalendar = () => {

  const [history, setHistory] = useState({});
  const [tooltip, setTooltip] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();

  /* ===========================
     FETCH ACTION HISTORY
  =========================== */

  const fetchHistory = async () => {

    try {

      const res = await api.get("/actions/history");

      const actions = res.data.data;

      const grouped = {};

      actions.forEach((action) => {

const date = new Date(
  action.completedAt || action.startedAt || action.updatedAt
).toLocaleDateString("en-CA");

        if (!grouped[date]) grouped[date] = [];

        grouped[date].push(action);

      });

      setHistory(grouped);

    } catch (error) {
      console.error(error);
    }

  };

  useEffect(() => {
    fetchHistory();
  }, []);

  /* ===========================
     TOOLTIP
  =========================== */

  const handleHover = (date, e) => {

    if (!history[date]) return;

    setTooltip({
      x: e.clientX,
      y: e.clientY,
      date,
      actions: history[date]
    });

  };

  const handleLeave = () => setTooltip(null);

  /* ===========================
     MONTH NAVIGATION
  =========================== */

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  /* ===========================
     GENERATE CALENDAR
  =========================== */

  const days = [];

  // empty cells before month start
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(<div key={"empty" + i}></div>);
  }

  // actual days
  for (let i = 1; i <= daysInMonth; i++) {

    const dateObj = new Date(year, month, i);
    const dateStr = dateObj.toISOString().split("T")[0];

    days.push(
      <CalendarDay
        key={i}
        day={i}
        dateStr={dateStr}
        actions={history[dateStr]}
        onHover={handleHover}
        onLeave={handleLeave}
      />
    );

  }

  /* ===========================
     RENDER
  =========================== */

  return (

    <div className="p-10">

      {/* Month header */}
      <div className="flex items-center justify-between mb-6">

        <button
          onClick={prevMonth}
          className="px-3 py-1 border rounded"
        >
          ←
        </button>

        <h2 className="text-2xl font-bold">
          {currentDate.toLocaleString("default",{month:"long"})} {year}
        </h2>

        <button
          onClick={nextMonth}
          className="px-3 py-1 border rounded"
        >
          →
        </button>

      </div>

      {/* Weekdays */}
      <div className="grid grid-cols-7 mb-2 text-center font-semibold">

        {weekDays.map((day) => (
          <div key={day}>{day}</div>
        ))}

      </div>

      {/* Calendar */}
      <div className="grid grid-cols-7 gap-3">

        {days}

      </div>

      <ActionTooltip tooltip={tooltip} />

    </div>

  );

};

export default ActionCalendar;