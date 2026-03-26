import { ClerkProvider } from "@clerk/nextjs";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../../lib/env", () => ({
  publicEnv: {
    clerkPublishableKey: "pk_test_smoke",
    convexUrl: "https://example.convex.cloud",
  },
}));

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

import { ConvexClientProvider } from "../../components/providers/convex-client-provider";
import { publicEnv } from "../../lib/env";

describe("provider wiring", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders Clerk and Convex providers without crashing", () => {
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
