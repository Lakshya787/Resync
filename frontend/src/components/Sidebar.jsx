import { NavLink, Link } from "react-router-dom";
import { useState } from "react";
import {
  LayoutDashboard,
  Target,
  ListChecks,
  CheckSquare,
  Folder,
  Calendar,
  Map,
  Settings,
  Menu
} from "lucide-react";

export default function Sidebar() {

  const [expanded, setExpanded] = useState(true);

  const base =
    "flex items-center gap-3 rounded-md px-3 py-3 text-sm font-semibold transition-all duration-200";

  const active =
    "bg-primary text-white scale-[1.02]";

  const inactive =
    "text-foreground/70 hover:text-foreground hover:bg-muted";

  const navItems = [
    { name: "Dashboard", path: "/home", icon: LayoutDashboard },
    { name: "Goal", path: "/goal", icon: Target },
    { name: "Active Step", path: "/step", icon: ListChecks },
    { name: "Action", path: "/action", icon: CheckSquare },
    { name: "Projects", path: "/project", icon: Folder },

    // productivity features
    { name: "Calendar", path: "/calendar", icon: Calendar },
    { name: "Roadmap", path: "/roadmap", icon: Map },

    // system
    { name: "Settings", path: "/settings", icon: Settings }
  ];

  return (
    <aside
      className={`${
        expanded ? "w-64" : "w-20"
      } bg-background border-r-2 border-border p-4 flex flex-col transition-all duration-300`}
    >

      {/* HEADER */}
      <div className="flex items-center justify-between mb-8">

        {expanded && (
          <div className="flex items-center gap-2">
            <img src="/Icon.png" alt="Resync" className="w-8 h-8" />
            <span className="text-lg font-bold text-foreground uppercase tracking-wider">
              Resync
            </span>
          </div>
        )}

        <button
          onClick={() => setExpanded(!expanded)}
          className="text-foreground shrink-0 p-2 hover:bg-muted rounded-md transition-colors"
        >
          <Menu size={20} />
        </button>

      </div>

      {/* NAVIGATION */}
      <nav className="flex-1 space-y-2">

        {navItems.map((item) => {

          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              title={!expanded ? item.name : ""}
              className={({ isActive }) =>
                `${base} ${isActive ? active : inactive}`
              }
            >

              <Icon size={20} strokeWidth={2.5} />

              {expanded && <span>{item.name}</span>}

            </NavLink>
          );

        })}

      </nav>

      {/* FOOTER */}
      <div className="pt-4 border-t-2 border-border text-center">
        <Link
          to="/login"
          className={`flex items-center gap-3 text-xs font-bold text-foreground/50 hover:text-error transition uppercase tracking-widest ${expanded ? "justify-start" : "justify-center"}`}
        >
          {expanded ? "Logout" : "X"}
        </Link>
      </div>

    </aside>
  );
}