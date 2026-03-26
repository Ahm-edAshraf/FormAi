const signals = [
  {
    label: "Prompt to draft",
    value: "19 sec",
    note: "From idea to a structured first version.",
  },
  {
    label: "Snapshot discipline",
    value: "Versioned",
    note: "Drafts stay editable while published forms stay stable.",
  },
  {
    label: "Workspace aware",
    value: "Clerk orgs",
    note: "Personal and team spaces share one operating model.",
  },
];

const steps = [
  "Describe the intake flow in plain English.",
  "Review the generated structure before it touches production.",
  "Publish a clean snapshot and track responses in one place.",
];

export default function MarketingPage() {
  return (
    <main className="relative isolate min-h-screen overflow-hidden bg-[#f3eadb] text-[#221c16]">
      <div className="absolute inset-x-0 top-0 h-48 bg-[radial-gradient(circle_at_top,rgba(117,77,36,0.16),transparent_60%)]" />
      <div className="absolute inset-y-0 right-0 hidden w-1/3 bg-[linear-gradient(180deg,rgba(34,28,22,0.03),rgba(34,28,22,0))] lg:block" />
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-6 pb-12 pt-6 sm:px-10 lg:px-12">
        <header className="flex items-center justify-between border-b border-black/10 pb-5">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.35em] text-[#6c5945]">
              FormAI issue no. 01
            </p>
            <h1 className="mt-2 text-2xl font-medium tracking-[0.08em] text-[#1d1711] sm:text-3xl">
              FormAI
            </h1>
          </div>
          <div className="hidden text-right sm:block">
            <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-[#8b735e]">
              Prompt, edit, publish
            </p>
            <p className="mt-2 max-w-xs text-sm leading-6 text-[#5e5041]">
              A quieter form builder for teams that want structure before polish.
            </p>
          </div>
        </header>

        <section className="grid flex-1 gap-10 py-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:gap-14 lg:py-14">
          <div className="space-y-8">
            <div className="space-y-5">
              <p className="font-mono text-[11px] uppercase tracking-[0.35em] text-[#8b735e]">
                Editorial product preview
              </p>
              <div className="space-y-4">
                <h2 className="font-[family:var(--font-editorial)] text-6xl leading-[0.9] font-semibold tracking-[-0.04em] text-[#1d1711] sm:text-7xl lg:text-8xl">
                  Draft forms like you are editing a first-class document.
                </h2>
                <p className="max-w-2xl text-lg leading-8 text-[#4d4033] sm:text-xl">
                  FormAI starts with a prompt, keeps the draft human-readable, and ships a publishable snapshot without turning the builder into a puzzle box.
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {signals.map((signal) => (
                <article
                  key={signal.label}
                  className="rounded-[1.5rem] border border-black/10 bg-[#f8f1e6]/80 p-4 shadow-[0_1px_0_rgba(34,28,22,0.08)] backdrop-blur"
                >
                  <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[#8b735e]">
                    {signal.label}
                  </p>
                  <p className="mt-4 font-[family:var(--font-editorial)] text-3xl font-semibold text-[#201913]">
                    {signal.value}
                  </p>
                  <p className="mt-3 text-sm leading-6 text-[#5e5041]">{signal.note}</p>
                </article>
              ))}
            </div>
          </div>

          <section className="relative rounded-[2rem] border border-black/10 bg-[#201913] p-5 text-[#f5ecdf] shadow-[0_30px_80px_rgba(34,28,22,0.18)] sm:p-7">
            <div className="absolute inset-x-8 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(243,234,219,0.7),transparent)]" />
            <div className="grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
              <div className="rounded-[1.6rem] border border-white/10 bg-white/5 p-5">
                <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-[#d0b89d]">
                  Product flow
                </p>
                <ol className="mt-6 space-y-4">
                  {steps.map((step, index) => (
                    <li key={step} className="flex gap-3">
                      <span className="font-mono text-xs text-[#d0b89d]">0{index + 1}</span>
                      <p className="text-sm leading-6 text-[#f5ecdf]">{step}</p>
                    </li>
                  ))}
                </ol>
              </div>

              <div className="rounded-[1.6rem] bg-[#f5ecdf] p-5 text-[#221c16]">
                <div className="flex items-center justify-between border-b border-black/10 pb-3">
                  <div>
                    <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-[#8b735e]">
                      Live draft
                    </p>
                    <p className="mt-2 font-[family:var(--font-editorial)] text-3xl font-semibold">
                      Customer research intake
                    </p>
                  </div>
                  <span className="rounded-full border border-black/10 px-3 py-1 font-mono text-[11px] uppercase tracking-[0.18em] text-[#6c5945]">
                    Draft v0.3
                  </span>
                </div>

                <div className="mt-5 space-y-4">
                  <div className="rounded-[1.25rem] border border-black/10 bg-white/60 p-4">
                    <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-[#8b735e]">
                      Opening question
                    </p>
                    <p className="mt-3 text-base font-medium">What are you hoping to learn from this interview?</p>
                    <p className="mt-2 text-sm leading-6 text-[#5e5041]">
                      Short answer, required, visible in both draft and published snapshot.
                    </p>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-[1.25rem] border border-dashed border-black/15 bg-[#efe3d1] p-4">
                      <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-[#8b735e]">
                        AI suggestion
                      </p>
                      <p className="mt-3 text-sm leading-6 text-[#4d4033]">
                        Add one required rating field to measure confidence in the current workflow.
                      </p>
                    </div>
                    <div className="rounded-[1.25rem] border border-black/10 bg-[#221c16] p-4 text-[#f5ecdf]">
                      <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-[#d0b89d]">
                        Publish snapshot
                      </p>
                      <p className="mt-3 text-sm leading-6 text-[#f1e4d2]">
                        Freeze the structure, issue a shareable URL, and preserve the editable draft for the next pass.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </section>
      </div>
    </main>
  );
}
