'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Crown, Check, ArrowLeft, Download, Calendar, Sparkles, Zap } from 'lucide-react'
import { createClient as createSupabaseBrowser } from '@/utils/supabase/client'
import { MobileNav } from '@/components/mobile-nav'

export function BillingPortal() {
  const [currentPlan, setCurrentPlan] = useState<'free' | 'pro'>('free')
  const [invoices, setInvoices] = useState<any[]>([])

  useEffect(() => {
    ;(async () => {
      const supabase = createSupabaseBrowser()
      const { data: userData } = await supabase.auth.getUser()
      const userId = userData?.user?.id
      if (!userId) return
      // If returning from checkout (success=1), attempt a background sync to pull latest subscription status
      try {
        const url = new URL(window.location.href)
        if (url.searchParams.get('success') === '1') {
          await fetch('/api/billing/sync', { method: 'POST' })
        }
      } catch {}
      const { data: profile } = await supabase.from('profiles').select('plan').eq('user_id', userId).single()
      setCurrentPlan((profile?.plan === 'pro' ? 'pro' : 'free'))
      // Load invoices from billing endpoint
      try {
        const res = await fetch('/api/billing/invoices')
        const body = await res.json().catch(() => ({}))
        setInvoices(Array.isArray(body.invoices) ? body.invoices : [])
      } catch {}
    })()
  }, [])

  const plans = [
    {
      id: 'free',
      name: 'Free',
      price: '$0',
      description: 'Perfect for getting started',
      features: [
        '3 AI-generated forms',
        '100 submissions/month',
        'Basic analytics',
        'Email support'
      ],
      popular: false,
      current: currentPlan === 'free'
    },
    {
      id: 'pro',
      name: 'Pro',
      price: '$5',
      description: 'For growing businesses',
      features: [
        'Everything in Free',
        'Unlimited forms and submissions',
      ],
      popular: true,
      current: currentPlan === 'pro'
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 'Custom',
      description: 'For large organizations',
      features: [
        'Everything in Pro',
        'Custom AI models',
        'Dedicated support',
        'SLA guarantee',
        'Advanced security',
        'Custom integrations',
        'Training & onboarding'
      ],
      popular: false,
      current: false
    }
  ]

  // invoices now driven by state (empty until integrated with billing provider)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <div className="border-b border-slate-800 bg-black/20 backdrop-blur-xl">
          <div className="container mx-auto px-4 md:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <a href="/dashboard" className="text-white inline-flex items-center text-sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </a>
              
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-white">Billing & Subscription</h1>
                  <p className="text-sm text-slate-400">Manage your plan and billing</p>
            </div>
            <div className="sm:hidden"><MobileNav /></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* Current Plan Status */}
        <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-slate-700/50 mb-8">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Crown className="w-5 h-5 text-yellow-500" />
              Current Plan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold text-white mb-2">
                  {currentPlan === 'free' ? 'Free Plan' : 'Pro Plan'}
                </h3>
                <p className="text-slate-400 mb-4">
                  {currentPlan === 'free' 
                    ? 'You are currently on the free plan' 
                    : 'Next billing date: February 1, 2024'
                  }
                </p>
                <div className="flex items-center gap-4">
                  <Badge className="bg-gradient-to-r from-green-500/20 to-blue-500/20 text-green-300 border-green-500/30">
                    Active
                  </Badge>
                  {currentPlan === 'pro' && (
                    <span className="text-slate-300">$5.00/month</span>
                  )}
                </div>
              </div>
              
              {currentPlan === 'free' ? (
                <Button className="glow-effect bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700" onClick={async () => {
                  try {
                    const res = await fetch('/api/billing/checkout', { method: 'POST' })
                    const body = await res.json()
                    if (!res.ok) throw new Error(body.error || 'Checkout failed')
                    if (body.url) window.location.href = body.url
                  } catch (err) {
                    console.error(err)
                  }
                }}>
                  <Crown className="w-4 h-4 mr-2" />
                  Upgrade to Pro
                </Button>
              ) : (
                <Button variant="outline" className="border-slate-600 text-white" onClick={async () => {
                  try {
                    const res = await fetch('/api/billing/portal', { method: 'POST' })
                    const body = await res.json()
                    if (!res.ok) throw new Error(body.error || 'Portal failed')
                    if (body.url) window.location.href = body.url
                  } catch (err) {
                    console.error(err)
                  }
                }}>
                  Manage Subscription
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="plans" className="space-y-6">
          <TabsList className="bg-slate-800 border-slate-700">
            <TabsTrigger value="plans" className="text-white">Plans</TabsTrigger>
            <TabsTrigger value="billing" className="text-white">Billing History</TabsTrigger>
            <TabsTrigger value="payment" className="text-white">Payment Methods</TabsTrigger>
          </TabsList>

          <TabsContent value="plans">
            <div className="grid md:grid-cols-3 gap-6">
              {plans.map((plan, index) => (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className={`relative h-full ${
                    plan.popular 
                      ? 'bg-gradient-to-br from-blue-900/50 to-purple-900/50 border-blue-500/50 glow-effect' 
                      : 'bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-slate-700/50'
                  }`}>
                    {plan.popular && (
                      <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                        <Badge className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                          Most Popular
                        </Badge>
                      </div>
                    )}
                    
                    <CardHeader className="text-center">
                      <div className="flex items-center justify-center mb-2">
                        {plan.id === 'pro' && <Crown className="w-6 h-6 text-yellow-500 mr-2" />}
                        {plan.id === 'enterprise' && <Zap className="w-6 h-6 text-purple-500 mr-2" />}
                        <CardTitle className="text-2xl text-white">{plan.name}</CardTitle>
                      </div>
                      <div className="text-4xl font-bold text-white mb-2">
                        {plan.price}
                        {plan.price !== 'Custom' && <span className="text-lg text-slate-400">/month</span>}
                      </div>
                      <p className="text-slate-400">{plan.description}</p>
                    </CardHeader>
                    
                    <CardContent className="flex-1">
                      <ul className="space-y-3 mb-8">
                        {plan.features.map((feature) => (
                          <li key={feature} className="flex items-center text-slate-300">
                            <Check className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                      
                      <Button 
                        className={`w-full ${
                          plan.current
                            ? 'bg-slate-700 cursor-not-allowed'
                            : plan.popular
                            ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'
                            : 'bg-slate-700 hover:bg-slate-600'
                        }`}
                        disabled={plan.current}
                        onClick={async () => {
                          if (plan.current) return
                          if (plan.id === 'pro') {
                            try {
                              const res = await fetch('/api/billing/checkout', { method: 'POST' })
                              const body = await res.json()
                              if (!res.ok) throw new Error(body.error || 'Checkout failed')
                              if (body.url) window.location.href = body.url
                            } catch (err) {
                              console.error(err)
                            }
                          }
                        }}
                      >
                        {plan.current ? 'Current Plan' : plan.id === 'enterprise' ? 'Contact Sales' : 'Upgrade'}
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="billing">
            <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-slate-700/50">
              <CardHeader>
                <CardTitle className="text-white">Billing History</CardTitle>
              </CardHeader>
              <CardContent>
                {invoices.length === 0 ? (
                  <div className="rounded-lg border border-slate-700 p-6 text-slate-400">
                    No invoices yet.
                  </div>
                ) : (
                  <div className="rounded-lg border border-slate-700 overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-slate-700 hover:bg-slate-800/50">
                          <TableHead className="text-slate-300">Invoice</TableHead>
                          <TableHead className="text-slate-300">Date</TableHead>
                          <TableHead className="text-slate-300">Amount</TableHead>
                          <TableHead className="text-slate-300">Status</TableHead>
                          <TableHead className="text-slate-300 w-12"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {invoices.map((invoice: any) => (
                          <TableRow key={invoice.id} className="border-slate-700 hover:bg-slate-800/30">
                            <TableCell className="text-white font-medium">{invoice.number || invoice.id}</TableCell>
                            <TableCell className="text-slate-300">{invoice.created ? new Date(invoice.created).toLocaleDateString() : ''}</TableCell>
                            <TableCell className="text-white font-medium">{`$${(invoice.amount_paid ?? invoice.amount_due ?? 0) / 100}`}</TableCell>
                            <TableCell>
                              <Badge variant="default" className="bg-green-500/20 text-green-300 border-green-500/30">{invoice.status}</Badge>
                            </TableCell>
                            <TableCell>
                              {invoice.hosted_invoice_url ? (
                                <Button asChild variant="ghost" size="sm" className="h-8 w-8 p-0">
                                  <a href={invoice.hosted_invoice_url} target="_blank" rel="noreferrer">
                                    <Download className="h-4 w-4" />
                                  </a>
                                </Button>
                              ) : null}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payment">
            <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-slate-700/50">
              <CardHeader>
                <CardTitle className="text-white">Payment Methods</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg border border-slate-700 p-6 text-slate-400">
                  Payment methods are managed in the subscription portal.
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
