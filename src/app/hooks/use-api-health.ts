import { useEffect, useState } from "react";
import { fetchHealth, type HealthStatus } from "@/api/health";

const POLL_INTERVAL_MS = 30_000;

export function useApiHealth() {
  const [status, setStatus] = useState<HealthStatus>("checking");

  useEffect(() => {
    let cancelled = false;

    const check = async () => {
      const { data, error } = await fetchHealth();
      if (cancelled) return;
      setStatus(data && !error ? "online" : "offline");
    };

    void check();
    const interval = setInterval(check, POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  return status;
}
