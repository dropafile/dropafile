import { useEffect, useState } from "react";
import { fetchHealth, type HealthStatus } from "@/api/health";
import type { AppEnvironment } from "@shared/utils/environment";

const POLL_INTERVAL_MS = 30_000;

export function useApiHealth() {
  const [status, setStatus] = useState<HealthStatus>("checking");
  const [environment, setEnvironment] = useState<AppEnvironment>("development");

  useEffect(() => {
    let cancelled = false;

    const check = async () => {
      const { data, error } = await fetchHealth();
      if (cancelled) {
        return;
      }

      if (data && !error) {
        setStatus("online");
        setEnvironment(data.environment);
        return;
      }

      setStatus("offline");
    };

    void check();
    const interval = setInterval(check, POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  return { status, environment };
}
