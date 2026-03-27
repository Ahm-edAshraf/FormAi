"use client";

import { useAuth } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import {
  AlignLeft,
  ArrowLeft,
  Calendar,
  CheckSquare,
  ChevronDown,
  CircleDot,
  Eye,
  GripVertical,
  Plus,
  Send,
  Settings,
  Star,
  Trash2,
  Type,
  X,
  Copy,
  Check,
  Smartphone,
  Monitor,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useMemo, useState, useCallback } from "react";
import { toast } from "sonner";

import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { getSafeActionMessage } from "@/lib/client-errors";
import { getDropPlacement, reorderFieldIds, type DropPlacement } from "@/lib/forms/reorder-fields";
import {
  FORM_FIELD_TYPE_LABELS,
  FORM_FIELD_TYPE_VALUES,
} from "@/lib/forms/constants";
import type { FormFieldType } from "@/lib/forms/types";

const FIELD_TYPE_ICONS: Record<FormFieldType, typeof Type> = {
  text: Type,
  textarea: AlignLeft,
  select: ChevronDown,
  radio: CircleDot,
  checkbox: CheckSquare,
  rating: Star,
  date: Calendar,
};

function getFieldPreviewLabel(type: FormFieldType): string {
  switch (type) {
    case "textarea":
      return "Long text answer...";
    case "select":
      return "Select an option...";
    case "radio":
      return "Single choice...";
    case "checkbox":
      return "Multiple choice...";
    case "rating":
      return "Rating response...";
    case "date":
      return "Select a date...";
    default:
      return "Short text answer...";
  }
}

export default function FormBuilderPage() {
  const router = useRouter();
  const params = useParams<{ formId: string }>();
  const { isLoaded, orgId } = useAuth();
  const formId = params.formId as Id<"forms">;
  const draft = useQuery(
    api.forms.getDraft,
    isLoaded ? { formId, clerkOrgId: orgId ?? null } : "skip",
  );
  const updateForm = useMutation(api.forms.updateDraft);
  const archiveForm = useMutation(api.forms.archive);
  const publishForm = useMutation(api.formSnapshots.publish);
  const addField = useMutation(api.formFields.addField);
  const updateField = useMutation(api.formFields.updateField);
  const removeField = useMutation(api.formFields.removeField);
  const reorderFieldsMutation = useMutation(api.formFields.reorderFields);
  const [activeTab, setActiveTab] = useState("build");
  const [selectedFieldId, setSelectedFieldId] = useState<Id<"formFields"> | null>(null);
  const [publishState, setPublishState] = useState<"idle" | "publishing" | "success" | "error">(
    "idle",
  );
  const [publishMessage, setPublishMessage] = useState<string | null>(null);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showDraftPreview, setShowDraftPreview] = useState(false);
  const [previewViewport, setPreviewViewport] = useState<"desktop" | "mobile">("desktop");
  const [dragFieldId, setDragFieldId] = useState<Id<"formFields"> | null>(null);
  const [dragOverState, setDragOverState] = useState<{
    fieldId: Id<"formFields">;
    placement: DropPlacement;
  } | null>(null);
  const [settingsNotice, setSettingsNotice] = useState<string | null>(null);
  
  const fields = useMemo(() => draft?.fields ?? [], [draft?.fields]);
  const resolvedSelectedFieldId =
    selectedFieldId && fields.some((field) => field._id === selectedFieldId)
      ? selectedFieldId
      : (fields[0]?._id ?? null);
  const selectedField = useMemo(
    () => fields.find((field) => field._id === resolvedSelectedFieldId) ?? null,
    [fields, resolvedSelectedFieldId],
  );

  const applyReorder = useCallback(
    (fromId: Id<"formFields">, toId: Id<"formFields">, placement: DropPlacement) => {
      if (!draft) {
        return;
      }

      const ids = fields.map((f) => f._id);
      const next = reorderFieldIds(ids, fromId, toId, placement);

      if (next.join(":") === ids.join(":")) {
        return;
      }

      void reorderFieldsMutation({
        formId: draft.form._id,
        clerkOrgId: orgId ?? null,
        fieldIds: next,
      });
    },
    [draft, fields, orgId, reorderFieldsMutation],
  );

  if (draft === undefined) {
    return (
      <div className="flex h-[calc(100vh-8rem)] flex-col items-center justify-center gap-4 rounded-2xl border border-white/10 bg-[#050505] p-8">
        <div className="h-10 w-10 rounded-full border-2 border-indigo-500/30 border-t-indigo-500 animate-spin" />
        <p className="text-sm text-slate-400">Loading form builder…</p>
      </div>
    );
  }

  if (!draft) {
    return (
      <div className="flex h-[calc(100vh-8rem)] items-center justify-center rounded-2xl border border-white/10 bg-[#050505] text-sm text-slate-400">
        Form not found.
      </div>
    );
  }

  const handlePublish = () => {
    setPublishState("publishing");
    setPublishMessage(null);

    void publishForm({
      formId: draft.form._id,
      clerkOrgId: orgId ?? null,
    })
      .then((result) => {
        setPublishState("success");
        setPublishMessage(`Published v${result.version}`);
      })
      .catch((error) => {
        setPublishState("error");
        setPublishMessage(null);
        toast.error(getSafeActionMessage(error, "We couldn’t publish this form."));
      });
  };

  const copyToClipboard = () => {
    if (draft.form.slug) {
      navigator.clipboard.writeText(`${window.location.origin}/f/${draft.form.slug}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
      <div className="flex h-[calc(100vh-8rem)] flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#050505] shadow-2xl relative">
      {/* Mobile Tab Switcher */}
      <div className="flex shrink-0 gap-2 border-b border-white/10 bg-[#0A0A0A] p-2 md:hidden">
        <button
          type="button"
          onClick={() => setActiveTab("build")}
          className={`app-focus flex-1 rounded-lg py-2.5 text-xs font-medium transition-colors min-h-11 ${activeTab === "build" ? "bg-white/10 text-white" : "text-slate-400 hover:text-white"}`}
        >
          Canvas
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("add")}
          className={`app-focus flex-1 rounded-lg py-2.5 text-xs font-medium transition-colors min-h-11 ${activeTab === "add" ? "bg-white/10 text-white" : "text-slate-400 hover:text-white"}`}
        >
          Add Field
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("properties")}
          className={`app-focus flex-1 rounded-lg py-2.5 text-xs font-medium transition-colors min-h-11 ${activeTab === "properties" ? "bg-white/10 text-white" : "text-slate-400 hover:text-white"}`}
        >
          Properties
        </button>
      </div>
      {/* Publish Modal */}
      {showPublishModal && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md max-h-[min(90vh,520px)] overflow-y-auto rounded-2xl border border-white/10 bg-[#0A0A0A] p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white">Publish Form</h3>
              <button 
                onClick={() => {
                  setShowPublishModal(false);
                  if (publishState === "success") setPublishState("idle");
                }}
                className="rounded-lg p-2 text-slate-400 hover:bg-white/5 hover:text-white transition-colors focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {publishState === "success" ? (
              <div className="space-y-6">
                <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-center">
                  <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/20">
                    <Check className="h-5 w-5 text-emerald-400" />
                  </div>
                  <p className="font-medium text-emerald-400">Successfully published!</p>
                  <p className="mt-1 text-sm text-emerald-400/80">{publishMessage}</p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Public URL</label>
                  <div className="flex items-center gap-2">
                    <input 
                        type="text" 
                        readOnly 
                        value={`${typeof window !== 'undefined' ? window.location.origin : ''}/f/${draft.form.slug}`}
                      className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none"
                    />
                    <button 
                      onClick={copyToClipboard}
                      className="flex items-center justify-center rounded-lg border border-white/10 bg-white/5 p-2.5 text-slate-300 hover:bg-white/10 hover:text-white transition-colors focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none"
                    >
                      {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button 
                    onClick={() => {
                      setShowPublishModal(false);
                      setPublishState("idle");
                    }}
                    className="flex-1 rounded-lg border border-white/10 bg-transparent py-2.5 text-sm font-medium text-white hover:bg-white/5 transition-colors focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none"
                  >
                    Done
                  </button>
                    <a 
                      href={`/f/${draft.form.slug}`}
                      target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center rounded-lg bg-indigo-500 py-2.5 text-sm font-medium text-white hover:bg-indigo-400 transition-colors focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0A0A]"
                  >
                    View Live Form
                  </a>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <p className="text-sm text-slate-400">
                  Publishing will freeze your current draft into a new version and update the live form.
                </p>
                
                {publishState === "error" && (
                  <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">
                    {publishMessage}
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <button 
                    onClick={() => setShowPublishModal(false)}
                    className="flex-1 rounded-lg border border-white/10 bg-transparent py-2.5 text-sm font-medium text-white hover:bg-white/5 transition-colors focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handlePublish}
                    disabled={publishState === "publishing"}
                    className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-white py-2.5 text-sm font-medium text-black hover:bg-slate-200 transition-colors disabled:opacity-70 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0A0A]"
                  >
                    {publishState === "publishing" ? (
                      <>
                        <div className="h-4 w-4 rounded-full border-2 border-black/20 border-t-black animate-spin" />
                        Publishing...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        Publish Now
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {showDraftPreview && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div
            className={`flex w-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#0A0A0A] shadow-2xl animate-in zoom-in-95 duration-200 ${
              previewViewport === "mobile" ? "max-w-md" : "max-w-3xl"
            } max-h-[min(92vh,720px)]`}
          >
            <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-4 sm:px-6">
              <div>
                <h3 className="text-lg font-semibold text-white">Draft preview</h3>
                <p className="text-xs text-slate-500">
                  Unpublished draft — this is how fields will read on the public form.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex rounded-lg border border-white/10 bg-white/5 p-1">
                  <button
                    type="button"
                    onClick={() => setPreviewViewport("desktop")}
                    className={`app-focus inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium ${
                      previewViewport === "desktop"
                        ? "bg-white/10 text-white"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    <Monitor className="h-3.5 w-3.5" />
                    Desktop
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewViewport("mobile")}
                    className={`app-focus inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium ${
                      previewViewport === "mobile"
                        ? "bg-white/10 text-white"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    <Smartphone className="h-3.5 w-3.5" />
                    Mobile
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => setShowDraftPreview(false)}
                  className="app-focus rounded-lg p-2 text-slate-400 hover:bg-white/5 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-6">
              <div
                className={`mx-auto space-y-6 rounded-2xl border border-white/10 bg-[#050505] p-6 sm:p-8 ${
                  previewViewport === "mobile" ? "max-w-sm" : "max-w-xl"
                }`}
              >
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold text-white">{draft.form.title}</h2>
                  {draft.form.description ? (
                    <p className="text-sm text-slate-400">{draft.form.description}</p>
                  ) : null}
                </div>
                <div className="space-y-5">
                  {fields.map((field) => (
                    <div key={field._id} className="space-y-2">
                      <p className="text-sm font-medium text-slate-200">
                        {field.label}
                        {field.isRequired ? <span className="text-red-400"> *</span> : null}
                      </p>
                      {field.description ? (
                        <p className="text-xs text-slate-500">{field.description}</p>
                      ) : null}
                      <div className="rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-slate-500">
                        {getFieldPreviewLabel(field.type)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-2 border-t border-white/10 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
              <button
                type="button"
                onClick={() => setShowDraftPreview(false)}
                className="app-focus rounded-lg border border-white/10 bg-transparent px-4 py-2.5 text-sm font-medium text-white hover:bg-white/5"
              >
                Close
              </button>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                {draft.form.status === "published" && draft.publishedSnapshot?.slug ? (
                  <button
                    type="button"
                    onClick={() => {
                      const slug = draft.publishedSnapshot?.slug;
                      if (slug) {
                        window.open(`/f/${slug}`, "_blank", "noopener,noreferrer");
                      }
                    }}
                    className="app-focus rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-white hover:bg-white/10"
                  >
                    Open live form
                  </button>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      )}

      <header className="flex h-14 min-h-14 items-center justify-between gap-2 border-b border-white/10 bg-white/[0.02] px-3 sm:px-4">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard"
            className="-ml-2 rounded-lg p-2 text-slate-400 transition-colors hover:bg-white/5 hover:text-white focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div className="h-4 w-px bg-white/10" />
          <h2 className="text-sm font-medium text-white">{draft.form.title}</h2>
          <span className="rounded border border-amber-500/20 bg-amber-500/10 px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider text-amber-400">
            {draft.form.status}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border border-white/5 bg-white/5 p-1">
            <button
              onClick={() => setActiveTab("build")}
              className={`rounded-md px-3 py-1 text-xs font-medium transition-colors focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none ${
                activeTab === "build"
                  ? "bg-white/10 text-white shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Build
            </button>
            <button
              onClick={() => setActiveTab("settings")}
              className={`rounded-md px-3 py-1 text-xs font-medium transition-colors focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none ${
                activeTab === "settings"
                  ? "bg-white/10 text-white shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Settings
            </button>
          </div>

          <div className="mx-2 h-4 w-px bg-white/10" />

          <button
            type="button"
            onClick={() => setShowDraftPreview(true)}
            className="inline-flex h-8 min-h-8 items-center gap-2 rounded-lg px-3 text-xs font-medium text-slate-300 transition-colors hover:bg-white/5 hover:text-white focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none"
          >
            <Eye className="h-3.5 w-3.5" />
            Preview
          </button>
          <button
            type="button"
            onClick={() => setShowPublishModal(true)}
            className="inline-flex h-8 items-center gap-2 rounded-lg bg-white px-4 text-xs font-medium text-black transition-transform hover:scale-105 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none focus-visible:ring-offset-2 focus-visible:ring-offset-[#050505]"
          >
            <Send className="h-3.5 w-3.5" />
            Publish
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden flex-col md:flex-row">
        {(activeTab === "build" || activeTab === "add" || activeTab === "properties") && (
          <>
            <aside className={`w-full md:w-64 flex-col border-r border-white/10 bg-white/[0.01] ${activeTab === 'add' ? 'flex' : 'hidden md:flex'}`}>
              <div className="border-b border-white/10 p-4">
                <h3 className="mb-4 text-xs font-mono uppercase tracking-wider text-slate-500">
                  Add Field
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {FORM_FIELD_TYPE_VALUES.map((type) => {
                    const Icon = FIELD_TYPE_ICONS[type];

                    return (
                      <button
                        key={type}
                        type="button"
                        onClick={() => {
                          void addField({
                            formId: draft.form._id,
                            clerkOrgId: orgId ?? null,
                            type,
                          }).then((field) => {
                            setSelectedFieldId(field._id);
                            if (window.innerWidth < 768) {
                              setActiveTab("properties");
                            }
                          });
                        }}
                        className="group flex flex-col items-center justify-center gap-2 rounded-xl border border-white/5 bg-white/[0.02] p-3 transition-all hover:border-white/10 hover:bg-white/[0.06] focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none"
                      >
                        <Icon className="h-5 w-5 text-slate-400 transition-colors group-hover:text-indigo-400" />
                        <span className="text-[10px] font-medium text-slate-300 text-center">
                          {FORM_FIELD_TYPE_LABELS[type]}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </aside>

            <main className={`flex-1 overflow-y-auto bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-repeat p-4 sm:p-8 opacity-[0.99] ${activeTab === 'build' ? 'block' : 'hidden md:block'}`}>
              <div className="mx-auto max-w-2xl">
                <div className="group relative mb-8 rounded-2xl border border-transparent p-1 transition-colors hover:border-white/10">
                  <input
                    key={`${draft.form._id}-title-${draft.form.updatedAt}`}
                    type="text"
                    defaultValue={draft.form.title}
                    onBlur={(event) => {
                      const nextTitle = event.target.value.trim();

                      if (nextTitle && nextTitle !== draft.form.title) {
                        void updateForm({
                          formId: draft.form._id,
                          clerkOrgId: orgId ?? null,
                          title: nextTitle,
                        });
                      }
                    }}
                    className="w-full bg-transparent p-2 text-3xl font-bold text-white placeholder:text-slate-600 focus:outline-none focus:ring-0"
                  />
                  <textarea
                    key={`${draft.form._id}-description-${draft.form.updatedAt}`}
                    defaultValue={draft.form.description}
                    onBlur={(event) => {
                      const nextDescription = event.target.value.trim();

                      if (nextDescription !== draft.form.description) {
                        void updateForm({
                          formId: draft.form._id,
                          clerkOrgId: orgId ?? null,
                          description: nextDescription,
                        });
                      }
                    }}
                    placeholder="Add a form description..."
                    className="h-10 w-full resize-none bg-transparent p-2 text-sm text-slate-400 placeholder:text-slate-600 focus:outline-none focus:ring-0"
                  />
                </div>

                <div className="space-y-4">
                  {fields.map((field) => (
                    <div
                      key={field._id}
                      onClick={() => setSelectedFieldId(field._id)}
                      onDragOver={(event) => {
                        event.preventDefault();
                        event.dataTransfer.dropEffect = "move";
                        if (!dragFieldId || dragFieldId === field._id) {
                          setDragOverState(null);
                          return;
                        }

                        const placement = getDropPlacement(
                          event.clientY,
                          event.currentTarget.getBoundingClientRect(),
                        );
                        setDragOverState({ fieldId: field._id, placement });
                      }}
                      onDragLeave={(event) => {
                        const related = event.relatedTarget as Node | null;
                        if (!event.currentTarget.contains(related)) {
                          setDragOverState((current) =>
                            current?.fieldId === field._id ? null : current,
                          );
                        }
                      }}
                      onDrop={(event) => {
                        event.preventDefault();
                        if (dragFieldId) {
                          const placement = dragOverState?.fieldId === field._id
                            ? dragOverState.placement
                            : getDropPlacement(
                                event.clientY,
                                event.currentTarget.getBoundingClientRect(),
                              );
                          applyReorder(dragFieldId, field._id, placement);
                        }
                        setDragFieldId(null);
                        setDragOverState(null);
                      }}
                      className={`group relative flex cursor-pointer gap-3 rounded-2xl border p-5 transition-all ${
                        resolvedSelectedFieldId === field._id
                          ? "border-indigo-500/50 bg-white/5 shadow-[0_0_20px_rgba(99,102,241,0.1)]"
                          : "border-white/10 bg-[#0A0A0A] hover:border-white/20"
                      } ${dragFieldId === field._id ? "opacity-60" : ""}`}
                    >
                      {dragOverState?.fieldId === field._id ? (
                        <div
                          className={`pointer-events-none absolute left-4 right-4 z-10 transition-all ${
                            dragOverState.placement === "before" ? "-top-2" : "-bottom-2"
                          }`}
                        >
                          <div className="relative flex items-center gap-2">
                            <div className="h-3 w-3 rounded-full border border-indigo-300/60 bg-indigo-400 shadow-[0_0_16px_rgba(129,140,248,0.8)]" />
                            <div className="h-[3px] flex-1 rounded-full bg-gradient-to-r from-indigo-400 via-fuchsia-400 to-cyan-400 shadow-[0_0_24px_rgba(99,102,241,0.55)]" />
                            <span className="rounded-full border border-indigo-400/30 bg-[#0A0A0A] px-2.5 py-1 text-[10px] font-mono uppercase tracking-[0.18em] text-indigo-200 shadow-lg">
                              Drop {dragOverState.placement === "before" ? "before" : "after"}
                            </span>
                          </div>
                        </div>
                      ) : null}

                      <div
                        className="mt-1 cursor-grab opacity-100 transition-opacity active:cursor-grabbing md:opacity-0 md:group-hover:opacity-100"
                        draggable
                        onDragStart={(event) => {
                          setDragFieldId(field._id);
                          setDragOverState(null);
                          event.dataTransfer.effectAllowed = "move";
                          event.dataTransfer.setData("text/plain", field._id);
                        }}
                        onDragEnd={() => {
                          setDragFieldId(null);
                          setDragOverState(null);
                        }}
                        onClick={(event) => event.stopPropagation()}
                      >
                        <GripVertical className="h-4 w-4 text-slate-500" aria-hidden />
                      </div>

                      <div className="flex-1 space-y-4">
                        <div className="flex items-center justify-between gap-3">
                          <input
                            key={`${field._id}-label-${field.updatedAt}`}
                            type="text"
                            defaultValue={field.label}
                            onBlur={(event) => {
                              const nextLabel = event.target.value.trim();

                              if (nextLabel && nextLabel !== field.label) {
                                void updateField({
                                  fieldId: field._id,
                                  clerkOrgId: orgId ?? null,
                                  label: nextLabel,
                                });
                              }
                            }}
                            onClick={(event) => event.stopPropagation()}
                            className="w-full bg-transparent text-sm font-medium text-white focus:outline-none"
                          />
                          {field.isRequired ? <span className="text-sm text-red-400">*</span> : null}
                        </div>

                        <div className="pointer-events-none flex h-10 items-center rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-slate-500">
                          {getFieldPreviewLabel(field.type)}
                        </div>
                      </div>

                      {resolvedSelectedFieldId === field._id ? (
                        <div className="absolute -right-12 top-1/2 flex -translate-y-1/2 flex-col gap-2">
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              void removeField({
                                fieldId: field._id,
                                clerkOrgId: orgId ?? null,
                              });
                            }}
                            className="rounded-lg border border-white/10 bg-white/5 p-2 text-slate-400 transition-colors hover:bg-white/10 hover:text-white focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ) : null}
                    </div>
                  ))}
                </div>

                  <button
                    type="button"
                    onClick={() => {
                      void addField({
                        formId: draft.form._id,
                        clerkOrgId: orgId ?? null,
                        type: "text",
                      }).then((field) => {
                        setSelectedFieldId(field._id);
                        if (window.innerWidth < 768) {
                          setActiveTab("properties");
                        }
                      });
                    }}
                    className="mt-8 flex w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-white/10 py-6 text-slate-400 transition-all hover:border-indigo-500/50 hover:bg-indigo-500/5 hover:text-indigo-400 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none"
                  >
                  <Plus className="h-6 w-6" />
                  <span className="text-sm font-medium">Add New Field</span>
                </button>
              </div>
            </main>

            <aside className={`w-full md:w-80 flex-col border-l border-white/10 bg-white/[0.01] overflow-y-auto ${activeTab === 'properties' ? 'flex' : 'hidden md:flex'}`}>
              {selectedField ? (
                <div className="space-y-6 p-6">
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      {FIELD_TYPE_ICONS[selectedField.type] && (() => {
                        const Icon = FIELD_TYPE_ICONS[selectedField.type];
                        return <Icon className="h-4 w-4 text-indigo-400" />;
                      })()}
                      <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400">
                        {FORM_FIELD_TYPE_LABELS[selectedField.type]} Properties
                      </h3>
                    </div>
                    
                    <div className="space-y-5">
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-slate-300">Field Label</label>
                        <input
                          key={`${selectedField._id}-panel-label-${selectedField.updatedAt}`}
                          type="text"
                          defaultValue={selectedField.label}
                          onBlur={(event) => {
                            const nextLabel = event.target.value.trim();
                            if (nextLabel && nextLabel !== selectedField.label) {
                              void updateField({
                                fieldId: selectedField._id,
                                clerkOrgId: orgId ?? null,
                                label: nextLabel,
                              });
                            }
                          }}
                          className="h-9 w-full rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-white focus:border-indigo-500/50 focus:outline-none"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-slate-300">Help Text</label>
                        <input
                          key={`${selectedField._id}-panel-description-${selectedField.updatedAt}`}
                          type="text"
                          defaultValue={selectedField.description}
                          placeholder="Optional description..."
                          onBlur={(event) => {
                            const nextDescription = event.target.value.trim();
                            if (nextDescription !== selectedField.description) {
                              void updateField({
                                fieldId: selectedField._id,
                                clerkOrgId: orgId ?? null,
                                description: nextDescription,
                              });
                            }
                          }}
                          className="h-9 w-full rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-white focus:border-indigo-500/50 focus:outline-none"
                        />
                      </div>

                      {["text", "textarea"].includes(selectedField.type) && (
                        <div className="space-y-2">
                          <label className="text-xs font-medium text-slate-300">Placeholder</label>
                          <input
                            key={`${selectedField._id}-panel-placeholder-${selectedField.updatedAt}`}
                            type="text"
                            defaultValue={selectedField.placeholder}
                            placeholder="e.g. John Doe"
                            onBlur={(event) => {
                              const nextPlaceholder = event.target.value.trim();
                              if (nextPlaceholder !== selectedField.placeholder) {
                                void updateField({
                                  fieldId: selectedField._id,
                                  clerkOrgId: orgId ?? null,
                                  placeholder: nextPlaceholder,
                                });
                              }
                            }}
                            className="h-9 w-full rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-white focus:border-indigo-500/50 focus:outline-none"
                          />
                        </div>
                      )}

                      {["select", "radio", "checkbox"].includes(selectedField.type) && (
                        <div className="space-y-2">
                          <label className="text-xs font-medium text-slate-300 flex justify-between items-center">
                            Options
                            <span className="text-[10px] text-slate-500">Comma separated</span>
                          </label>
                          <textarea
                            key={`${selectedField._id}-panel-options-${selectedField.updatedAt}`}
                            defaultValue={
                              selectedField.options?.map((option) => option.label).join(", ") || ""
                            }
                            placeholder="Option 1, Option 2, Option 3"
                            rows={3}
                            onBlur={(event) => {
                              const val = event.target.value;
                              const parts = val.split(",").map((s) => s.trim()).filter(Boolean);
                              const options = parts.map((label, i) => {
                                const value =
                                  label
                                    .toLowerCase()
                                    .replace(/[^a-z0-9]+/g, "-")
                                    .replace(/^-|-$/g, "") || `option-${i + 1}`;
                                return { label, value };
                              });
                              void updateField({
                                fieldId: selectedField._id,
                                clerkOrgId: orgId ?? null,
                                options: options.length > 0 ? options : undefined,
                              });
                            }}
                            className="w-full resize-y rounded-lg border border-white/10 bg-white/5 p-3 text-sm text-white focus:border-indigo-500/50 focus:outline-none"
                          />
                        </div>
                      )}

                      {selectedField.type === "rating" && (
                        <div className="space-y-2">
                          <label className="text-xs font-medium text-slate-300">Rating scale</label>
                          <select
                            key={`${selectedField._id}-rating-scale-${selectedField.updatedAt}`}
                            defaultValue={String(selectedField.settings?.ratingScale ?? 5)}
                            onBlur={(event) => {
                              const next = Number(event.target.value);
                              if (!Number.isFinite(next)) {
                                return;
                              }
                              void updateField({
                                fieldId: selectedField._id,
                                clerkOrgId: orgId ?? null,
                                settings: {
                                  allowMultiple: selectedField.settings?.allowMultiple ?? null,
                                  defaultValue: selectedField.settings?.defaultValue ?? null,
                                  ratingScale: next,
                                },
                              });
                            }}
                            className="h-9 w-full rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-white focus:border-indigo-500/50 focus:outline-none"
                          >
                            {[3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                              <option key={n} value={n}>
                                1–{n}
                              </option>
                            ))}
                          </select>
                          <p className="text-[11px] text-slate-500">
                            Respondents pick a value from 1 up to this maximum.
                          </p>
                        </div>
                      )}

                      <div className="border-t border-white/10 pt-5">
                        <label className="flex cursor-pointer items-center justify-between">
                          <span className="text-sm font-medium text-slate-300">Required Field</span>
                          <button
                            type="button"
                            onClick={() =>
                              void updateField({
                                fieldId: selectedField._id,
                                clerkOrgId: orgId ?? null,
                                isRequired: !selectedField.isRequired,
                              })
                            }
                            className={`relative h-5 w-9 rounded-full transition-colors focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0A0A] ${
                              selectedField.isRequired ? "bg-indigo-500" : "bg-white/10"
                            }`}
                          >
                            <span
                              className={`absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white transition-transform ${
                                selectedField.isRequired ? "translate-x-4" : "translate-x-0"
                              }`}
                            />
                          </button>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-1 flex-col items-center justify-center p-6 text-center text-slate-500">
                  <Settings className="mb-3 h-8 w-8 opacity-50" />
                  <p className="text-sm">Select a field to edit its properties</p>
                </div>
              )}
            </aside>
          </>
        )}
        
        {activeTab === "settings" && (
          <div className="flex-1 p-4 sm:p-8 overflow-y-auto bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-repeat opacity-[0.99]">
            <div className="max-w-2xl mx-auto space-y-8">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">Form Settings</h2>
                <p className="text-sm text-slate-400">Manage general settings and behaviors for this form.</p>
              </div>

              <div className="space-y-6">
                <section className="rounded-2xl border border-white/10 bg-[#0A0A0A] p-6 shadow-lg">
                  <h3 className="text-base font-medium text-white mb-4">General</h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-300">Form Title</label>
                      <input
                        type="text"
                        defaultValue={draft.form.title}
                        onBlur={(event) => {
                          const nextTitle = event.target.value.trim();
                          if (nextTitle && nextTitle !== draft.form.title) {
                            void updateForm({
                              formId: draft.form._id,
                              clerkOrgId: orgId ?? null,
                              title: nextTitle,
                            });
                          }
                        }}
                        className="w-full h-10 rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-white focus:border-indigo-500/50 focus:outline-none"
                      />
                    </div>
                  </div>
                </section>

                <section className="rounded-2xl border border-white/10 bg-[#0A0A0A] p-6 shadow-lg">
                  <h3 className="text-base font-medium text-white mb-4">Post-Submission</h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-300">Success Message</label>
                      <textarea
                        rows={3}
                        key={`${draft.form._id}-success-${draft.form.updatedAt}`}
                        defaultValue={draft.form.successMessage ?? ""}
                        placeholder="Thank you for your submission!"
                        onBlur={(event) => {
                          const nextSuccessMessage = event.target.value.trim();
                          if (nextSuccessMessage !== (draft.form.successMessage ?? "")) {
                            void updateForm({
                              formId: draft.form._id,
                              clerkOrgId: orgId ?? null,
                              successMessage: nextSuccessMessage,
                            });
                            setSettingsNotice("Saved post-submit message.");
                            setTimeout(() => setSettingsNotice(null), 4000);
                          }
                        }}
                        className="w-full rounded-lg border border-white/10 bg-white/5 p-3 text-sm text-white placeholder:text-slate-600 focus:border-indigo-500/50 focus:outline-none resize-none"
                      />
                      <p className="text-xs text-slate-500">
                        This message is saved on the form and copied into each published snapshot.
                      </p>
                    </div>
                  </div>
                </section>
                
                <section className="rounded-2xl border border-red-500/20 bg-red-500/5 p-6 shadow-lg">
                  <h3 className="text-base font-medium text-red-400 mb-2">Danger Zone</h3>
                  <p className="text-sm text-slate-400 mb-4">Archiving this form will hide it from your dashboard and disable public access. This action can be undone later.</p>
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          await archiveForm({
                            formId: draft.form._id,
                            clerkOrgId: orgId ?? null,
                          });
                          router.push("/dashboard");
                        } catch (error) {
                          toast.error(getSafeActionMessage(error, "We couldn’t archive this form."));
                        }
                      }}
                      className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-2 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                    >
                      Archive Form
                    </button>
                  {settingsNotice ? (
                    <p className="msg-warning mt-3 text-xs sm:text-sm" role="status">
                      {settingsNotice}
                    </p>
                  ) : null}
                </section>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
