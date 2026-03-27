import { useState } from "react";
import api from "../Api.js";

export default function Settings() {

  const [form, setForm] = useState({
    fullname: "",
    email: "",
    education: "",
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // ✅ Separate loading states so both sections are independent
  const [profileLoading, setProfileLoading]   = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  // ✅ Separate feedback per section — no alert()
  const [profileMsg, setProfileMsg]   = useState(null); // { type: "success"|"error", text }
  const [passwordMsg, setPasswordMsg] = useState(null);

  // ── Handlers ────────────────────────────────────────────────────────────────
  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handlePasswordChange = (e) => {
    setPasswordForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // ── Save Profile ─────────────────────────────────────────────────────────────
  const saveProfile = async () => {
    setProfileMsg(null);

    // ✅ Client-side validation
    if (!form.fullname.trim()) {
      setProfileMsg({ type: "error", text: "Full name is required." });
      return;
    }

    try {
      setProfileLoading(true);
      await api.patch("/user/profile", form);
      setProfileMsg({ type: "success", text: "Profile updated successfully." });
    } catch (err) {
      setProfileMsg({
        type: "error",
        text: err.response?.data?.message || "Failed to update profile.",
      });
    } finally {
      setProfileLoading(false);
    }
  };

  // ── Update Password ───────────────────────────────────────────────────────────
  const updatePassword = async () => {
    setPasswordMsg(null);

    // ✅ Client-side validation before hitting the API
    if (!passwordForm.currentPassword) {
      setPasswordMsg({ type: "error", text: "Current password is required." });
      return;
    }
    if (passwordForm.newPassword.length < 8) {
      setPasswordMsg({ type: "error", text: "New password must be at least 8 characters." });
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordMsg({ type: "error", text: "Passwords do not match." });
      return;
    }

    try {
      setPasswordLoading(true);
      await api.patch("/user/change-password", {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });

      // ✅ Clear form on success so passwords don't linger in the DOM
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setPasswordMsg({ type: "success", text: "Password updated successfully." });
    } catch (err) {
      setPasswordMsg({
        type: "error",
        text: err.response?.data?.message || "Failed to update password.",
      });
    } finally {
      setPasswordLoading(false);
    }
  };

  // ── Shared styles ─────────────────────────────────────────────────────────────
  const inputClass =
    "w-full p-2 rounded-lg text-sm bg-[#020617] border border-white/10 text-softwhite " +
    "placeholder:text-slate-500 focus:outline-none focus:border-sky-500 transition-colors";

  const Feedback = ({ msg }) =>
    msg ? (
      <div
        className={`rounded-lg px-4 py-3 text-sm border ${
          msg.type === "success"
            ? "bg-green-500/10 border-green-500/30 text-green-400"
            : "bg-red-500/10 border-red-500/30 text-red-400"
        }`}
      >
        {msg.text}
      </div>
    ) : null;

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-2xl mx-auto p-8 space-y-8">

      <h1 className="text-2xl font-bold">Settings</h1>

      {/* PROFILE */}
      <div className="bg-[#0F172A] border border-white/10 rounded-2xl p-6 space-y-4">
        <h2 className="font-semibold text-lg">Profile</h2>

        <Feedback msg={profileMsg} />

        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1">
            Full Name
          </label>
          <input
            name="fullname"
            value={form.fullname}
            placeholder="Full Name"
            autoComplete="name"
            className={inputClass}
            onChange={handleChange}
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1">
            Education Level
          </label>
          {/* ✅ value added — this was an uncontrolled select */}
          <select
            name="education"
            value={form.education}
            className={inputClass}
            onChange={handleChange}
          >
            <option value="">Select education level</option>
            <option value="class_10">Class 10</option>
            <option value="class_12">Class 12</option>
            <option value="btech">BTech</option>
            <option value="bachelors">Bachelor's</option>
            <option value="masters">Master's</option>
          </select>
        </div>

        <button
          onClick={saveProfile}
          disabled={profileLoading}
          className="bg-sky-500 text-black px-4 py-2 rounded-xl font-medium text-sm
                     disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
        >
          {profileLoading ? "Saving…" : "Save Changes"}
        </button>
      </div>

      {/* CHANGE PASSWORD */}
      <div className="bg-[#0F172A] border border-white/10 rounded-2xl p-6 space-y-4">
        <h2 className="font-semibold text-lg">Change Password</h2>

        <Feedback msg={passwordMsg} />

        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1">
            Current Password
          </label>
          <input
            type="password"
            name="currentPassword"
            value={passwordForm.currentPassword}
            placeholder="••••••••"
            autoComplete="current-password"
            className={inputClass}
            onChange={handlePasswordChange}
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1">
            New Password
          </label>
          <input
            type="password"
            name="newPassword"
            value={passwordForm.newPassword}
            placeholder="••••••••"
            autoComplete="new-password"
            className={inputClass}
            onChange={handlePasswordChange}
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1">
            Confirm New Password
          </label>
          <input
            type="password"
            name="confirmPassword"
            value={passwordForm.confirmPassword}
            placeholder="••••••••"
            autoComplete="new-password"
            className={inputClass}
            onChange={handlePasswordChange}
          />
        </div>

        <button
          onClick={updatePassword}
          disabled={passwordLoading}
          className="bg-sky-500 text-black px-4 py-2 rounded-xl font-medium text-sm
                     disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
        >
          {passwordLoading ? "Updating…" : "Update Password"}
        </button>
      </div>

    </div>
  );
}