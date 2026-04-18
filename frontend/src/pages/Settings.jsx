import { useState } from "react";
import api from "../Api.js";
import Card from "../components/Card";
import Button from "../components/Button";
import Input from "../components/Input";

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

  const [profileLoading, setProfileLoading]   = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  const [profileMsg, setProfileMsg]   = useState(null);
  const [passwordMsg, setPasswordMsg] = useState(null);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handlePasswordChange = (e) => {
    setPasswordForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const saveProfile = async () => {
    setProfileMsg(null);
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

  const updatePassword = async () => {
    setPasswordMsg(null);

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

  const Feedback = ({ msg }) =>
    msg ? (
      <div
        className={`rounded-md font-bold px-4 py-4 uppercase tracking-wide text-sm mb-6 ${
          msg.type === "success"
            ? "bg-secondary text-white"
            : "bg-error text-white"
        }`}
      >
        {msg.text}
      </div>
    ) : null;

  return (
    <div className="max-w-2xl mx-auto space-y-8 pb-12">

      <h1 className="text-3xl font-extrabold uppercase tracking-tight text-foreground mb-8">Settings</h1>

      {/* PROFILE */}
      <Card bgColor="bg-background">
        <h2 className="font-extrabold text-xl uppercase tracking-tighter mb-6">Profile</h2>

        <Feedback msg={profileMsg} />

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-foreground mb-2 uppercase tracking-wide">
              Full Name
            </label>
            <Input
              name="fullname"
              value={form.fullname}
              placeholder="Full Name"
              autoComplete="name"
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-foreground mb-2 uppercase tracking-wide">
              Education Level
            </label>
            <select
              name="education"
              value={form.education}
              className="w-full h-14 px-4 bg-muted text-foreground rounded-md focus:border-2 focus:border-primary outline-none"
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

          <Button
            onClick={saveProfile}
            disabled={profileLoading}
            variant="primary"
          >
            {profileLoading ? "SAVING…" : "SAVE CHANGES"}
          </Button>
        </div>
      </Card>

      {/* CHANGE PASSWORD */}
      <Card bgColor="bg-background">
        <h2 className="font-extrabold text-xl uppercase tracking-tighter mb-6">Change Password</h2>

        <Feedback msg={passwordMsg} />

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-foreground mb-2 uppercase tracking-wide">
              Current Password
            </label>
            <Input
              type="password"
              name="currentPassword"
              value={passwordForm.currentPassword}
              placeholder="••••••••"
              autoComplete="current-password"
              onChange={handlePasswordChange}
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-foreground mb-2 uppercase tracking-wide">
              New Password
            </label>
            <Input
              type="password"
              name="newPassword"
              value={passwordForm.newPassword}
              placeholder="••••••••"
              autoComplete="new-password"
              onChange={handlePasswordChange}
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-foreground mb-2 uppercase tracking-wide">
              Confirm New Password
            </label>
            <Input
              type="password"
              name="confirmPassword"
              value={passwordForm.confirmPassword}
              placeholder="••••••••"
              autoComplete="new-password"
              onChange={handlePasswordChange}
            />
          </div>

          <Button
            onClick={updatePassword}
            disabled={passwordLoading}
            variant="danger"
          >
            {passwordLoading ? "UPDATING…" : "UPDATE PASSWORD"}
          </Button>
        </div>
      </Card>

    </div>
  );
}