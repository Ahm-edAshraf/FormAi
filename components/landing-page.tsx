'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Sparkles, Zap, BarChart3, Shield, ArrowRight, Check, Star } from 'lucide-react'
import dynamic from 'next/dynamic'
const AuthModal = dynamic(() => import('@/components/auth-modal').then(m => m.AuthModal), { ssr: false })
const AIDemo = dynamic(() => import('@/components/ai-demo').then(m => m.AIDemo), { ssr: false })
import { useToast } from '@/hooks/use-toast'
import { useIsMobile } from '@/hooks/use-mobile'

export function LandingPage() {
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signup')
  const [demoKey, setDemoKey] = useState(0)
  const { toast } = useToast()
  const isMobile = useIsMobile()

  useEffect(() => {
    if (!isMobile) return
    const KEY = 'formai:desktop-suggest-toast'
    try {
      if (typeof sessionStorage !== 'undefined' && !sessionStorage.getItem(KEY)) {
        toast({
          title: 'Best on desktop',
          description: 'Form editing works best on a computer. For building/editing forms, switch to a desktop/laptop for a better experience.',
        })
        sessionStorage.setItem(KEY, '1')
      }
    } catch {}
  }, [isMobile, toast])

  const features = [
    {
      icon: Sparkles,
      title: 'AI-Powered Generation',
      description: 'Describe your form in plain English and watch AI create it instantly'
    },
    {
      icon: Zap,
      title: 'Lightning Fast',
      description: 'Generate complex forms in seconds, not hours'
    },
    {
      icon: BarChart3,
      title: 'Advanced Analytics',
      description: 'Track submissions, conversion rates, and user behavior'
    },
    {
      icon: Shield,
      title: 'Enterprise Security',
      description: 'Bank-level encryption and GDPR compliance built-in'
    }
  ]

  const pricingPlans = [
    {
      name: 'Free',
      price: '$0',
      description: 'Perfect for getting started',
      features: [
        '3 AI-generated forms',
        '100 submissions/month',
        'Basic analytics',
        'Email support'
      ],
      popular: false
    },
    {
      name: 'Pro',
      price: '$5',
      description: 'For growing businesses',
      features: [
        'Everything in Free',
        'Unlimited forms and submissions'
      ],
      popular: true
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Navigation */}
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="fixed top-0 w-full z-50 bg-black/20 backdrop-blur-xl border-b border-white/10"
      >
        <div className="container mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
          <motion.div 
            className="flex items-center space-x-2"
            whileHover={{ scale: 1.05 }}
          >
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              FormAI
            </span>
          </motion.div>
          
          <div className="flex items-center space-x-2 md:space-x-4">
            <Button 
              variant="ghost" 
              className=""
              onClick={() => {
                setAuthMode('signin')
                setShowAuthModal(true)
              }}
            >
              Sign In
            </Button>
            <Button 
              className="glow-effect bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              onClick={() => {
                setAuthMode('signup')
                setShowAuthModal(true)
              }}
            >
              Get Started
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="pt-28 md:pt-32 pb-16 md:pb-20 px-4 md:px-6">
        <div className="container mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Badge className="mb-6 bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-300 border-blue-500/30">
              <Star className="w-3 h-3 mr-1" />
              AI-Powered Form Builder
            </Badge>
            
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent leading-tight">
              Build Forms
              <br />
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                With AI Magic
              </span>
            </h1>
            
            <p className="text-xl text-slate-300 mb-12 max-w-3xl mx-auto leading-relaxed">
              Describe your form in plain English and watch our AI create beautiful, 
              functional forms instantly. No coding required, just pure magic.
            </p>
          </motion.div>

          {/* AI Demo Section */}
           <div className="mb-10 md:mb-16">
            <AIDemo key={demoKey} />
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center items-center"
          >
             <Button 
              size="lg"
              className="glow-effect bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg px-8 py-6"
              onClick={() => {
                setAuthMode('signup')
                setShowAuthModal(true)
              }}
            >
              Start Building for Free
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-white/20 hover:border-white/40 text-lg px-8 py-6 w-full sm:w-auto"
              onClick={() => setDemoKey((k) => k + 1)}
            >
              Watch Demo
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-20 px-4 md:px-6">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
              Why Choose FormAI?
            </h2>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              Experience the future of form building with cutting-edge AI technology
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="card-tilt bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-slate-700/50 hover:border-blue-500/50 transition-all duration-300">
                  <CardHeader>
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mb-4">
                      <feature.icon className="w-6 h-6 text-white" />
                    </div>
                    <CardTitle className="text-white">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-slate-400">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-16 md:py-20 px-4 md:px-6">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              Start free, upgrade when you need more power
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 max-w-4xl mx-auto">
            {pricingPlans.map((plan, index) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
              >
                <Card className={`${
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
                    <CardTitle className="text-2xl text-white">{plan.name}</CardTitle>
                    <div className="text-4xl font-bold text-white mb-2">
                      {plan.price}
                      <span className="text-lg text-slate-400">/month</span>
                    </div>
                    <CardDescription className="text-slate-400">
                      {plan.description}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent>
                    <ul className="space-y-3 mb-8">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-center text-slate-300">
                          <Check className="w-5 h-5 text-green-400 mr-3" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    
                      <Button 
                        className={`w-full ${
                        plan.popular
                          ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'
                          : 'bg-slate-700 hover:bg-slate-600'
                      }`}
                      onClick={() => {
                        setAuthMode('signup')
                        setShowAuthModal(true)
                      }}
                    >
                      Get Started
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <AuthModal 
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        mode={authMode}
        onModeChange={setAuthMode}
      />
    </div>
  )
}
