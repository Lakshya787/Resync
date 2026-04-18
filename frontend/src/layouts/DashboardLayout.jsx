import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";
import UserStatus from "../components/UserStatus";
import api from "../Api";

export default function DashboardLayout() {
  const [dashboard, setDashboard] = useState(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get("/dashboard");
        if (res.data.success) {
          setDashboard(res.data.data);
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchDashboard();
  }, []);

  return (
    <div className="flex h-screen bg-background text-foreground">
      <Sidebar />

      <div className="flex flex-col flex-1 overflow-hidden">
        <main className="flex-1 overflow-y-auto p-8 space-y-8 bg-muted/50 rounded-tl-3xl border-t-2 border-l-2 border-border">
          {/* Global User Status */}
          <div className="flex justify-end">
            {dashboard && <UserStatus user={dashboard} />}
          </div>

          {/* Page Content */}
          <Outlet />

        </main>

        <Footer />
      </div>
    </div>
  );
}