type PublicEnvName =
  | "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY"
  | "NEXT_PUBLIC_CONVEX_URL";

function requirePublicEnv(
  value: string | undefined,
  name: PublicEnvName,
): string {
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

function requirePublicUrl(
  value: string | undefined,
  name: "NEXT_PUBLIC_CONVEX_URL",
): string {
  const resolvedValue = requirePublicEnv(value, name);

  try {
    new URL(resolvedValue);
  } catch {
    throw new Error(`Environment variable ${name} must be a valid URL.`);
  }

  return resolvedValue;
}

export const publicEnv = {
  clerkPublishableKey: requirePublicEnv(
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
    "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY",
  ),
  convexUrl: requirePublicUrl(
    process.env.NEXT_PUBLIC_CONVEX_URL,
    "NEXT_PUBLIC_CONVEX_URL",
  ),
} as const;

export type PublicEnv = typeof publicEnv;
