import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = searchParams.get("token");
  const [status, setStatus] = useState("loading"); // loading | success | error
  const [message, setMessage] = useState("");

  useEffect(() => {
    const verify = async () => {
      if (!token) {
        setStatus("error");
        setMessage("Missing token");
        return;
      }

      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/auth/verify-email?token=${token}`);
        setStatus("success");
        setMessage(res.data?.message || "Email verified successfully");
        setTimeout(() => navigate("/login"), 3000);
      } catch (err) {
        setStatus("error");
        setMessage(err.response?.data?.message || "Invalid or expired token");
      }
    };

    verify();
  }, [token, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 text-white px-4">
      <div className="max-w-md w-full bg-gray-900 rounded-2xl shadow-lg p-8 text-center">
        {status === "loading" && (
          <>
            <h2 className="text-xl font-semibold mb-2">Verifying your email…</h2>
            <p className="text-gray-400 text-sm">Please wait a moment.</p>
          </>
        )}

        {status === "success" && (
          <>
            <h2 className="text-xl font-semibold text-green-400 mb-2">Success</h2>
            <p className="text-gray-300 mb-4">{message}</p>
            <p className="text-xs text-gray-500">Redirecting to login…</p>
          </>
        )}

        {status === "error" && (
          <>
            <h2 className="text-xl font-semibold text-red-400 mb-2">Verification Failed</h2>
            <p className="text-gray-300 mb-6">{message}</p>
            <button
              onClick={() => navigate("/login")}
              className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-xl"
            >
              Go to Login
            </button>
          </>
        )}
      </div>
    </div>
  );
}
