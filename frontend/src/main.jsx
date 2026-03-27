import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";

import {
  RouterProvider,
  createBrowserRouter,
  createRoutesFromElements,
  Route,
} from "react-router-dom";

import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Start from "./pages/Start.jsx";
import About from "./pages/About.jsx";

import Dashboard from "./pages/Dashboard.jsx";
import Step from "./pages/Step.jsx";
import Project from "./pages/Project.jsx";
import Goal from "./pages/Goal.jsx";
import Action from "./pages/Action.jsx";
import ActionCalendar from "./pages/ActionCalendar.jsx";
import Roadmap from "./pages/Roadmap.jsx";
import Settings from "./pages/Settings.jsx";
import VerifyEmailPage from "./pages/VerifyEmail.jsx";

import DashboardLayout from "./layouts/DashboardLayout.jsx";
import PublicLayout from "./layouts/PublicLayout.jsx";

const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      {/* Public Pages */}
      <Route path="/verify-email" element={<VerifyEmailPage />} />
      <Route element={<PublicLayout />}>

        <Route path="/" element={<Start />} />
        <Route path="/about" element={<About />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

      </Route>

      {/* App Pages */}
      <Route element={<DashboardLayout />}>

        <Route path="/home" element={<Dashboard />} />
        <Route path="/step" element={<Step />} />
        <Route path="/goal" element={<Goal />} />
        <Route path="/project" element={<Project />} />
        <Route path="/action" element={<Action />} />
        <Route path="/calendar" element={<ActionCalendar />} />
        <Route path="/roadmap" element={<Roadmap />} />
        <Route path="/settings" element={<Settings/>}/>
      </Route>
    </>
  )
);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);