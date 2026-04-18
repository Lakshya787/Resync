import { useEffect, useState } from "react";
import api from "../Api";
import CalendarDay from "../components/CalendarDay";
import ActionTooltip from "../components/ActionTooltip";
import Card from "../components/Card";
import Button from "../components/Button";

const weekDays = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

const ActionCalendar = () => {

  const [history, setHistory] = useState({});
  const [tooltip, setTooltip] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();

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

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const days = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(<div key={"empty" + i}></div>);
  }

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

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <Card bgColor="bg-background">
        {/* Month header */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-10 gap-4">
          <Button onClick={prevMonth} variant="outline" className="border-2 px-4 h-12 hover:bg-black hover:text-white">
            ← PREV
          </Button>

          <h2 className="text-3xl font-extrabold uppercase tracking-tight text-primary">
            {currentDate.toLocaleString("default",{month:"long"})} {year}
          </h2>

          <Button onClick={nextMonth} variant="outline" className="border-2 px-4 h-12 hover:bg-black hover:text-white">
            NEXT →
          </Button>
        </div>

        {/* Weekdays */}
        <div className="grid grid-cols-7 mb-4 text-center font-bold uppercase tracking-widest text-foreground/50 border-b-2 border-border pb-4">
          {weekDays.map((day) => (
            <div key={day}>{day}</div>
          ))}
        </div>

        {/* Calendar */}
        <div className="grid grid-cols-7 gap-4">
          {days}
        </div>
      </Card>

      <ActionTooltip tooltip={tooltip} />
    </div>
  );
};

export default ActionCalendar;