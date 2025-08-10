// Minimal server-side instrumentation: wraps global fetch to record timings
// and logs them via Server-Timing-style console entries for now.

export async function register() {
  if ((globalThis as any).__fetch_instrumented) return
  ;(globalThis as any).__fetch_instrumented = true

  // Avoid overriding fetch on Edge runtime to prevent incompatibilities
  const isNode = typeof process !== 'undefined' && typeof (process as any).hrtime === 'function'
  if (!isNode) return

  const originalFetch = globalThis.fetch
  globalThis.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    try {
      const start = (process as any).hrtime.bigint()
      let ok = false
      let status = 0
      let url = ''
      try {
        const res = await originalFetch(input as any, init)
        ok = res.ok
        status = res.status
        url = typeof input === 'string' ? input : (input as any)?.url ?? ''
        return res
      } finally {
        const end = (process as any).hrtime.bigint()
        const durMs = Number(end - start) / 1_000_000
        // eslint-disable-next-line no-console
        console.log('[fetch]', JSON.stringify({ url, status, ok, durMs: Math.round(durMs * 100) / 100 }))
      }
    } catch {
      // Fallback to original fetch on any error
      return originalFetch(input as any, init)
    }
  }
}


