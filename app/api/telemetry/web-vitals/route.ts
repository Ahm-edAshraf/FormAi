import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const payload = await request.json().catch(() => ({}))
    // eslint-disable-next-line no-console
    console.log('[web-vitals]', JSON.stringify(payload))
    return NextResponse.json({ ok: true })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? 'Telemetry error' }, { status: 500 })
  }
}


