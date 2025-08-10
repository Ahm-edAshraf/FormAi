// Client-side Web Vitals reporter compatible with Next.js App Router
// Usage: export function reportWebVitals(metric: NextWebVitalsMetric) {}
import type { NextWebVitalsMetric } from 'next/app'

export function reportWebVitals(metric: NextWebVitalsMetric) {
  try {
    // Send to an internal endpoint for collection, or log for now
    if (typeof navigator.sendBeacon === 'function') {
      const body = JSON.stringify(metric)
      navigator.sendBeacon('/api/telemetry/web-vitals', body)
    } else {
      fetch('/api/telemetry/web-vitals', {
        method: 'POST',
        keepalive: true,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(metric),
      }).catch(() => {})
    }
  } catch {
    // noop
  }
}


