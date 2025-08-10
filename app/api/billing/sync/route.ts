import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import Stripe from 'stripe'
import { createClient as createSupabaseServer } from '@/utils/supabase/server'

const stripeSecretKey = process.env.STRIPE_SECRET_KEY
const stripe = stripeSecretKey ? new Stripe(stripeSecretKey, { apiVersion: '2025-07-30.basil' as any }) : (null as any)

export async function POST() {
  try {
    if (!stripe) return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 })
    const cookieStore = cookies()
    const supabase = createSupabaseServer(cookieStore)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: profile } = await supabase
      .from('profiles')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .single()
    const customerId = (profile as any)?.stripe_customer_id as string | undefined
    if (!customerId) return NextResponse.json({ ok: true, updated: false })

    const subs = await stripe.subscriptions.list({ customer: customerId, status: 'all', limit: 1 })
    const sub = subs.data[0]
    if (!sub) return NextResponse.json({ ok: true, updated: false })

    const isActive = ['active', 'trialing', 'past_due'].includes(sub.status)
    const updates: any = {
      plan: isActive ? 'pro' : 'free',
      stripe_subscription_id: sub.id,
      plan_status: sub.status,
      current_period_end: sub.current_period_end ? new Date(sub.current_period_end * 1000).toISOString() : null,
      cancel_at_period_end: !!sub.cancel_at_period_end,
    }
    await supabase.from('profiles').update(updates).eq('user_id', user.id)
    return NextResponse.json({ ok: true, updated: true, status: sub.status })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? 'Sync error' }, { status: 500 })
  }
}

export const runtime = 'nodejs'


