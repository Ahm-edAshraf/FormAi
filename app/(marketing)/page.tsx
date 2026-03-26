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
    <main className="relative min-h-screen overflow-hidden bg-[#050505] text-slate-200 selection:bg-indigo-500/30 font-sans">
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
      <section className="relative z-10 mx-auto max-w-7xl px-6 pb-20 pt-32 text-center animate-in fade-in slide-in-from-bottom-6 duration-700">
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
              Start building <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </span>
          </Link>
          <Link
            href="/#how-it-works"
            className="app-focus inline-flex h-14 items-center justify-center rounded-full border border-white/10 bg-white/5 px-8 text-base font-medium text-white backdrop-blur-md transition-colors hover:bg-white/10"
          >
            View demo
          </Link>
        </div>
      </section>

      {/* Interactive Terminal Showcase */}
      <section id="how-it-works" className="relative z-10 mx-auto max-w-5xl scroll-mt-28 px-6 pb-32 animate-in fade-in duration-1000">
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
      <section id="features" className="relative z-10 mx-auto max-w-7xl scroll-mt-28 border-t border-white/10 px-6 py-24 animate-in fade-in duration-1000">
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

      {/* Fair Use */}
      <section id="fair-use" className="relative z-10 mx-auto max-w-7xl scroll-mt-28 border-t border-white/10 px-6 py-24 animate-in fade-in duration-1000">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 tracking-tight">Simple, generous fair use</h2>
          <p className="text-slate-400 max-w-2xl mx-auto text-lg">
            No subscriptions, no paywall, no billing screen. FormAI stays open with generous AI limits designed to keep the experience fast and sustainable for everyone.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] max-w-5xl mx-auto">
          <div className="rounded-3xl border border-white/10 bg-[#0A0A0A] p-8">
            <div className="mb-8 flex items-center justify-between gap-4">
              <div>
                <h3 className="text-2xl font-semibold text-white">Everyone gets the same product</h3>
                <p className="mt-2 text-slate-400">
                  The limits are there to prevent abuse, not to upsell you into a paid plan.
                </p>
              </div>
              <div className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-sm font-medium text-emerald-300">
                No pricing tiers
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {[
                ["AI generations", "Up to 5 per user per day"],
                ["Workspace allowance", "Up to 20 AI generations per workspace per day"],
                ["Burst protection", "1 generation per minute per user"],
                ["Forms and responses", "No artificial billing tier limits in the app UI"],
              ].map(([label, value]) => (
                <div key={label} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                  <p className="text-xs font-mono uppercase tracking-wider text-slate-500">{label}</p>
                  <p className="mt-3 text-base font-medium text-white">{value}</p>
                </div>
              ))}
            </div>

            <p className="mt-6 text-sm leading-7 text-slate-400">
              The current AI path uses Groq structured outputs with conservative limits so the product can stay reliable without turning into a billing-heavy SaaS. If usage patterns change later, limits can be tuned without adding subscriptions.
            </p>
          </div>

          <div className="rounded-3xl border border-indigo-500/30 bg-gradient-to-b from-indigo-500/10 to-[#0A0A0A] p-8 relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-indigo-500 to-blue-500" />
            <h3 className="text-2xl font-semibold text-white mb-3">What this means in practice</h3>
            <ul className="space-y-4 text-slate-300">
              {[
                "You can prototype quickly without reaching for a checkout flow.",
                "Teams share one fair-use pool instead of plan management complexity.",
                "The product stays simple: sign in, generate, edit, publish, collect.",
                "If a limit is hit, the app should explain it clearly instead of trying to sell an upgrade.",
              ].map((item, index) => (
                <li key={index} className="flex items-start gap-3">
                  <div className="mt-1 h-5 w-5 rounded-full bg-indigo-500/20 flex items-center justify-center shrink-0">
                    <div className="h-1.5 w-1.5 rounded-full bg-indigo-400" />
                  </div>
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <div className="mt-8 rounded-2xl border border-white/10 bg-black/20 p-5">
              <p className="text-xs font-mono uppercase tracking-wider text-slate-500">Current policy</p>
              <p className="mt-3 text-sm leading-7 text-slate-300">
                FormAI is currently offered without a paid billing model. Access is governed by technical fair-use limits, service availability, and the legal policies linked below.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 bg-[#050505] px-6 pb-8 pt-16 animate-in fade-in duration-1000">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          <div className="col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="h-6 w-6 text-indigo-400" />
              <span className="font-bold text-xl text-white tracking-tight">FormAI</span>
            </div>
            <p className="text-slate-400 max-w-sm">
              The fastest way to generate, refine, publish, and analyze forms with AI-assisted structure and a clean builder workflow.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-4">Product</h4>
            <ul className="space-y-2 text-sm text-slate-500">
              <li><Link href="/#features" className="hover:text-white transition-colors">Features</Link></li>
              <li><Link href="/#how-it-works" className="hover:text-white transition-colors">How it works</Link></li>
              <li><Link href="/#fair-use" className="hover:text-white transition-colors">Fair use</Link></li>
              <li><Link href="/dashboard" className="hover:text-white transition-colors">Open app</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-slate-500">
              <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Use</Link></li>
              <li><Link href="/cookies" className="hover:text-white transition-colors">Cookie Policy</Link></li>
              <li><Link href="/data" className="hover:text-white transition-colors">Data & deletion</Link></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-slate-600">
            © 2026 FormAI. Operated by Ahmed Ashraf Yassen Aly.
          </p>
          <div className="flex gap-6 text-sm text-slate-500">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
            <Link href="/cookies" className="hover:text-white transition-colors">Cookies</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
