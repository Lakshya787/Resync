import { useState } from "react";
import api from "../Api.js";

export default function Settings() {

  const [form, setForm] = useState({
    fullname: "",
    email: "",
    education: ""
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setPasswordForm({ ...passwordForm, [e.target.name]: e.target.value });
  };

  const saveProfile = async () => {
    try {
      await api.patch("/user/profile", form);
      alert("Profile updated");
    } catch (err) {
      console.error(err);
    }
  };

  const updatePassword = async () => {
    try {
      await api.patch("/user/change-password", passwordForm);
      alert("Password updated");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-8 space-y-8">

      <h1 className="text-2xl font-bold">Settings</h1>

      {/* Profile Settings */}
      <div className="border rounded-lg p-6 space-y-4">

        <h2 className="font-semibold text-lg">Profile</h2>

        <input
          name="fullname"
          placeholder="Full Name"
          className="w-full border p-2 rounded"
          onChange={handleChange}
        />
        <select
          name="education"
          className="w-full border p-2 rounded"
          onChange={handleChange}
        >
          <option value="">Education Level</option>
          <option>Class 10</option>
          <option>Class 12</option>
          <option>BTech</option>
          <option>Bachelor's</option>
          <option>Master's</option>
        </select>

        <button
          onClick={saveProfile}
          className="bg-black text-white px-4 py-2 rounded cursor-pointer"
        >
          Save Changes
        </button>

      </div>

      {/* Password Section */}
      <div className="border rounded-lg p-6 space-y-4">

        <h2 className="font-semibold text-lg">Change Password</h2>

        <input
          type="password"
          name="currentPassword"
          placeholder="Current Password"
          className="w-full border p-2 rounded"
          onChange={handlePasswordChange}
        />

        <input
          type="password"
          name="newPassword"
          placeholder="New Password"
          className="w-full border p-2 rounded"
          onChange={handlePasswordChange}
        />

        <input
          type="password"
          name="confirmPassword"
          placeholder="Confirm Password"
          className="w-full border p-2 rounded"
          onChange={handlePasswordChange}
        />

        <button
          onClick={updatePassword}
          className="bg-black text-white px-4 py-2 rounded cursor-pointer"
        >
          Update Password
        </button>

      </div>

    </div>
  );
}