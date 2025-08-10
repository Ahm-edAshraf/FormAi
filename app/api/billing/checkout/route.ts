import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import Stripe from 'stripe'
import { createClient as createSupabaseServer } from '@/utils/supabase/server'

const stripeSecretKey = process.env.STRIPE_SECRET_KEY
const priceId = process.env.STRIPE_PRICE_PRO_MONTHLY

if (!stripeSecretKey) {
  // eslint-disable-next-line no-console
  console.warn('[billing/checkout] Missing STRIPE_SECRET_KEY')
}
if (!priceId) {
  // eslint-disable-next-line no-console
  console.warn('[billing/checkout] Missing STRIPE_PRICE_PRO_MONTHLY')
}

const stripe = stripeSecretKey ? new Stripe(stripeSecretKey, { apiVersion: '2025-07-30.basil' as any }) : (null as any)

export async function POST(request: Request) {
  try {
    if (!stripe || !priceId) {
      return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 })
    }

    const cookieStore = cookies()
    const supabase = createSupabaseServer(cookieStore)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Ensure we have a Stripe customer id on profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .single()

    let stripeCustomerId = (profile as any)?.stripe_customer_id as string | null | undefined
    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: user.email ?? undefined,
        metadata: { user_id: user.id },
      })
      stripeCustomerId = customer.id
      // Persist the customer id on profile
      await supabase
        .from('profiles')
        .update({ stripe_customer_id: stripeCustomerId })
        .eq('user_id', user.id)
    }

    const url = new URL(request.url)
    const origin = `${url.protocol}//${url.host}`

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: stripeCustomerId!,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${origin}/billing?success=1`,
      cancel_url: `${origin}/billing?canceled=1`,
      client_reference_id: user.id,
      metadata: { user_id: user.id },
    })

    return NextResponse.json({ url: session.url })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? 'Checkout error' }, { status: 500 })
  }
}

export const runtime = 'nodejs'


