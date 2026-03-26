"use client";

import { CheckCircle2 } from "lucide-react";
import { useState } from "react";

export default function PublicFormPage() {
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (isSubmitted) {
    return (
      <main className="min-h-screen bg-[#050505] flex items-center justify-center p-6 font-sans">
        <div className="max-w-md w-full text-center space-y-6 animate-in zoom-in-95 duration-500">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-4">
            <CheckCircle2 className="w-10 h-10 text-emerald-400" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Thank you!</h1>
          <p className="text-slate-400">Your response has been successfully submitted.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#050505] py-12 px-4 sm:px-6 lg:px-8 font-sans selection:bg-indigo-500/30">
      <div className="max-w-2xl mx-auto">
        {/* Form Header */}
        <div className="mb-10 space-y-4">
          <h1 className="text-4xl font-bold text-white tracking-tight">Customer Research Intake</h1>
          <p className="text-lg text-slate-400">Help us understand your workflow better so we can build the right features for you.</p>
        </div>

        {/* Form Body */}
        <form 
          onSubmit={(e) => { e.preventDefault(); setIsSubmitted(true); }}
          className="space-y-8 bg-[#0A0A0A] p-8 sm:p-10 rounded-3xl border border-white/10 shadow-2xl"
        >
          {/* Field 1 */}
          <div className="space-y-3 group">
            <label className="block text-sm font-medium text-slate-200 group-focus-within:text-indigo-400 transition-colors">
              What is your role? <span className="text-red-400">*</span>
            </label>
            <select className="w-full h-12 rounded-xl border border-white/10 bg-white/5 px-4 text-white focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 focus:outline-none transition-all appearance-none">
              <option value="" disabled selected>Select an option...</option>
              <option value="engineer">Software Engineer</option>
              <option value="designer">Product Designer</option>
              <option value="pm">Product Manager</option>
              <option value="founder">Founder / Executive</option>
            </select>
          </div>

          {/* Field 2 */}
          <div className="space-y-3 group">
            <label className="block text-sm font-medium text-slate-200 group-focus-within:text-indigo-400 transition-colors">
              What did you like most about the current product?
            </label>
            <textarea 
              rows={4}
              placeholder="Type your answer here..."
              className="w-full rounded-xl border border-white/10 bg-white/5 p-4 text-white placeholder:text-slate-600 focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 focus:outline-none transition-all resize-y"
            />
          </div>

          {/* Field 3 */}
          <div className="space-y-3 group">
            <label className="block text-sm font-medium text-slate-200 group-focus-within:text-indigo-400 transition-colors">
              Overall Experience <span className="text-red-400">*</span>
            </label>
            <div className="flex flex-wrap gap-3">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                <label key={num} className="relative cursor-pointer">
                  <input type="radio" name="rating" value={num} className="peer sr-only" />
                  <div className="w-12 h-12 rounded-xl border border-white/10 bg-white/5 flex items-center justify-center text-slate-400 peer-checked:bg-indigo-600 peer-checked:text-white peer-checked:border-indigo-500 peer-hover:border-white/30 transition-all">
                    {num}
                  </div>
                </label>
              ))}
            </div>
            <div className="flex justify-between text-xs text-slate-500 px-1 pt-1">
              <span>Poor</span>
              <span>Excellent</span>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-6 border-t border-white/10">
            <button 
              type="submit"
              className="w-full h-14 rounded-xl bg-white text-black font-semibold text-lg transition-transform hover:scale-[1.02] active:scale-[0.98] shadow-[0_0_40px_rgba(255,255,255,0.1)]"
            >
              Submit Response
            </button>
          </div>
        </form>

        {/* Footer */}
        <div className="mt-12 text-center">
          <p className="text-xs text-slate-600 font-mono">
            Powered by <span className="text-slate-400 font-sans font-medium">FormAI</span>
          </p>
        </div>
      </div>
    </main>
  );
}
