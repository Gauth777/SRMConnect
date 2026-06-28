"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Eye, X } from "lucide-react";
import {
  POSTS_STORAGE_KEY,
  POST_TYPE_OPTIONS,
  PROJECT_DOMAIN_OPTIONS,
  PROJECT_MODE_OPTIONS,
  REQUIRED_DOC_OPTIONS,
  SKILL_LEVEL_OPTIONS,
  getInitials,
  readFacultyUser,
  safeParseJson,
  writeFacultyPosts,
  type FacultyPostRecord,
} from "@/components/faculty/faculty-data";

type PostType = (typeof POST_TYPE_OPTIONS)[number]["value"];

interface ToastState {
  message: string;
  type: "success" | "error";
}

interface CreatePostFormState {
  postType: PostType | "";
  title: string;
  domain: string;
  description: string;
  mode: string;
  skills: string[];
  skillLevel: string;
  slots: string;
  duration: string;
  deadline: string;
  additionalRequirements: string;
  requiredDocs: string[];
}

const SKILL_SUGGESTIONS = [
  "Python", "JavaScript", "React", "Node.js", "TensorFlow", "PyTorch",
  "Machine Learning", "Computer Vision", "NLP", "SQL", "MongoDB",
  "AWS", "Docker", "Git", "C++", "Java", "ROS", "DSA", "MATLAB",
  "Flutter", "Figma", "Cybersecurity", "Blockchain", "Solidity",
] as const;

const DEFAULT_FORM: CreatePostFormState = {
  postType: "",
  title: "",
  domain: "",
  description: "",
  mode: "",
  skills: [],
  skillLevel: "",
  slots: "",
  duration: "",
  deadline: "",
  additionalRequirements: "",
  requiredDocs: ["resume"],
};

function TagEditor({
  label,
  value,
  onChange,
  suggestions,
  placeholder,
  chipClassName,
}: {
  label: string;
  value: string[];
  onChange: (nextValue: string[]) => void;
  suggestions: readonly string[];
  placeholder: string;
  chipClassName: string;
}) {
  const [inputValue, setInputValue] = useState("");

  const addTag = (candidate: string) => {
    const trimmed = candidate.trim();
    if (!trimmed) return;
    if (value.some((tag) => tag.toLowerCase() === trimmed.toLowerCase())) return;
    onChange([...value, trimmed]);
    setInputValue("");
  };

  return (
    <div className="space-y-3">
      <label className="text-sm font-semibold text-[#3A1A1A]">{label}</label>
      <div className="flex flex-wrap gap-2">
        {value.map((tag) => (
          <button
            key={tag}
            type="button"
            onClick={() => onChange(value.filter((item) => item !== tag))}
            className={chipClassName}
          >
            <span>{tag}</span>
            <span aria-hidden="true">×</span>
          </button>
        ))}
      </div>
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") { e.preventDefault(); addTag(inputValue); }
          }}
          placeholder={placeholder}
          className="h-12 flex-1 rounded-xl border border-[#EFA79A]/40 bg-white/90 px-4 text-sm text-[#3A1A1A] placeholder:text-[#D1CDB2] outline-none focus:border-[#E06C6B] focus:ring-2 focus:ring-[#E06C6B]/25"
        />
        <button
          type="button"
          onClick={() => addTag(inputValue)}
          className="h-12 rounded-xl border border-[#E06C6B] px-4 text-sm font-semibold text-[#9A1A1B] transition hover:bg-[#FBD4CF]"
        >
          Add
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {suggestions.map((suggestion) => {
          const active = value.some((tag) => tag.toLowerCase() === suggestion.toLowerCase());
          return (
            <button
              key={suggestion}
              type="button"
              onClick={() => addTag(suggestion)}
              className={`rounded-full border px-3 py-1.5 text-sm transition ${active
                  ? "border-[#E06C6B] bg-[#EFA79A]/20 text-[#3A1A1A]"
                  : "border-[#EFA79A] text-[#677661] hover:border-[#E06C6B]"
                }`}
            >
              {suggestion}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function FacultyCreatePostPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<CreatePostFormState>(DEFAULT_FORM);
  const [toast, setToast] = useState<ToastState | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const user = readFacultyUser();
    if (!user) { router.push("/login/faculty"); return; }
    if (user.role !== "faculty" || !user.loggedIn) { router.push("/login/faculty"); return; }
    if (user.profileComplete === false) { router.push("/faculty/setup"); return; }

    const storedDraft = safeParseJson<CreatePostFormState | null>(
      localStorage.getItem("campusconnect_post_draft"),
      null
    );
    if (storedDraft) {
      setFormData({
        ...DEFAULT_FORM,
        ...storedDraft,
        requiredDocs: storedDraft.requiredDocs?.length ? storedDraft.requiredDocs : ["resume"],
      });
    }
  }, [router]);

  const compulsoryValid = useMemo(() => {
    const titleValid = formData.title.trim().length > 0 && formData.title.trim().length <= 100;
    const descLen = formData.description.trim().length;
    const descValid = descLen >= 50 && descLen <= 500;
    return (
      Boolean(formData.postType) &&
      titleValid &&
      Boolean(formData.domain) &&
      descValid &&
      Boolean(formData.mode) &&
      formData.skills.length > 0 &&
      Boolean(formData.skillLevel) &&
      Number(formData.slots) >= 1 &&
      Number(formData.slots) <= 20 &&
      Boolean(formData.duration) &&
      Boolean(formData.deadline)
    );
  }, [formData]);

  if (!mounted) return null;

  const user = readFacultyUser();

  const postTypeCard = (option: (typeof POST_TYPE_OPTIONS)[number]) => {
    const active = formData.postType === option.value;
    const [emoji, ...labelParts] = option.label.split(" ");
    return (
      <motion.button
        key={option.value}
        type="button"
        whileTap={{ scale: 0.98 }}
        onClick={() => setFormData((cur) => ({ ...cur, postType: option.value }))}
        className={`rounded-xl border p-4 text-center transition ${active
            ? "scale-[1.02] border-2 border-[#9A1A1B] bg-[#9A1A1B]/10 text-[#9A1A1B]"
            : "border-[#EFA79A]/40 bg-white text-[#677661]"
          }`}
      >
        <div className="text-2xl">{emoji}</div>
        <div className="mt-2 text-sm font-semibold">{labelParts.join(" ")}</div>
      </motion.button>
    );
  };

  const toggleRequiredDoc = (value: string) => {
    if (value === "resume") return; // always required
    setFormData((cur) => ({
      ...cur,
      requiredDocs: cur.requiredDocs.includes(value)
        ? cur.requiredDocs.filter((item) => item !== value)
        : [...cur.requiredDocs, value],
    }));
  };

  const saveDraft = () => {
    localStorage.setItem("campusconnect_post_draft", JSON.stringify(formData));
    setToast({ message: "Draft saved successfully!", type: "success" });
    setTimeout(() => setToast(null), 3000);
  };

  const publishPost = () => {
    if (!compulsoryValid) {
      setToast({ message: "Please complete all required fields.", type: "error" });
      setTimeout(() => setToast(null), 3000);
      return;
    }

    const existingPosts = safeParseJson<FacultyPostRecord[]>(
      localStorage.getItem(POSTS_STORAGE_KEY),
      []
    );
    const userData = readFacultyUser();

    const typeMap: Record<PostType, FacultyPostRecord["type"]> = {
      project: "project",
      hackathon: "hackathon",
      research: "research",
      inhouse: "project",
      "guest-lecture": "research",
      workshop: "project",
    };

    const nextPost: FacultyPostRecord = {
      id: Date.now(),
      type: typeMap[formData.postType as PostType],
      postType: formData.postType || "project",
      faculty: userData?.name || "Faculty",
      dept: userData?.department || "CSE",
      campus: userData?.campus || "KTR",
      time: "Just now",
      title: formData.title,
      description: formData.description,
      skills: formData.skills,
      domain: formData.domain,
      duration: formData.duration,
      slots: Number(formData.slots),
      remaining: Number(formData.slots),
      deadline: formData.deadline,
      mode: formData.mode,
      skillLevel: formData.skillLevel,
      compatibility: Math.floor(Math.random() * 30) + 65,
      status: "open",
      createdAt: new Date().toISOString(),
      requiredDocs: formData.requiredDocs,
      additionalRequirements: formData.additionalRequirements,
    };

    writeFacultyPosts([nextPost, ...existingPosts]);
    localStorage.removeItem("campusconnect_post_draft");
    setToast({ message: "Post published! Students can now see it.", type: "success" });
    window.setTimeout(() => router.push("/faculty/dashboard"), 1500);
  };

  return (
    <div className="min-h-screen bg-[#FBD4CF] px-4 py-8 text-[#3A1A1A] sm:px-6 lg:px-8">

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 40 }}
            className={`fixed right-4 top-4 z-50 flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold text-white shadow-lg ${toast.type === "success" ? "bg-[#677661]" : "bg-[#9A1A1B]"
              }`}
          >
            <span>{toast.message}</span>
            <button
              type="button"
              onClick={() => setToast(null)}
              className="rounded-full bg-white/20 p-1"
            >
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main card */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mx-auto w-full max-w-[720px] rounded-[24px] border border-[#EFA79A]/30 bg-[rgba(255,255,255,0.88)] p-5 shadow-[0_24px_60px_rgba(58,26,26,0.08)] backdrop-blur-[16px] sm:p-10"
      >
        {/* Header */}
        <div className="space-y-2">
          <h1 className="font-['Playfair_Display'] text-4xl font-semibold text-[#3A1A1A]">
            Create a New Post
          </h1>
          <p className="text-sm text-[#677661]">Share an opportunity with students</p>
        </div>

        {/* Post Type */}
        <section className="mt-8 space-y-4">
          <p className="text-sm font-bold text-[#3A1A1A]">What are you posting?</p>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
            {POST_TYPE_OPTIONS.map((option) => postTypeCard(option))}
          </div>
        </section>

        {/* Basic Details */}
        <section className="mt-8 space-y-5">
          <Divider label="Basic Details" color="#E06C6B" />

          <Field label="Post Title *">
            <input
              value={formData.title}
              maxLength={100}
              onChange={(e) => setFormData((cur) => ({ ...cur, title: e.target.value }))}
              placeholder="e.g. AI-based Traffic Optimization System"
              className="h-12 w-full rounded-xl border border-[#EFA79A]/40 bg-white/90 px-4 text-sm text-[#3A1A1A] placeholder:text-[#D1CDB2] outline-none transition focus:border-[#E06C6B] focus:ring-2 focus:ring-[#E06C6B]/25"
            />
            <p className="text-right text-[11px] text-[#677661]">{formData.title.length}/100</p>
          </Field>

          <Field label="Project Domain *">
            <select
              value={formData.domain}
              onChange={(e) => setFormData((cur) => ({ ...cur, domain: e.target.value }))}
              className="h-12 w-full rounded-xl border border-[#EFA79A]/40 bg-white/90 px-4 text-sm text-[#3A1A1A] outline-none focus:border-[#E06C6B] focus:ring-2 focus:ring-[#E06C6B]/25"
            >
              <option value="">Select a domain</option>
              {PROJECT_DOMAIN_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </Field>

          <Field label="Description *">
            <textarea
              value={formData.description}
              maxLength={500}
              onChange={(e) => setFormData((cur) => ({ ...cur, description: e.target.value }))}
              placeholder="Describe what students will work on and learn..."
              className="min-h-[140px] w-full rounded-xl border border-[#EFA79A]/40 bg-white/90 px-4 py-3 text-sm text-[#3A1A1A] placeholder:text-[#D1CDB2] outline-none transition focus:border-[#E06C6B] focus:ring-2 focus:ring-[#E06C6B]/25"
            />
            <p className="text-right text-[11px] text-[#677661]">{formData.description.length}/500</p>
          </Field>

          <Field label="Project Mode *">
            <div className="flex flex-wrap gap-2">
              {PROJECT_MODE_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setFormData((cur) => ({ ...cur, mode: opt }))}
                  className={`rounded-full border px-4 py-2 text-sm font-medium transition ${formData.mode === opt
                      ? "border-[#9A1A1B] bg-[#9A1A1B] text-white"
                      : "border-[#EFA79A] text-[#677661] hover:border-[#9A1A1B]"
                    }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </Field>
        </section>

        {/* Student Requirements */}
        <section className="mt-8 space-y-5">
          <Divider label="Student Requirements" color="#677661" />

          <TagEditor
            label="Skills Required *"
            value={formData.skills}
            onChange={(next) => setFormData((cur) => ({ ...cur, skills: next }))}
            suggestions={SKILL_SUGGESTIONS}
            placeholder="Type a skill and press Enter"
            chipClassName="inline-flex items-center gap-2 rounded-full border border-[#E06C6B] bg-[#EFA79A]/20 px-3 py-1.5 text-sm font-medium text-[#3A1A1A]"
          />
          <p className="text-[11px] text-[#677661]">Minimum 1 required</p>

          <Field label="Skill Level Expected *">
            <div className="flex flex-wrap gap-2">
              {SKILL_LEVEL_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setFormData((cur) => ({ ...cur, skillLevel: opt }))}
                  className={`rounded-full border px-4 py-2 text-sm font-medium transition ${formData.skillLevel === opt
                      ? "border-[#9A1A1B] bg-[#9A1A1B] text-white"
                      : "border-[#EFA79A] text-[#677661] hover:border-[#9A1A1B]"
                    }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </Field>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Number of Students *">
              <input
                type="number"
                min={1}
                max={20}
                value={formData.slots}
                onChange={(e) => setFormData((cur) => ({ ...cur, slots: e.target.value }))}
                placeholder="e.g. 4"
                className="h-12 w-full rounded-xl border border-[#EFA79A]/40 bg-white/90 px-4 text-sm text-[#3A1A1A] placeholder:text-[#D1CDB2] outline-none transition focus:border-[#E06C6B] focus:ring-2 focus:ring-[#E06C6B]/25"
              />
            </Field>

            <Field label="Project Duration *">
              <select
                value={formData.duration}
                onChange={(e) => setFormData((cur) => ({ ...cur, duration: e.target.value }))}
                className="h-12 w-full rounded-xl border border-[#EFA79A]/40 bg-white/90 px-4 text-sm text-[#3A1A1A] outline-none focus:border-[#E06C6B] focus:ring-2 focus:ring-[#E06C6B]/25"
              >
                <option value="">Select duration</option>
                {["2 weeks", "1 month", "2 months", "3 months", "6 months", "1 year", "Ongoing"].map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </Field>
          </div>

          <Field label="Application Deadline *">
            <input
              type="date"
              min={new Date().toISOString().slice(0, 10)}
              value={formData.deadline}
              onChange={(e) => setFormData((cur) => ({ ...cur, deadline: e.target.value }))}
              className="h-12 w-full rounded-xl border border-[#EFA79A]/40 bg-white/90 px-4 text-sm text-[#3A1A1A] outline-none transition focus:border-[#E06C6B] focus:ring-2 focus:ring-[#E06C6B]/25"
            />
          </Field>

          <Field label="Additional Requirements (optional)">
            <textarea
              value={formData.additionalRequirements}
              maxLength={300}
              onChange={(e) => setFormData((cur) => ({ ...cur, additionalRequirements: e.target.value }))}
              placeholder="e.g. Prior ML experience preferred, basic linear algebra knowledge required"
              className="min-h-[120px] w-full rounded-xl border border-[#EFA79A]/40 bg-white/90 px-4 py-3 text-sm text-[#3A1A1A] placeholder:text-[#D1CDB2] outline-none transition focus:border-[#E06C6B] focus:ring-2 focus:ring-[#E06C6B]/25"
            />
          </Field>
        </section>

        {/* What should students submit */}
        <section className="mt-8 space-y-5">
          <Divider label="What should students submit?" color="#9A1A1B" />
          <div className="flex flex-wrap gap-2">
            {REQUIRED_DOC_OPTIONS.map((option) => {
              const active = formData.requiredDocs.includes(option.value);
              const locked = Boolean(option.locked);
              return (
                <button
                  key={option.value}
                  type="button"
                  disabled={locked}
                  onClick={() => toggleRequiredDoc(option.value)}
                  className={`rounded-full border px-4 py-2 text-sm font-medium transition ${active
                      ? "border-[#9A1A1B] bg-[#9A1A1B] text-white"
                      : "border-[#EFA79A] text-[#677661] hover:border-[#9A1A1B]"
                    } ${locked ? "cursor-not-allowed opacity-90" : ""}`}
                >
                  {locked && active && <span className="mr-1 text-[10px]">🔒</span>}
                  {option.label}
                  {locked && (
                    <span className="ml-1 rounded-full bg-white/30 px-1.5 py-0.5 text-[9px]">
                      Required
                    </span>
                  )}
                </button>
              );
            })}
          </div>
          <p className="text-[11px] text-[#677661]">
            🔒 Resume is always required. Other documents are optional.
          </p>
        </section>

        {/* Action buttons */}
        <div className="mt-8 grid gap-3 sm:grid-cols-3">
          <button
            type="button"
            onClick={saveDraft}
            className="rounded-xl border border-[#677661] px-4 py-3 text-sm font-semibold text-[#677661] transition hover:bg-[#FBD4CF]"
          >
            Save as Draft
          </button>
          <button
            type="button"
            onClick={() => setShowPreview(true)}
            className="rounded-xl border border-[#E06C6B] px-4 py-3 text-sm font-semibold text-[#9A1A1B] transition hover:bg-[#FBD4CF]"
          >
            <span className="inline-flex items-center gap-2">
              Preview <Eye className="h-4 w-4" />
            </span>
          </button>
          <button
            type="button"
            disabled={!compulsoryValid}
            onClick={publishPost}
            className="rounded-xl bg-[#9A1A1B] px-4 py-3 text-sm font-semibold text-white transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Post Now <ArrowRight className="inline h-4 w-4" />
          </button>
        </div>
      </motion.div>

      {/* Preview Modal */}
      <AnimatePresence>
        {showPreview && (
          <motion.div
            className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              className="w-full max-w-2xl rounded-[24px] border border-[#EFA79A]/30 bg-[#FBD4CF] p-5 shadow-2xl"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-[#677661]">Student feed preview</p>
                  <h3 className="font-['Playfair_Display'] text-3xl font-semibold text-[#3A1A1A]">
                    {formData.title || "Preview title"}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowPreview(false)}
                  className="rounded-full border border-[#EFA79A] p-2 text-[#9A1A1B]"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-5 rounded-[18px] border border-[#EFA79A]/40 bg-white/90 p-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#9A1A1B] text-sm font-semibold text-white">
                    {getInitials(user?.name || "Faculty")}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#3A1A1A]">{user?.name || "Faculty"}</p>
                    <p className="text-xs text-[#677661]">
                      {user?.department || "CSE"} · {user?.campus || "KTR"}
                    </p>
                  </div>
                </div>
                <p className="mt-3 text-sm text-[#3A1A1A]">
                  {formData.description || "Your opportunity description will appear here."}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {formData.skills.slice(0, 5).map((skill) => (
                    <span
                      key={skill}
                      className="rounded-full border border-[#E06C6B] bg-[#EFA79A]/20 px-3 py-1 text-xs font-semibold text-[#3A1A1A]"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-[#677661]">
                  <span>{formData.duration || "Duration"}</span>
                  <span>{formData.mode || "Mode"}</span>
                  <span>{formData.skillLevel || "Skill level"}</span>
                </div>
              </div>

              <div className="mt-5 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowPreview(false)}
                  className="rounded-xl border border-[#677661] px-4 py-2 text-sm font-semibold text-[#677661]"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => { setShowPreview(false); publishPost(); }}
                  className="rounded-xl bg-[#9A1A1B] px-4 py-2 text-sm font-semibold text-white"
                >
                  Post Now
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-semibold text-[#3A1A1A]">{label}</label>
      {children}
    </div>
  );
}

function Divider({ label, color }: { label: string; color: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="h-px flex-1 bg-black/10" />
      <span className="text-sm font-semibold" style={{ color }}>{label}</span>
      <div className="h-px flex-1 bg-black/10" />
    </div>
  );
}
