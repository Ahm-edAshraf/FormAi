import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import Stripe from 'stripe'
import { createClient as createSupabaseServer } from '@/utils/supabase/server'

const stripeSecretKey = process.env.STRIPE_SECRET_KEY
const stripe = stripeSecretKey ? new Stripe(stripeSecretKey, { apiVersion: '2025-07-30.basil' as any }) : (null as any)

export async function POST(request: Request) {
  try {
    if (!stripe) return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 })
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const cookieStore = cookies()
    const supabase = createSupabaseServer(cookieStore)

    const { data: profile } = await supabase
      .from('profiles')
      .select('stripe_customer_id')
      .eq('user_id', userId)
      .single()
    const stripeCustomerId = (profile as any)?.stripe_customer_id as string | null | undefined
    if (!stripeCustomerId) return NextResponse.json({ error: 'No Stripe customer' }, { status: 400 })

    const url = new URL(request.url)
    const origin = `${url.protocol}//${url.host}`

    // Ensure a default configuration exists in Stripe Dashboard for test mode
    const session = await stripe.billingPortal.sessions.create({
      customer: stripeCustomerId,
      return_url: `${origin}/billing`,
    })
    return NextResponse.json({ url: session.url })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? 'Portal error' }, { status: 500 })
  }
}

export const runtime = 'nodejs'

