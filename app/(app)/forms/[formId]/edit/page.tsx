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
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo, useState } from "react";

import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
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
  const params = useParams<{ formId: string }>();
  const { isLoaded, orgId } = useAuth();
  const formId = params.formId as Id<"forms">;
  const draft = useQuery(
    api.forms.getDraft,
    isLoaded ? { formId, clerkOrgId: orgId ?? null } : "skip",
  );
  const updateForm = useMutation(api.forms.updateDraft);
  const publishForm = useMutation(api.formSnapshots.publish);
  const addField = useMutation(api.formFields.addField);
  const updateField = useMutation(api.formFields.updateField);
  const removeField = useMutation(api.formFields.removeField);
  const [activeTab, setActiveTab] = useState("build");
  const [selectedFieldId, setSelectedFieldId] = useState<Id<"formFields"> | null>(null);
  const [publishState, setPublishState] = useState<"idle" | "publishing" | "success" | "error">(
    "idle",
  );
  const [publishMessage, setPublishMessage] = useState<string | null>(null);
  const fields = useMemo(() => draft?.fields ?? [], [draft?.fields]);
  const resolvedSelectedFieldId =
    selectedFieldId && fields.some((field) => field._id === selectedFieldId)
      ? selectedFieldId
      : (fields[0]?._id ?? null);
  const selectedField = useMemo(
    () => fields.find((field) => field._id === resolvedSelectedFieldId) ?? null,
    [fields, resolvedSelectedFieldId],
  );

  if (draft === undefined) {
    return (
      <div className="flex h-[calc(100vh-8rem)] items-center justify-center rounded-2xl border border-white/10 bg-[#050505] text-sm text-slate-400">
        Loading form builder...
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

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#050505] shadow-2xl">
      <header className="flex h-14 items-center justify-between border-b border-white/10 bg-white/[0.02] px-4">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard"
            className="-ml-2 rounded-lg p-2 text-slate-400 transition-colors hover:bg-white/5 hover:text-white"
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
              className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                activeTab === "build"
                  ? "bg-white/10 text-white shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Build
            </button>
            <button
              onClick={() => setActiveTab("settings")}
              className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                activeTab === "settings"
                  ? "bg-white/10 text-white shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Settings
            </button>
          </div>

          <div className="mx-2 h-4 w-px bg-white/10" />

          <button className="inline-flex h-8 items-center gap-2 rounded-lg px-3 text-xs font-medium text-slate-300 transition-colors hover:bg-white/5 hover:text-white">
            <Eye className="h-3.5 w-3.5" />
            Preview
          </button>
          <button
            type="button"
            onClick={() => {
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
                  setPublishMessage(
                    error instanceof Error ? error.message : "Unable to publish this form.",
                  );
                });
            }}
            disabled={publishState === "publishing"}
            className="inline-flex h-8 items-center gap-2 rounded-lg bg-white px-4 text-xs font-medium text-black transition-transform hover:scale-105 disabled:cursor-not-allowed disabled:opacity-70"
          >
            <Send className="h-3.5 w-3.5" />
            {publishState === "publishing" ? "Publishing..." : "Publish"}
          </button>
        </div>
      </header>

      {publishMessage ? (
        <div
          className={`border-b px-4 py-2 text-xs ${
            publishState === "error"
              ? "border-red-500/10 bg-red-500/5 text-red-300"
              : "border-emerald-500/10 bg-emerald-500/5 text-emerald-300"
          }`}
        >
          {publishMessage}
        </div>
      ) : null}

      <div className="flex flex-1 overflow-hidden">
        <aside className="flex w-64 flex-col border-r border-white/10 bg-white/[0.01]">
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
                    onClick={() =>
                      void addField({
                        formId: draft.form._id,
                        clerkOrgId: orgId ?? null,
                        type,
                      }).then((field) => setSelectedFieldId(field._id))
                    }
                    className="group flex flex-col items-center justify-center gap-2 rounded-xl border border-white/5 bg-white/[0.02] p-3 transition-all hover:border-white/10 hover:bg-white/[0.06]"
                  >
                    <Icon className="h-5 w-5 text-slate-400 transition-colors group-hover:text-indigo-400" />
                    <span className="text-[10px] font-medium text-slate-300">
                      {FORM_FIELD_TYPE_LABELS[type]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </aside>

        <main className="flex-1 overflow-y-auto bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-repeat p-8 opacity-[0.99]">
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
                  className={`group relative flex cursor-pointer gap-3 rounded-2xl border p-5 transition-all ${
                    resolvedSelectedFieldId === field._id
                      ? "border-indigo-500/50 bg-white/5 shadow-[0_0_20px_rgba(99,102,241,0.1)]"
                      : "border-white/10 bg-[#0A0A0A] hover:border-white/20"
                  }`}
                >
                  <div className="mt-1 cursor-grab opacity-0 transition-opacity group-hover:opacity-100">
                    <GripVertical className="h-4 w-4 text-slate-500" />
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
                        className="rounded-lg border border-white/10 bg-white/5 p-2 text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
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
              onClick={() =>
                void addField({
                  formId: draft.form._id,
                  clerkOrgId: orgId ?? null,
                  type: "text",
                }).then((field) => setSelectedFieldId(field._id))
              }
              className="mt-8 flex w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-white/10 py-6 text-slate-400 transition-all hover:border-indigo-500/50 hover:bg-indigo-500/5 hover:text-indigo-400"
            >
              <Plus className="h-6 w-6" />
              <span className="text-sm font-medium">Add New Field</span>
            </button>
          </div>
        </main>

        <aside className="flex w-80 flex-col border-l border-white/10 bg-white/[0.01]">
          {selectedField ? (
            <div className="space-y-6 p-6">
              <div>
                <h3 className="mb-4 text-xs font-mono uppercase tracking-wider text-slate-500">
                  Field Properties
                </h3>
                <div className="space-y-4">
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

                  <div className="border-t border-white/10 pt-4">
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
                        className={`relative h-5 w-9 rounded-full transition-colors ${
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
      </div>
    </div>
  );
}
