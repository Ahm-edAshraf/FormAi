import { ClerkProvider } from "@clerk/nextjs";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@clerk/nextjs", async () => {
  return {
    ClerkProvider: ({ children }: { children: React.ReactNode }) => children,
    useAuth: () => ({
      isLoaded: true,
      isSignedIn: false,
      getToken: vi.fn(async () => null),
      orgId: null,
      orgRole: null,
      sessionClaims: null,
    }),
  };
});

describe("provider wiring", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = "pk_test_smoke";
    process.env.NEXT_PUBLIC_CONVEX_URL = "https://example.convex.cloud";
  });

  it("renders Clerk and Convex providers without crashing", async () => {
    const [{ ConvexClientProvider }, { publicEnv }] = await Promise.all([
      import("../../components/providers/convex-client-provider"),
      import("../../lib/env"),
    ]);

    render(
      <ClerkProvider publishableKey={publicEnv.clerkPublishableKey}>
        <ConvexClientProvider>
          <div>provider smoke ready</div>
        </ConvexClientProvider>
      </ClerkProvider>,
    );

    expect(screen.getByText("provider smoke ready")).toBeTruthy();
  });
});
