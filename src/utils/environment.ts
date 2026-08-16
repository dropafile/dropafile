export type AppEnvironment = "development" | "staging" | "production";

export function resolveEnvironment(value?: string): AppEnvironment {
  if (value === "production" || value === "staging") {
    return value;
  }

  return "development";
}

export function isProductionEnvironment(value?: string): boolean {
  return resolveEnvironment(value) === "production";
}
