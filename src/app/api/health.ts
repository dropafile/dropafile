import type { AppEnvironment } from "@shared/utils/environment";

export type HealthStatus = "checking" | "online" | "offline";

export type HealthData = {
  status: string;
  environment: AppEnvironment;
  timestamp: string;
};

type HealthResponse = {
  success: boolean;
  data?: HealthData;
};

export async function fetchHealth(): Promise<{
  data: HealthData | null;
  error: string | null;
}> {
  try {
    const response = await fetch("/health");
    const payload = (await response.json()) as HealthResponse;

    if (!response.ok || !payload.success || !payload.data) {
      return { data: null, error: "Health check failed" };
    }

    return { data: payload.data, error: null };
  } catch {
    return { data: null, error: "Health check failed" };
  }
}
