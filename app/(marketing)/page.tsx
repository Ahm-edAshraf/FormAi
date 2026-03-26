import { ArrowRight, Blocks, Shield, Sparkles, Terminal, Zap } from "lucide-react";
import Link from "next/link";

import { MarketingHeader } from "./marketing-header";

const features = [
  {
    icon: <Sparkles className="h-5 w-5 text-indigo-400" />,
    title: "Natural Language Generation",
    description: "Describe your ideal form in plain English. Our AI understands context, constraints, and edge cases to build the perfect structure.",
  },
  {
    icon: <Shield className="h-5 w-5 text-emerald-400" />,
    title: "Strict Schema Enforcement",
    description: "No hallucinations. The AI output is strictly bound to a predefined schema, ensuring every generated form is immediately usable.",
  },
  {
    icon: <Blocks className="h-5 w-5 text-blue-400" />,
    title: "Immutable Snapshots",
    description: "Publish with confidence. Live forms are frozen in time, allowing you to iterate on drafts without breaking production.",
  },
];

export default function MarketingPage() {
  return (
    <main className="relative min-h-screen bg-[#050505] text-slate-200 selection:bg-indigo-500/30 overflow-hidden font-sans">
      {/* Background Effects */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-600/20 blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-600/20 blur-[120px]" />
        <div className="absolute top-[40%] left-[60%] w-[30%] h-[30%] rounded-full bg-emerald-600/10 blur-[100px]" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_10%,transparent_100%)]" />
      </div>

      <MarketingHeader />

      {/* Hero Section */}
      <section className="relative z-10 pt-32 pb-20 px-6 max-w-7xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-sm text-indigo-300 mb-8 backdrop-blur-md">
          <Zap className="h-4 w-4" />
          <span>FormAI v2.0 is now live</span>
        </div>
        
        <h1 className="max-w-5xl mx-auto text-5xl md:text-7xl lg:text-8xl font-bold tracking-tighter leading-[1.1] text-white mb-8">
          The intelligence of AI. <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-blue-400 to-emerald-400">
            The precision of code.
          </span>
        </h1>
        
        <p className="max-w-2xl mx-auto text-lg md:text-xl text-slate-400 mb-12 leading-relaxed">
          Turn a rough prompt into a live form system that already makes sense. 
          Generate clean drafts, refine fields, and publish immutable snapshots in seconds.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link 
            href="/dashboard" 
            className="group relative inline-flex h-14 items-center justify-center overflow-hidden rounded-full bg-gradient-to-r from-indigo-500 to-blue-600 px-8 text-base font-medium text-white transition-all hover:scale-105 hover:shadow-[0_0_40px_rgba(99,102,241,0.4)]"
          >
            <span className="relative z-10 flex items-center gap-2">
              Start building for free <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </span>
          </Link>
          <Link
            href="#how-it-works"
            className="app-focus inline-flex h-14 items-center justify-center rounded-full border border-white/10 bg-white/5 px-8 text-base font-medium text-white backdrop-blur-md transition-colors hover:bg-white/10"
          >
            View demo
          </Link>
        </div>
      </section>

      {/* Interactive Terminal Showcase */}
      <section id="how-it-works" className="relative z-10 max-w-5xl mx-auto px-6 pb-32">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 tracking-tight">How it works</h2>
          <p className="text-slate-400 max-w-2xl mx-auto text-lg">
            From prompt to production in three simple steps.
          </p>
        </div>
        <div className="relative rounded-2xl border border-white/10 bg-[#0A0A0A]/80 backdrop-blur-2xl shadow-2xl overflow-hidden">
          {/* Terminal Header */}
          <div className="flex items-center px-4 py-3 border-b border-white/10 bg-white/[0.02]">
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500/80" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
              <div className="w-3 h-3 rounded-full bg-green-500/80" />
            </div>
            <div className="mx-auto flex items-center gap-2 text-xs text-slate-500 font-mono">
              <Terminal className="h-3 w-3" />
              <span>form-ai-generation.ts</span>
            </div>
          </div>
          
          {/* Terminal Body */}
          <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-white/10">
            <div className="p-6 md:p-8 space-y-6">
              <div>
                <p className="text-xs font-mono text-indigo-400 mb-2 uppercase tracking-wider">Step 1: Input Prompt</p>
                <div className="p-4 rounded-xl bg-white/5 border border-white/5 text-sm text-slate-300 leading-relaxed">
                  &quot;I need a feedback form for our new SaaS product. Ask for their role, what they liked most, what was confusing, and a 1-10 rating of the overall experience.&quot;
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-500 font-mono">
                <div className="h-px flex-1 bg-white/10" />
                <span>Processing via Groq</span>
                <div className="h-px flex-1 bg-white/10" />
              </div>
              <div>
                <p className="text-xs font-mono text-emerald-400 mb-2 uppercase tracking-wider">Step 2: Generated Schema</p>
                <pre className="p-4 rounded-xl bg-black/50 border border-white/5 text-xs text-emerald-300/80 font-mono overflow-x-auto">
                  <code>{`{
  "title": "SaaS Product Feedback",
  "fields": [
    {
      "type": "select",
      "label": "What is your role?",
      "options": ["Developer", "Designer", "Manager"]
    },
    {
      "type": "textarea",
      "label": "What did you like most?"
    },
    {
      "type": "rating",
      "label": "Overall Experience (1-10)",
      "required": true
    }
  ]
}`}</code>
                </pre>
              </div>
            </div>
            
            <div className="p-6 md:p-8 bg-gradient-to-br from-indigo-500/5 to-blue-500/5">
              <p className="text-xs font-mono text-blue-400 mb-6 uppercase tracking-wider">Step 3: Live Preview</p>
              <div className="space-y-5 bg-[#0F0F11] border border-white/10 rounded-xl p-6 shadow-xl">
                <div>
                  <h3 className="text-lg font-medium text-white mb-1">SaaS Product Feedback</h3>
                  <p className="text-sm text-slate-400">Help us improve our new product.</p>
                </div>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">What is your role?</label>
                    <div className="h-10 rounded-lg border border-white/10 bg-white/5 flex items-center px-3 text-sm text-slate-400">
                      Select an option...
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">What did you like most?</label>
                    <div className="h-24 rounded-lg border border-white/10 bg-white/5 p-3 text-sm text-slate-400">
                      Type your answer here...
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300 flex items-center gap-1">
                      Overall Experience <span className="text-red-400">*</span>
                    </label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="w-8 h-8 rounded-md border border-white/10 bg-white/5 flex items-center justify-center text-xs text-slate-400">
                          {i}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                <button className="w-full h-10 rounded-lg bg-white text-black font-medium text-sm mt-4">
                  Submit Feedback
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="relative z-10 py-24 px-6 max-w-7xl mx-auto border-t border-white/10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 tracking-tight">Built for modern teams</h2>
          <p className="text-slate-400 max-w-2xl mx-auto text-lg">
            Everything you need to create, publish, and analyze forms, without the bloat.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {features.map((feature, idx) => (
            <div key={idx} className="group relative p-8 rounded-3xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-colors">
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
                <p className="text-slate-400 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="relative z-10 py-24 px-6 max-w-7xl mx-auto border-t border-white/10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 tracking-tight">Simple, transparent pricing</h2>
          <p className="text-slate-400 max-w-2xl mx-auto text-lg">
            Start for free, upgrade when you need more power.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Free Tier */}
          <div className="rounded-3xl border border-white/10 bg-[#0A0A0A] p-8 flex flex-col">
            <h3 className="text-2xl font-semibold text-white mb-2">Hobby</h3>
            <p className="text-slate-400 mb-6">Perfect for side projects and testing.</p>
            <div className="mb-8">
              <span className="text-5xl font-bold text-white">$0</span>
              <span className="text-slate-500">/month</span>
            </div>
            <ul className="space-y-4 mb-8 flex-1">
              {['Up to 3 forms', '100 responses/month', 'Basic AI generation', 'Standard support'].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-slate-300">
                  <div className="h-5 w-5 rounded-full bg-indigo-500/20 flex items-center justify-center">
                    <div className="h-1.5 w-1.5 rounded-full bg-indigo-400" />
                  </div>
                  {item}
                </li>
              ))}
            </ul>
            <Link href="/sign-up" className="w-full py-4 rounded-xl border border-white/10 bg-white/5 text-center font-medium text-white hover:bg-white/10 transition-colors">
              Get Started
            </Link>
          </div>

          {/* Pro Tier */}
          <div className="rounded-3xl border border-indigo-500/50 bg-gradient-to-b from-indigo-500/10 to-[#0A0A0A] p-8 flex flex-col relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-indigo-500 to-blue-500" />
            <div className="absolute top-6 right-6 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-medium border border-indigo-500/30">
              Most Popular
            </div>
            <h3 className="text-2xl font-semibold text-white mb-2">Pro</h3>
            <p className="text-slate-400 mb-6">For teams that need scale and power.</p>
            <div className="mb-8">
              <span className="text-5xl font-bold text-white">$29</span>
              <span className="text-slate-500">/month</span>
            </div>
            <ul className="space-y-4 mb-8 flex-1">
              {['Unlimited forms', '10,000 responses/month', 'Advanced AI models', 'Priority support', 'Custom domains', 'Team workspaces'].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-slate-300">
                  <div className="h-5 w-5 rounded-full bg-indigo-500/20 flex items-center justify-center">
                    <div className="h-1.5 w-1.5 rounded-full bg-indigo-400" />
                  </div>
                  {item}
                </li>
              ))}
            </ul>
            <Link href="/sign-up" className="w-full py-4 rounded-xl bg-white text-black text-center font-medium hover:scale-[1.02] transition-transform shadow-[0_0_20px_rgba(255,255,255,0.1)]">
              Upgrade to Pro
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 bg-[#050505] pt-16 pb-8 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          <div className="col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="h-6 w-6 text-indigo-400" />
              <span className="font-bold text-xl text-white tracking-tight">FormAI</span>
            </div>
            <p className="text-slate-400 max-w-sm">
              The fastest way to build, publish, and analyze forms using the power of artificial intelligence.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-4">Product</h4>
            <ul className="space-y-2 text-sm text-slate-500">
              <li><Link href="#features" className="hover:text-white transition-colors">Features</Link></li>
              <li><Link href="#pricing" className="hover:text-white transition-colors">Pricing</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Changelog</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Documentation</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-slate-500">
              <li><Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Terms of Service</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Cookie Policy</Link></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-slate-600">
            © 2026 FormAI Inc. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm text-slate-500">
            <Link href="#" className="hover:text-white transition-colors">Twitter</Link>
            <Link href="#" className="hover:text-white transition-colors">GitHub</Link>
            <Link href="#" className="hover:text-white transition-colors">Discord</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
