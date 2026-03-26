"use client";

import { useAuth } from "@clerk/nextjs";
import { useAction, useMutation, useQuery } from "convex/react";
import { ArrowRight, LayoutTemplate, Sparkles, Wand2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { getSafeActionMessage } from "@/lib/client-errors";

export default function NewFormPage() {
  const router = useRouter();
  const { orgId } = useAuth();
  const createBlankForm = useMutation(api.forms.createBlank);
  const deleteForm = useMutation(api.forms.deleteForm);
  const generateDraft = useAction(api.aiActions.generateDraft);
  const [prompt, setPrompt] = useState("");
  const [isCreatingBlank, setIsCreatingBlank] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [generatedDraftId, setGeneratedDraftId] = useState<Id<"forms"> | null>(null);
  const generatedDraft = useQuery(
    api.forms.getDraft,
    generatedDraftId ? { formId: generatedDraftId, clerkOrgId: orgId ?? null } : "skip",
  );

  const handleGenerate = async () => {
    if (!prompt.trim() || isGenerating) {
      return;
    }

    setIsGenerating(true);

    try {
      const result = await generateDraft({
        prompt,
        clerkOrgId: orgId ?? null,
      });
      setGeneratedDraftId(result.formId);
      setShowReviewModal(true);
    } catch (error) {
      toast.warning(
        getSafeActionMessage(error, "We couldn’t generate a draft right now. Please try again."),
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCreateBlank = async () => {
    if (isCreatingBlank) {
      return;
    }

    setIsCreatingBlank(true);

    try {
      const result = await createBlankForm({ clerkOrgId: orgId ?? null });
      router.push(`/forms/${result.formId}/edit`);
    } catch {
      toast.error("We couldn’t create a blank draft right now. Please try again.");
    } finally {
      setIsCreatingBlank(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl animate-in fade-in slide-in-from-bottom-4 py-12 duration-700 relative">
      {/* Review Modal */}
      {showReviewModal && generatedDraftId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          role="presentation"
          onClick={() => {
            setShowReviewModal(false);
            setGeneratedDraftId(null);
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            className="flex max-h-[90vh] w-full max-w-2xl flex-col rounded-3xl border border-white/10 bg-[#0A0A0A] shadow-2xl animate-in zoom-in-95 duration-300"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="p-6 border-b border-white/10 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
                  <Sparkles className="h-5 w-5 text-indigo-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Draft Generated</h3>
                  <p className="text-sm text-slate-400">Review the structure before continuing.</p>
                </div>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-repeat opacity-[0.99]">
                <div className="space-y-4">
                  <div className="p-4 rounded-xl border border-white/10 bg-white/5">
                    <p className="text-xs font-mono text-indigo-400 mb-2 uppercase tracking-wider">Original Prompt</p>
                    <p className="text-sm text-slate-300">&quot;{prompt}&quot;</p>
                  </div>

                  {generatedDraft ? (
                    <div className="p-4 rounded-xl border border-white/10 bg-white/5">
                      <p className="text-xs font-mono text-slate-400 mb-2 uppercase tracking-wider">Generated Draft</p>
                      <p className="text-sm font-medium text-white">{generatedDraft.form.title}</p>
                      <p className="mt-2 text-sm text-slate-400">
                        {generatedDraft.fields.length} field{generatedDraft.fields.length === 1 ? "" : "s"} ready in the builder.
                      </p>
                    </div>
                  ) : null}
                  
                  <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5">
                  <p className="text-xs font-mono text-emerald-400 mb-2 uppercase tracking-wider">System Status</p>
                  <div className="flex items-center gap-2 text-sm text-emerald-300">
                    <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                    Schema generated successfully. Ready for the builder.
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-6 border-t border-white/10 flex items-center justify-between shrink-0 bg-[#0A0A0A] rounded-b-3xl">
                <button
                  onClick={async () => {
                    if (generatedDraftId) {
                      try {
                        await deleteForm({
                          formId: generatedDraftId,
                          clerkOrgId: orgId ?? null,
                        });
                      } catch {
                        toast.error("We couldn’t discard that generated draft right now.");
                      }
                    }
                    setShowReviewModal(false);
                    setGeneratedDraftId(null);
                  }}
                  className="px-6 py-2.5 rounded-xl border border-white/10 text-sm font-medium text-white hover:bg-white/5 transition-colors focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none"
                >
                Discard
              </button>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => void handleGenerate()}
                  disabled={isGenerating}
                  className="px-6 py-2.5 rounded-xl border border-indigo-500/30 bg-indigo-500/10 text-sm font-medium text-indigo-300 hover:bg-indigo-500/20 transition-colors focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none"
                >
                  Regenerate
                </button>
                <button 
                  onClick={() => router.push(`/forms/${generatedDraftId}/edit`)}
                  className="px-6 py-2.5 rounded-xl bg-white text-black text-sm font-medium hover:scale-105 transition-transform flex items-center gap-2 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none focus-visible:ring-offset-2 focus-visible:ring-offset-[#050505]"
                >
                  Open in Builder <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="mb-12 text-center">
        <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl border border-indigo-500/30 bg-gradient-to-br from-indigo-500/20 to-blue-500/20 shadow-[0_0_30px_rgba(99,102,241,0.2)]">
          <Sparkles className="h-8 w-8 text-indigo-400" />
        </div>
        <h1 className="mb-4 text-4xl font-bold tracking-tight text-white md:text-5xl">
          What are we building today?
        </h1>
        <p className="mx-auto max-w-2xl text-lg text-slate-400">
          Describe the form you need in plain English, and our AI will generate a structured,
          production-ready draft in seconds.
        </p>
      </div>

      <div className="group relative">
        <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-indigo-500 to-blue-500 opacity-20 blur-xl transition duration-500 group-hover:opacity-40" />

        <form
          onSubmit={(event) => {
            event.preventDefault();
            void handleGenerate();
          }}
          className="relative rounded-3xl border border-white/10 bg-[#0A0A0A] p-2 shadow-2xl transition-all focus-within:border-indigo-500/50 focus-within:ring-1 focus-within:ring-indigo-500/50"
        >
          <div className="relative">
            <textarea
              value={prompt}
              onChange={(event) => setPrompt(event.target.value.slice(0, 1500))}
              placeholder="e.g. I need a customer feedback form that asks for their role, what they liked most, and a 1-10 rating of the overall experience..."
              className="h-40 w-full resize-none border-none bg-transparent p-6 text-lg text-white placeholder:text-slate-600 focus:outline-none focus:ring-0"
              autoFocus
            />

            <div className="absolute bottom-4 right-4 flex items-center gap-3">
              <span className="text-xs font-mono text-slate-500">{prompt.length} / 1500</span>
              <button
                type="submit"
                disabled={!prompt.trim() || isGenerating}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-white px-6 font-medium text-black transition-all hover:scale-105 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none focus-visible:ring-offset-2 focus-visible:ring-offset-[#050505]"
              >
                <Wand2 className="h-4 w-4" />
                <span>{isGenerating ? "Generating draft..." : "Generate Draft"}</span>
              </button>
            </div>
          </div>
        </form>
      </div>

      <div className="mt-16 grid gap-6 sm:grid-cols-2">
        <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6">
          <h3 className="mb-4 flex items-center gap-2 text-sm font-medium text-white">
            <Sparkles className="h-4 w-4 text-indigo-400" />
            Try these prompts
          </h3>
          <div className="space-y-3">
            {[
              "A job application form for a senior frontend engineer role.",
              "An event RSVP form with dietary restrictions and plus-one details.",
              "A bug report form that requires steps to reproduce and severity.",
            ].map((example) => (
              <button
                key={example}
                onClick={() => {
                  setPrompt(example);
                }}
                className="w-full rounded-xl border border-white/5 bg-white/5 p-4 text-left text-sm text-slate-300 transition-colors hover:bg-white/10 hover:text-white focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none"
              >
                &quot;{example}&quot;
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col items-center justify-center rounded-2xl border border-white/5 bg-white/[0.02] p-6 text-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-white/5">
            <LayoutTemplate className="h-6 w-6 text-slate-400" />
          </div>
          <h3 className="mb-2 text-base font-medium text-white">Prefer to build manually?</h3>
          <p className="mb-6 text-sm text-slate-400">
            Skip the AI and start with a blank canvas using our drag-and-drop builder.
          </p>
          <button
            type="button"
            onClick={() => void handleCreateBlank()}
            disabled={isCreatingBlank}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-white/10 bg-transparent px-6 text-sm font-medium text-white transition-colors hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none"
          >
            <span>{isCreatingBlank ? "Creating draft..." : "Start from scratch"}</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
