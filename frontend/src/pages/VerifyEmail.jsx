import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Button from "../components/Button";
import Card from "../components/Card";

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
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/v1/auth/verify-email?token=${token}`);
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
    <div className="min-h-screen flex items-center justify-center bg-muted text-foreground px-4">
      <div className="max-w-md w-full">
        <Card bgColor="bg-background" className="text-center">
          {status === "loading" && (
            <>
              <h2 className="text-2xl font-extrabold mb-2 uppercase tracking-tight">Verifying your email…</h2>
              <p className="text-foreground/70 font-medium">Please wait a moment.</p>
            </>
          )}

          {status === "success" && (
            <>
              <h2 className="text-2xl font-extrabold text-secondary mb-2 uppercase tracking-tight">Success</h2>
              <p className="font-medium mb-4">{message}</p>
              <p className="text-sm font-bold text-foreground/50 uppercase tracking-wider">Redirecting to login…</p>
            </>
          )}

          {status === "error" && (
            <>
              <h2 className="text-2xl font-extrabold text-error mb-2 uppercase tracking-tight">Verification Failed</h2>
              <p className="font-medium mb-6">{message}</p>
              <Button
                onClick={() => navigate("/login")}
                variant="primary"
                className="w-full"
              >
                GO TO LOGIN
              </Button>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
