import { SignUp } from "@clerk/nextjs";
import { Sparkles } from "lucide-react";
import Link from "next/link";

export default function SignUpPage() {
  return (
    <main className="min-h-screen bg-[#050505] flex flex-col font-sans relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-600/10 blur-[120px]" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-600/10 blur-[120px]" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6 relative z-10">
        <Link href="/" className="flex items-center gap-2 mb-8 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-b from-indigo-500 to-blue-600 shadow-[0_0_20px_rgba(99,102,241,0.4)] group-hover:scale-105 transition-transform">
            <div className="absolute inset-[1px] rounded-[11px] bg-[#050505] flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-indigo-400" />
            </div>
          </div>
          <span className="font-bold text-2xl tracking-tight text-white">FormAI</span>
        </Link>

        <div className="w-full max-w-md animate-in fade-in zoom-in-95 duration-500">
          <SignUp 
            forceRedirectUrl="/dashboard"
            fallbackRedirectUrl="/dashboard"
            signInForceRedirectUrl="/dashboard"
            appearance={{
              elements: {
                rootBox: "w-full",
                card: "bg-[#0A0A0A] border border-white/10 shadow-2xl rounded-3xl w-full",
                headerTitle: "text-white text-xl",
                headerSubtitle: "text-slate-400",
                socialButtonsBlockButton: "bg-white/5 border-white/10 hover:bg-white/10 text-white transition-colors",
                socialButtonsBlockButtonText: "text-white font-medium",
                dividerLine: "bg-white/10",
                dividerText: "text-slate-500",
                formFieldLabel: "text-slate-300",
                formFieldInput: "bg-white/5 border-white/10 text-white focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 rounded-xl transition-all",
                formButtonPrimary: "bg-white text-black hover:bg-slate-200 transition-colors rounded-xl h-10 font-medium",
                footerActionText: "text-slate-400",
                footerActionLink: "text-indigo-400 hover:text-indigo-300",
                identityPreviewText: "text-white",
                identityPreviewEditButtonIcon: "text-indigo-400",
                formFieldAction: "text-indigo-400 hover:text-indigo-300",
              }
            }}
          />
        </div>
      </div>
    </main>
  );
}
