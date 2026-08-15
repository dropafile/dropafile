export type HealthStatus = "checking" | "online" | "offline";

type HealthResponse = {
  success: boolean;
  data?: {
    status: string;
    timestamp: string;
  };
};

export async function fetchHealth(): Promise<{
  data: { status: string; timestamp: string } | null;
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
