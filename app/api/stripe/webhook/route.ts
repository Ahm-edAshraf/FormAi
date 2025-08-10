import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient as createSupabaseAdmin } from '@supabase/supabase-js'

const stripeSecretKey = process.env.STRIPE_SECRET_KEY
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const stripe = stripeSecretKey ? new Stripe(stripeSecretKey, { apiVersion: '2025-07-30.basil' as any }) : (null as any)

export async function POST(req: Request) {
  try {
    if (!stripe || !webhookSecret) return NextResponse.json({ error: 'Not configured' }, { status: 500 })
    if (!supabaseUrl || !serviceRoleKey) return NextResponse.json({ error: 'Supabase admin not configured' }, { status: 500 })

    const rawBody = await req.text()
    const sig = req.headers.get('stripe-signature') as string
    let event: any
    try {
      event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret)
    } catch (err: any) {
      return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 })
    }

    const supabaseAdmin = createSupabaseAdmin(supabaseUrl, serviceRoleKey)

    // Helpers
    const setPlan = async (userId: string, plan: 'free' | 'pro', fields?: Partial<{
      stripe_customer_id: string | null
      stripe_subscription_id: string | null
      plan_status: string | null
      subscription_status: string | null
      current_period_end: string | null
      cancel_at_period_end: boolean | null
    }>) => {
      const updates: Record<string, any> = { plan, ...(fields ?? {}) }
      await supabaseAdmin.from('profiles').update(updates).eq('user_id', userId)
    }

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as any
        const userId = (session.metadata?.user_id || session.client_reference_id) as string | undefined
        const customerId = session.customer as string | undefined
        const subscriptionId = session.subscription as string | undefined
        if (userId) {
          if (subscriptionId) {
            try {
              const sub = await stripe.subscriptions.retrieve(subscriptionId)
              const isActive = ['active', 'trialing', 'past_due'].includes((sub as any).status)
              await setPlan(userId, isActive ? 'pro' : 'free', {
                stripe_customer_id: customerId ?? null,
                stripe_subscription_id: (sub as any).id ?? null,
                plan_status: (sub as any).status ?? 'active',
                subscription_status: (sub as any).status ?? 'active',
                current_period_end: (sub as any).current_period_end ? new Date((sub as any).current_period_end * 1000).toISOString() : null,
                cancel_at_period_end: !!(sub as any).cancel_at_period_end,
              })
            } catch {
              await setPlan(userId, 'pro', {
                stripe_customer_id: customerId ?? null,
                stripe_subscription_id: subscriptionId ?? null,
                plan_status: 'active',
                subscription_status: 'active',
              })
            }
          } else {
            await setPlan(userId, 'pro', {
              stripe_customer_id: customerId ?? null,
              stripe_subscription_id: null,
              plan_status: 'active',
              subscription_status: 'active',
            })
          }
        }
        break
      }
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const sub = event.data.object as any
        const customerId = sub.customer as string
        // Find user by customer id
        const { data: profiles } = await supabaseAdmin
          .from('profiles')
          .select('user_id')
          .eq('stripe_customer_id', customerId)
        const userId = profiles && profiles.length ? (profiles[0] as any).user_id as string : undefined
        const fields = {
          stripe_subscription_id: sub.id,
          plan_status: sub.status,
          subscription_status: sub.status,
          current_period_end: sub.current_period_end ? new Date(sub.current_period_end * 1000).toISOString() : null,
          cancel_at_period_end: !!sub.cancel_at_period_end,
        }
        if (userId) {
          const isActive = sub.status === 'active' || sub.status === 'trialing' || sub.status === 'past_due'
          await setPlan(userId, isActive ? 'pro' : 'free', fields)
        }
        break
      }
      case 'invoice.paid': {
        // Could mark plan_status = 'active'
        const inv = event.data.object as any
        const customerId = inv.customer as string
        const { data: profiles } = await supabaseAdmin
          .from('profiles')
          .select('user_id')
          .eq('stripe_customer_id', customerId)
        const userId = profiles && profiles.length ? (profiles[0] as any).user_id as string : undefined
        if (userId) {
          await setPlan(userId, 'pro', { plan_status: 'active', subscription_status: 'active' })
        }
        break
      }
      case 'invoice.payment_failed': {
        const inv = event.data.object as any
        const customerId = inv.customer as string
        const { data: profiles } = await supabaseAdmin
          .from('profiles')
          .select('user_id')
          .eq('stripe_customer_id', customerId)
        const userId = profiles && profiles.length ? (profiles[0] as any).user_id as string : undefined
        if (userId) {
          await setPlan(userId, 'pro', { plan_status: 'past_due', subscription_status: 'past_due' })
        }
        break
      }
      default:
        break
    }

    return NextResponse.json({ received: true })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? 'Webhook error' }, { status: 500 })
  }
}

// Important: ensure Next.js uses the raw body for Stripe signature verification
export const config = {
  api: {
    bodyParser: false,
  },
}

export const runtime = 'nodejs'


