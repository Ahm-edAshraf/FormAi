export function isConvexClientConfigured() {
  return Boolean(process.env.NEXT_PUBLIC_CONVEX_URL)
}

export function isConvexServerConfigured() {
  return Boolean(process.env.NEXT_PUBLIC_CONVEX_URL && process.env.CONVEX_DEPLOYMENT)
}
