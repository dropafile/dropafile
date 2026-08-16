import type { ClientAttributes } from "@shared/types/session";

function parseBrowser(userAgent: string): string | null {
  if (!userAgent) {
    return null;
  }

  if (userAgent.includes("Edg/")) {
    return "Edge";
  }
  if (userAgent.includes("OPR/") || userAgent.includes("Opera")) {
    return "Opera";
  }
  if (userAgent.includes("Firefox/")) {
    return "Firefox";
  }
  if (userAgent.includes("Chrome/") && !userAgent.includes("Chromium")) {
    return "Chrome";
  }
  if (userAgent.includes("Safari/") && !userAgent.includes("Chrome/")) {
    return "Safari";
  }

  return null;
}

function parsePlatform(userAgent: string): string | null {
  if (!userAgent) {
    return null;
  }

  if (userAgent.includes("iPhone") || userAgent.includes("iPad")) {
    return "iOS";
  }
  if (userAgent.includes("Android")) {
    return "Android";
  }
  if (userAgent.includes("Mac OS X") || userAgent.includes("Macintosh")) {
    return "macOS";
  }
  if (userAgent.includes("Windows")) {
    return "Windows";
  }
  if (userAgent.includes("Linux")) {
    return "Linux";
  }

  return null;
}

export function extractClientAttributes(request: Request): ClientAttributes {
  const country =
    request.headers.get("CF-IPCountry") ??
    request.headers.get("cf-ipcountry");
  const language =
    request.headers.get("Accept-Language")?.split(",")[0]?.trim() ?? null;
  const userAgent = request.headers.get("User-Agent") ?? "";

  return {
    country: country && country !== "XX" ? country : null,
    browser: parseBrowser(userAgent),
    platform: parsePlatform(userAgent),
    language,
  };
}
