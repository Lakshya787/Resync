import { Outlet } from "react-router-dom";
import Footer from "../components/Footer";

export default function PublicLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">

      <main className="flex-1">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
}