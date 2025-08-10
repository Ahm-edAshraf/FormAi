import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import Stripe from 'stripe'
import { createClient as createSupabaseServer } from '@/utils/supabase/server'

const stripeSecretKey = process.env.STRIPE_SECRET_KEY
const stripe = stripeSecretKey ? new Stripe(stripeSecretKey, { apiVersion: '2025-07-30.basil' as any }) : (null as any)

export async function GET() {
  try {
    if (!stripe) return NextResponse.json({ error: 'Stripe not configured', invoices: [] }, { status: 200 })
    const cookieStore = cookies()
    const supabase = createSupabaseServer(cookieStore)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: profile } = await supabase
      .from('profiles')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .single()
    const stripeCustomerId = (profile as any)?.stripe_customer_id as string | null | undefined
    if (!stripeCustomerId) return NextResponse.json({ invoices: [] })

    const invoices = await stripe.invoices.list({ customer: stripeCustomerId, limit: 12 })
    const items = invoices.data.map((inv: Stripe.Invoice) => ({
      id: inv.id,
      number: inv.number ?? inv.id,
      amount_due: inv.amount_due,
      amount_paid: inv.amount_paid,
      currency: inv.currency,
      status: inv.status,
      hosted_invoice_url: inv.hosted_invoice_url,
      created: inv.created ? new Date(inv.created * 1000).toISOString() : null,
      period_start: inv.period_start ? new Date(inv.period_start * 1000).toISOString() : null,
      period_end: inv.period_end ? new Date(inv.period_end * 1000).toISOString() : null,
    }))
    return NextResponse.json({ invoices: items })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? 'Invoices error' }, { status: 500 })
  }
}

export const runtime = 'nodejs'


