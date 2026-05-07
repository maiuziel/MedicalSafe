import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

const INACTIVITY_TIMEOUT_MS = 15 * 60 * 1000; // 15 minutes

export default function useInactivityLogout() {
  const navigate = useNavigate();
  const timerRef = useRef(null);

  const resetTimer = () => {
    if (timerRef.current) clearTimeout(timerRef.current);

    const token = localStorage.getItem("token");
    if (!token) return;

    timerRef.current = setTimeout(async () => {
      try {
        await fetch("https://medicalsafe-backend.onrender.com/api/auth/logout", {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch (_) {}

      localStorage.removeItem("token");
      localStorage.removeItem("role");
      navigate("/");
    }, INACTIVITY_TIMEOUT_MS);
  };

  useEffect(() => {
    const events = ["mousemove", "keydown", "click", "scroll", "touchstart"];
    events.forEach((e) => window.addEventListener(e, resetTimer));
    resetTimer();

    return () => {
      events.forEach((e) => window.removeEventListener(e, resetTimer));
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);
}
