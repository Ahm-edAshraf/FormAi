"use client";

import { useAuth } from "@clerk/nextjs";
import { useAction, useMutation } from "convex/react";
import { ArrowRight, LayoutTemplate, Sparkles, Wand2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { api } from "@/convex/_generated/api";

export default function NewFormPage() {
  const router = useRouter();
  const { orgId } = useAuth();
  const createBlankForm = useMutation(api.forms.createBlank);
  const generateDraft = useAction(api.aiActions.generateDraft);
  const [prompt, setPrompt] = useState("");
  const [isCreatingBlank, setIsCreatingBlank] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiMessage, setAiMessage] = useState<string | null>(null);

  const handleGenerate = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!prompt.trim() || isGenerating) {
      return;
    }

    setAiMessage(null);
    setIsGenerating(true);

    try {
      const result = await generateDraft({
        prompt,
        clerkOrgId: orgId ?? null,
      });
      router.push(`/forms/${result.formId}/edit`);
    } catch (error) {
      setAiMessage(
        error instanceof Error
          ? error.message
          : "We could not generate a draft right now. Please try again.",
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCreateBlank = async () => {
    if (isCreatingBlank) {
      return;
    }

    setAiMessage(null);
    setIsCreatingBlank(true);

    try {
      const result = await createBlankForm({ clerkOrgId: orgId ?? null });
      router.push(`/forms/${result.formId}/edit`);
    } finally {
      setIsCreatingBlank(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl animate-in fade-in slide-in-from-bottom-4 py-12 duration-700">
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
          onSubmit={handleGenerate}
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
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-white px-6 font-medium text-black transition-all hover:scale-105 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
              >
                <Wand2 className="h-4 w-4" />
                <span>{isGenerating ? "Generating draft..." : "Generate Draft"}</span>
              </button>
            </div>
          </div>
        </form>
      </div>

      {aiMessage ? (
        <p className="mt-4 rounded-2xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
          {aiMessage}
        </p>
      ) : null}

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
                  setAiMessage(null);
                }}
                className="w-full rounded-xl border border-white/5 bg-white/5 p-4 text-left text-sm text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
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
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-white/10 bg-transparent px-6 text-sm font-medium text-white transition-colors hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <span>{isCreatingBlank ? "Creating draft..." : "Start from scratch"}</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
