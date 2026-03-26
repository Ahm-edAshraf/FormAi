export function getInternalServerSecret() {
  return process.env.FORMAI_INTERNAL_SERVER_SECRET ?? process.env.CLERK_SECRET_KEY ?? 'formai-dev-server-secret'
}
