type PublicEnvName =
  | "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY"
  | "NEXT_PUBLIC_CONVEX_URL";

function readPublicEnv(name: PublicEnvName): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

function readPublicUrl(name: "NEXT_PUBLIC_CONVEX_URL"): string {
  const value = readPublicEnv(name);

  try {
    new URL(value);
  } catch {
    throw new Error(`Environment variable ${name} must be a valid URL.`);
  }

  return value;
}

export const publicEnv = {
  clerkPublishableKey: readPublicEnv("NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY"),
  convexUrl: readPublicUrl("NEXT_PUBLIC_CONVEX_URL"),
} as const;

export type PublicEnv = typeof publicEnv;
