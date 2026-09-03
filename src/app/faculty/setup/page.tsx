"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { apiRequest } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowRight, ArrowLeft } from "lucide-react";

const DESIGNATION_OPTIONS = [
  "Professor", "Associate Professor", "Assistant Professor",
  "HOD", "Dean", "Lecturer", "Visiting Faculty",
];

const FA_AA_OPTIONS = [
  { value: "FA", label: "Faculty Advisor (FA)" },
  { value: "AA", label: "Academic Advisor (AA)" },
  { value: "BOTH", label: "Both" },
  { value: "NEITHER", label: "Neither" },
];

const CAMPUS_OPTIONS = [
  "Kattankulathur (KTR)", "Ramapuram", "Vadapalani",
  "Tiruchirappalli (Trichy)", "NCR Delhi", "Sonepat", "Amaravati",
];

const DEPARTMENT_OPTIONS = [
  "CSE", "ECE", "MECH", "CIVIL", "EEE", "IT",
  "Biotech", "Chemical", "Mathematics", "Physics", "Management", "Others",
];

const DOMAIN_OPTIONS = [
  "Artificial Intelligence & ML", "Deep Learning", "Computer Vision",
  "Natural Language Processing", "Data Science", "Cybersecurity",
  "Cloud Computing", "IoT", "Blockchain", "Robotics & Automation",
  "Quantum Computing", "AR / VR", "Full Stack Development",
  "Web Development", "Mobile Development", "DevOps",
  "Software Engineering", "Computer Networks", "Database Systems",
  "VLSI & Embedded Systems", "Signal Processing", "Bioinformatics",
  "Renewable Energy", "Nanotechnology", "Mathematics", "Physics",
];

const SUBJECT_SUGGESTIONS = [
  "Data Structures & Algorithms", "Operating Systems", "Computer Networks",
  "Database Management", "Software Engineering", "Compiler Design",
  "Machine Learning", "Deep Learning", "Computer Vision", "NLP",
  "Cloud Computing", "Cybersecurity", "Web Technologies",
  "Object Oriented Programming", "Problem Solving", "POE",
  "Digital Electronics", "Signals & Systems", "VLSI Design",
  "Engineering Mathematics", "Applied Physics", "Engineering Chemistry",
  "Robotics", "Embedded Systems", "IoT", "Blockchain",
];

const SKILL_SUGGESTIONS = [
  "Python", "MATLAB", "R", "TensorFlow", "PyTorch", "ROS",
  "React", "Node.js", "AWS", "Docker", "Git", "Java", "C++",
  "Figma", "Tableau", "Power BI", "Excel", "LaTeX",
];

interface FormData {
  fullName: string;
  designation: string;
  faOrAa: string;
  experience: string;
  campus: string;
  department: string;
  domains: string[];
  currentSubjects: string[];
  previousSubjects: string[];
  skills: string[];
}

// ── TAG INPUT ─────────────────────────────────────────────────────────────────

function TagInput({
  label, required, tags, onAdd, onRemove, suggestions, placeholder,
}: {
  label: string; required?: boolean; tags: string[];
  onAdd: (tag: string) => void; onRemove: (tag: string) => void;
  suggestions: string[]; placeholder: string;
}) {
  const [input, setInput] = useState("");
  const [showDrop, setShowDrop] = useState(false);
  const filtered = suggestions.filter(
    (s) => s.toLowerCase().includes(input.toLowerCase()) && !tags.includes(s)
  );

  const sectionHeadingStyle: React.CSSProperties = {
    fontSize: "11px", fontWeight: 700, color: "#6B4B7A",
    textTransform: "uppercase", letterSpacing: "0.8px",
    marginBottom: "4px", paddingTop: "8px",
    borderTop: "1px solid rgba(155,123,176,0.2)",
    display: "block"
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
      <label style={sectionHeadingStyle}>
        {label} {required && <span style={{ color: "#9B7BB0" }}>*</span>}
      </label>

      <div style={{ position: "relative" }}>
        <input
          type="text" value={input}
          onChange={(e) => { setInput(e.target.value); setShowDrop(true); }}
          onFocus={() => setShowDrop(true)}
          onBlur={() => setTimeout(() => setShowDrop(false), 200)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && input.trim()) {
              e.preventDefault(); onAdd(input.trim()); setInput(""); setShowDrop(false);
            }
          }}
          placeholder={placeholder}
          style={{
            width: "100%", height: "44px", padding: "0 14px",
            borderRadius: "12px", border: "1px solid rgba(155,123,176,0.4)",
            background: "rgba(248,245,252,0.9)", color: "#3D2A4A",
            fontSize: "13px", outline: "none", fontFamily: "Inter, sans-serif"
          }}
        />
        {showDrop && input.trim().length > 0 && filtered.length > 0 && (
          <div style={{
            position: "absolute", top: "48px", left: 0, right: 0,
            background: "#EDE8F0", border: "1px solid rgba(155,123,176,0.3)",
            borderRadius: "12px", maxHeight: "160px", overflowY: "auto",
            zIndex: 20, padding: "6px"
          }}>
            {filtered.map((s) => (
              <button key={s} type="button"
                onMouseDown={() => { onAdd(s); setInput(""); setShowDrop(false); }}
                style={{
                  display: "block", width: "100%", textAlign: "left",
                  padding: "8px 12px", borderRadius: "8px", border: "none",
                  background: "transparent", color: "#6B4B7A",
                  fontSize: "12px", fontWeight: 600, cursor: "pointer",
                  fontFamily: "Inter, sans-serif"
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(107,75,122,0.1)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >{s}</button>
            ))}
          </div>
        )}
      </div>

      {/* Suggestion cloud */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "4px" }}>
        {suggestions.filter((s) => !tags.includes(s)).slice(0, 12).map((s) => (
          <button key={s} type="button" onClick={() => onAdd(s)}
            style={{
              padding: "4px 10px", borderRadius: "20px",
              border: "1px solid rgba(155,123,176,0.4)",
              background: "transparent", color: "#9B7BB0",
              fontSize: "11px", fontWeight: 600, cursor: "pointer",
              fontFamily: "Inter, sans-serif", transition: "all 0.15s"
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#6B4B7A"; e.currentTarget.style.color = "#6B4B7A"; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(155,123,176,0.4)"; e.currentTarget.style.color = "#9B7BB0"; }}
          >{s}</button>
        ))}
      </div>

      {/* Added tags */}
      {tags.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "4px" }}>
          <AnimatePresence>
            {tags.map((tag) => (
              <motion.div key={tag}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                style={{
                  display: "inline-flex", alignItems: "center", gap: "6px",
                  padding: "4px 10px", background: "#6B4B7A",
                  borderRadius: "20px", color: "white",
                  fontSize: "11px", fontWeight: 700
                }}
              >
                {tag}
                <button type="button" onClick={() => onRemove(tag)}
                  style={{ background: "none", border: "none", color: "rgba(255,255,255,0.7)", cursor: "pointer", display: "flex", alignItems: "center", padding: 0 }}
                ><X size={11} /></button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

// ── PILL SELECTOR ─────────────────────────────────────────────────────────────

function PillSelector({
  label, options, selected, onSelect, multi = false, required = false, helperText,
}: {
  label: string;
  options: string[] | { value: string; label: string }[];
  selected: string | string[];
  onSelect: (val: string) => void;
  multi?: boolean; required?: boolean; helperText?: string;
}) {
  const isSelected = (val: string) =>
    multi ? (selected as string[]).includes(val) : selected === val;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      <label style={{
        fontSize: "11px", fontWeight: 700, textTransform: "uppercase",
        letterSpacing: "0.8px", color: "#6B4B7A"
      }}>
        {label} {required && <span style={{ color: "#9B7BB0" }}>*</span>}
      </label>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
        {options.map((opt) => {
          const val = typeof opt === "string" ? opt : opt.value;
          const lbl = typeof opt === "string" ? opt : opt.label;
          const active = isSelected(val);
          return (
            <button key={val} type="button" onClick={() => onSelect(val)}
              style={{
                padding: "8px 16px", borderRadius: "20px",
                border: active ? "2px solid #6B4B7A" : "1px solid rgba(196,168,184,0.6)",
                background: active ? "#6B4B7A" : "transparent",
                color: active ? "white" : "#C4A8B8",
                fontSize: "12px", fontWeight: 700, cursor: "pointer",
                transition: "all 0.15s", fontFamily: "Inter, sans-serif"
              }}
            >{lbl}</button>
          );
        })}
      </div>
      {helperText && (
        <p style={{ fontSize: "11px", color: "#C4A8B8", marginTop: "2px" }}>{helperText}</p>
      )}
    </div>
  );
}

// ── MAIN PAGE ─────────────────────────────────────────────────────────────────

export default function FacultySetupPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);

  const [formData, setFormData] = useState<FormData>({
    fullName: "", designation: "", faOrAa: "", experience: "",
    campus: "", department: "", domains: [],
    currentSubjects: [], previousSubjects: [], skills: [],
  });

  useEffect(() => {
    setMounted(true);
    const data = localStorage.getItem("campusconnect_user");
    if (!data) { router.push("/login/faculty"); return; }
    const parsed = JSON.parse(data);
    if (parsed.role !== "faculty") { router.push("/login/faculty"); return; }
    if (!parsed.loggedIn) { router.push("/login/faculty"); return; }
    if (parsed.profileComplete === true) { router.push("/faculty/dashboard"); return; }
    setFormData((prev) => ({ ...prev, fullName: parsed.name || "" }));
    setIsLoading(false);
  }, [router]);

  if (!mounted || isLoading) return null;

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handlePillToggle = (field: keyof FormData, value: string, multi: boolean) => {
    if (multi) {
      setFormData((prev) => {
        const arr = prev[field] as string[];
        return {
          ...prev,
          [field]: arr.includes(value) ? arr.filter((x) => x !== value) : [...arr, value],
        };
      });
    } else {
      setFormData((prev) => ({ ...prev, [field]: value }));
    }
  };

  const addTag = (field: keyof FormData, tag: string) => {
    setFormData((prev) => {
      const arr = prev[field] as string[];
      if (arr.includes(tag)) return prev;
      return { ...prev, [field]: [...arr, tag] };
    });
  };

  const removeTag = (field: keyof FormData, tag: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: (prev[field] as string[]).filter((t) => t !== tag),
    }));
  };

  const isStep1Valid =
    formData.fullName.trim().length > 0 &&
    formData.designation.length > 0 &&
    formData.faOrAa.length > 0 &&
    formData.experience.length > 0 &&
    formData.campus.length > 0 &&
    formData.department.length > 0;

  const isStep2Valid =
    formData.domains.length > 0 && formData.currentSubjects.length > 0;

  const goNext = () => { setDirection(1); setStep((s) => s + 1); };
  const goBack = () => { setDirection(-1); setStep((s) => s - 1); };

  const handleSave = async () => {
    const existing = JSON.parse(localStorage.getItem("campusconnect_user") || "{}");
    if (!existing.empId) {
      alert("Your employee ID is missing from this session. Please sign in again.");
      router.push("/login/faculty");
      return;
    }

    setIsSaving(true);
    try {
      await apiRequest("/profiles/me/faculty", {
        method: "PUT",
        body: JSON.stringify({
          fullName: formData.fullName.trim(),
          employeeId: existing.empId,
          designation: formData.designation || undefined,
          advisorRole: formData.faOrAa || undefined,
          experienceYears: formData.experience ? Number(formData.experience) : undefined,
          campus: formData.campus || undefined,
          department: formData.department || undefined,
          domains: formData.domains,
          currentSubjects: formData.currentSubjects,
          previousSubjects: formData.previousSubjects,
          skills: formData.skills,
        }),
      });

      localStorage.setItem("campusconnect_user", JSON.stringify({
        ...existing,
        profileComplete: true,
        designation: formData.designation,
        campus: formData.campus,
        department: formData.department,
        faOrAa: formData.faOrAa,
        experience: formData.experience,
        domains: formData.domains,
        currentSubjects: formData.currentSubjects,
        previousSubjects: formData.previousSubjects,
        skills: formData.skills,
        name: formData.fullName.trim(),
        fullName: formData.fullName.trim(),
      }));
      router.push("/faculty/dashboard");
    } catch (error) {
      alert(error instanceof Error ? error.message : "Could not save your faculty profile.");
    } finally {
      setIsSaving(false);
    }
  };

  const completionPct = () => {
    let score = 0;
    if (formData.previousSubjects.length > 0) score += 34;
    if (formData.skills.length > 0) score += 33;
    if (formData.domains.length > 1) score += 33;
    return score;
  };

  const variants = {
    enter: (d: number) => ({ x: d > 0 ? 300 : -300, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d: number) => ({ x: d > 0 ? -300 : 300, opacity: 0 }),
  };

  const inputStyle: React.CSSProperties = {
    width: "100%", height: "44px", padding: "0 14px",
    borderRadius: "12px", border: "1px solid rgba(155,123,176,0.4)",
    background: "rgba(248,245,252,0.9)", color: "#3D2A4A",
    fontSize: "13px", outline: "none", fontFamily: "Inter, sans-serif",
    boxSizing: "border-box"
  };

  const selectStyle: React.CSSProperties = {
    ...inputStyle, appearance: "none", cursor: "pointer",
  };

  const labelStyle: React.CSSProperties = {
    fontSize: "11px", fontWeight: 700, textTransform: "uppercase",
    letterSpacing: "0.8px", color: "#6B4B7A",
    marginBottom: "4px", display: "block"
  };

  const domainHeadingStyle: React.CSSProperties = {
    fontSize: "11px", fontWeight: 700, color: "#6B4B7A",
    textTransform: "uppercase", letterSpacing: "0.8px",
    marginBottom: "4px"
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(160deg, #F8F5FC 0%, #EDE8F0 100%)",
      backgroundAttachment: "fixed",
      display: "flex",
      alignItems: "flex-start",
      justifyContent: "center",
      padding: "2rem 1rem",
      fontFamily: "Inter, sans-serif",
      overflowX: "hidden",
      boxSizing: "border-box"
    }}>
      <div style={{
        width: "100%",
        maxWidth: "680px",
        background: "rgba(237,232,240,0.88)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderRadius: "24px",
        border: "1px solid rgba(155,123,176,0.3)",
        padding: "2rem",
        boxShadow: "0 8px 40px rgba(107,75,122,0.12)",
        boxSizing: "border-box",
        overflowX: "hidden"
      }}>

        {/* Progress bar */}
        {step <= 2 && (
          <div style={{ marginBottom: "24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
              <span style={{ fontSize: "11px", fontWeight: 700, color: "#9B7BB0", textTransform: "uppercase", letterSpacing: "1px" }}>
                Step {step} of 2
              </span>
              <span style={{ fontSize: "11px", fontWeight: 700, color: "#9B7BB0" }}>
                {step === 1 ? "50%" : "100%"}
              </span>
            </div>
            <div style={{ height: "4px", borderRadius: "4px", background: "rgba(196,168,184,0.25)" }}>
              <div style={{
                height: "4px", borderRadius: "4px",
                width: step === 1 ? "50%" : "100%",
                background: "#6B4B7A", transition: "width 0.4s ease"
              }} />
            </div>
          </div>
        )}

        {/* Animated step content */}
        <div style={{ overflow: "hidden", minHeight: "400px" }}>
          <AnimatePresence custom={direction} mode="wait">
            <motion.div
              key={step} custom={direction} variants={variants}
              initial="enter" animate="center" exit="exit"
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >

              {/* ── STEP 1 ── */}
              {step === 1 && (
                <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                  <div>
                    <h1 style={{ fontFamily: "Playfair Display, Georgia, serif", fontSize: "28px", fontWeight: 800, color: "#3D2A4A", marginBottom: "4px" }}>
                      Tell us about yourself
                    </h1>
                    <p style={{ fontSize: "13px", color: "#C4A8B8" }}>
                      Basic details to set up your faculty profile
                    </p>
                  </div>

                  <div>
                    <label style={labelStyle}>Full Name <span style={{ color: "#9B7BB0" }}>*</span></label>
                    <input type="text" value={formData.fullName}
                      onChange={(e) => handleChange("fullName", e.target.value)}
                      placeholder="Dr. Sundari M." style={inputStyle}
                    />
                  </div>

                  <PillSelector
                    label="Designation" required
                    options={DESIGNATION_OPTIONS}
                    selected={formData.designation}
                    onSelect={(v) => handleChange("designation", v)}
                  />

                  <PillSelector
                    label="Are you FA or AA?" required
                    options={FA_AA_OPTIONS}
                    selected={formData.faOrAa}
                    onSelect={(v) => handleChange("faOrAa", v)}
                    helperText="FA = Faculty Advisor for student projects · AA = Academic Advisor"
                  />

                  <div>
                    <label style={labelStyle}>Years of Experience <span style={{ color: "#9B7BB0" }}>*</span></label>
                    <input type="number" min={0} max={50} value={formData.experience}
                      onChange={(e) => handleChange("experience", e.target.value)}
                      placeholder="e.g. 8" style={inputStyle}
                    />
                  </div>

                  <div>
                    <label style={labelStyle}>Campus <span style={{ color: "#9B7BB0" }}>*</span></label>
                    <select value={formData.campus}
                      onChange={(e) => handleChange("campus", e.target.value)}
                      style={selectStyle}
                    >
                      <option value="" disabled>Select Campus</option>
                      {CAMPUS_OPTIONS.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>

                  <div>
                    <label style={labelStyle}>Department <span style={{ color: "#9B7BB0" }}>*</span></label>
                    <select value={formData.department}
                      onChange={(e) => handleChange("department", e.target.value)}
                      style={selectStyle}
                    >
                      <option value="" disabled>Select Department</option>
                      {DEPARTMENT_OPTIONS.map((d) => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                </div>
              )}

              {/* ── STEP 2 ── */}
              {step === 2 && (
                <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                  <div>
                    <h1 style={{ fontFamily: "Playfair Display, Georgia, serif", fontSize: "28px", fontWeight: 800, color: "#3D2A4A", marginBottom: "4px" }}>
                      Your expertise
                    </h1>
                    <p style={{ fontSize: "13px", color: "#C4A8B8" }}>
                      Students will discover you based on this information
                    </p>
                  </div>

                  {/* ── DOMAIN SECTION with proper heading ── */}
                  <div>
                    <p style={domainHeadingStyle}>
                      DOMAIN / RESEARCH AREA <span style={{ color: "#9B7BB0" }}>*</span>
                    </p>
                    <p style={{ fontSize: "11px", color: "#C4A8B8", marginBottom: "10px" }}>
                      Select all that apply — students will find you based on these
                    </p>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                      {DOMAIN_OPTIONS.map((d) => {
                        const active = formData.domains.includes(d);
                        return (
                          <button key={d} type="button"
                            onClick={() => handlePillToggle("domains", d, true)}
                            style={{
                              padding: "6px 12px", borderRadius: "20px",
                              border: active ? "2px solid #6B4B7A" : "1px solid rgba(196,168,184,0.5)",
                              background: active ? "#6B4B7A" : "transparent",
                              color: active ? "white" : "#9B7BB0",
                              fontSize: "11px", fontWeight: 600,
                              cursor: "pointer", transition: "all 0.15s",
                              fontFamily: "Inter, sans-serif"
                            }}
                          >{d}</button>
                        );
                      })}
                    </div>
                  </div>

                  <TagInput
                    label="Subjects Currently Teaching" required
                    tags={formData.currentSubjects}
                    onAdd={(t) => addTag("currentSubjects", t)}
                    onRemove={(t) => removeTag("currentSubjects", t)}
                    suggestions={SUBJECT_SUGGESTIONS}
                    placeholder="Type subject and press Enter..."
                  />

                  <TagInput
                    label="Subjects Previously Taught (Optional)"
                    tags={formData.previousSubjects}
                    onAdd={(t) => addTag("previousSubjects", t)}
                    onRemove={(t) => removeTag("previousSubjects", t)}
                    suggestions={SUBJECT_SUGGESTIONS.filter((s) => !formData.currentSubjects.includes(s))}
                    placeholder="Type subject and press Enter..."
                  />

                  <TagInput
                    label="Technical Skills (Optional)"
                    tags={formData.skills}
                    onAdd={(t) => addTag("skills", t)}
                    onRemove={(t) => removeTag("skills", t)}
                    suggestions={SKILL_SUGGESTIONS}
                    placeholder="Type skill and press Enter..."
                  />
                </div>
              )}

              {/* ── STEP 3 — Profile Preview ── */}
              {step === 3 && (
                <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                  <div style={{
                    display: "flex", alignItems: "center", gap: "20px",
                    paddingBottom: "20px",
                    borderBottom: "1px solid rgba(155,123,176,0.2)"
                  }}>
                    {/* Completion ring */}
                    <div style={{ position: "relative", flexShrink: 0 }}>
                      {(() => {
                        const pct = completionPct();
                        const r = 42;
                        const circ = 2 * Math.PI * r;
                        const offset = circ - (pct / 100) * circ;
                        return (
                          <>
                            <svg width="96" height="96" style={{ transform: "rotate(-90deg)" }}>
                              <circle cx="48" cy="48" r={r} stroke="rgba(196,168,184,0.2)" strokeWidth="6" fill="transparent" />
                              <circle cx="48" cy="48" r={r} stroke="#9B7BB0" strokeWidth="6" fill="transparent"
                                strokeDasharray={circ} strokeDashoffset={offset}
                                strokeLinecap="round"
                                style={{ transition: "stroke-dashoffset 0.5s ease" }}
                              />
                            </svg>
                            <div style={{
                              position: "absolute", inset: 0,
                              display: "flex", flexDirection: "column",
                              alignItems: "center", justifyContent: "center"
                            }}>
                              <span style={{ fontFamily: "Playfair Display, Georgia, serif", fontSize: "18px", fontWeight: 900, color: "#3D2A4A" }}>
                                {pct}%
                              </span>
                              <span style={{ fontSize: "8px", fontWeight: 700, color: "#9B7BB0", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                                Complete
                              </span>
                            </div>
                          </>
                        );
                      })()}
                    </div>
                    <div>
                      <h1 style={{ fontFamily: "Playfair Display, Georgia, serif", fontSize: "26px", fontWeight: 800, color: "#3D2A4A", marginBottom: "4px" }}>
                        Ready to go!
                      </h1>
                      <p style={{ fontSize: "12px", color: "#C4A8B8" }}>
                        Review your profile before saving
                      </p>
                    </div>
                  </div>

                  {/* Profile preview */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "14px", maxHeight: "320px", overflowY: "auto", paddingRight: "4px" }}>

                    {/* Basic info card */}
                    <div style={{ background: "rgba(255,255,255,0.85)", borderRadius: "16px", padding: "16px", border: "1px solid rgba(155,123,176,0.2)" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "10px" }}>
                        <div style={{ width: "44px", height: "44px", borderRadius: "50%", background: "#6B4B7A", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px", fontWeight: 700, flexShrink: 0 }}>
                          {formData.fullName.charAt(0) || "F"}
                        </div>
                        <div>
                          <div style={{ fontFamily: "Playfair Display, Georgia, serif", fontSize: "18px", fontWeight: 700, color: "#3D2A4A" }}>
                            {formData.fullName}
                          </div>
                          <div style={{ fontSize: "11px", color: "#9B7BB0" }}>
                            {formData.designation} · {formData.department} · {formData.campus}
                          </div>
                        </div>
                      </div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                        <span style={{ background: "#6B4B7A", color: "white", fontSize: "10px", fontWeight: 700, padding: "2px 8px", borderRadius: "20px" }}>
                          {formData.faOrAa}
                        </span>
                        <span style={{ background: "rgba(107,75,122,0.1)", color: "#6B4B7A", fontSize: "10px", fontWeight: 700, padding: "2px 8px", borderRadius: "20px" }}>
                          {formData.experience} years exp.
                        </span>
                      </div>
                    </div>

                    {/* Domains */}
                    {formData.domains.length > 0 && (
                      <div>
                        <div style={{ fontSize: "10px", fontWeight: 700, color: "#9B7BB0", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: "6px" }}>
                          Domains
                        </div>
                        <div style={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: "8px",
                          maxWidth: "100%",
                          overflowX: "hidden"
                        }}>
                          {formData.domains.map((d) => (
                            <span key={d} style={{ background: "#6B4B7A", color: "white", fontSize: "10px", fontWeight: 600, padding: "3px 8px", borderRadius: "20px" }}>
                              {d}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Currently Teaching */}
                    {formData.currentSubjects.length > 0 && (
                      <div>
                        <div style={{ fontSize: "10px", fontWeight: 700, color: "#9B7BB0", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: "6px" }}>
                          Currently Teaching
                        </div>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
                          {formData.currentSubjects.map((s) => (
                            <span key={s} style={{ background: "#EDE8F0", color: "#6B4B7A", fontSize: "10px", fontWeight: 600, padding: "3px 8px", borderRadius: "20px", border: "1px solid rgba(155,123,176,0.3)" }}>
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Skills */}
                    {formData.skills.length > 0 && (
                      <div>
                        <div style={{ fontSize: "10px", fontWeight: 700, color: "#9B7BB0", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: "6px" }}>
                          Technical Skills
                        </div>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
                          {formData.skills.map((s) => (
                            <span key={s} style={{ background: "#C4A8B8", color: "#3D2A4A", fontSize: "10px", fontWeight: 600, padding: "3px 8px", borderRadius: "20px" }}>
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer navigation */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          borderTop: "1px solid rgba(155,123,176,0.2)",
          paddingTop: "20px", marginTop: "24px",
          flexWrap: "wrap", gap: "12px"
        }}>
          {step > 1 ? (
            <button type="button" onClick={goBack}
              style={{
                padding: "10px 20px", borderRadius: "12px",
                border: "1px solid #9B7BB0",
                background: "transparent", color: "#6B4B7A",
                fontSize: "13px", fontWeight: 700, cursor: "pointer",
                display: "flex", alignItems: "center", gap: "6px",
                fontFamily: "Inter, sans-serif"
              }}
            >
              <ArrowLeft size={14} />
              {step === 3 ? "Edit Profile" : "Back"}
            </button>
          ) : <div />}

          {step === 1 && (
            <button type="button" onClick={goNext} disabled={!isStep1Valid}
              style={{
                padding: "10px 24px", borderRadius: "12px", border: "none",
                background: isStep1Valid ? "#6B4B7A" : "rgba(107,75,122,0.3)",
                color: "white", fontSize: "13px", fontWeight: 700,
                cursor: isStep1Valid ? "pointer" : "not-allowed",
                display: "flex", alignItems: "center", gap: "6px",
                fontFamily: "Inter, sans-serif", transition: "all 0.2s"
              }}
            >
              Next <ArrowRight size={14} />
            </button>
          )}

          {step === 2 && (
            <button type="button" onClick={goNext} disabled={!isStep2Valid}
              style={{
                padding: "10px 24px", borderRadius: "12px", border: "none",
                background: isStep2Valid ? "#6B4B7A" : "rgba(107,75,122,0.3)",
                color: "white", fontSize: "13px", fontWeight: 700,
                cursor: isStep2Valid ? "pointer" : "not-allowed",
                display: "flex", alignItems: "center", gap: "6px",
                fontFamily: "Inter, sans-serif", transition: "all 0.2s"
              }}
            >
              View Profile Preview <ArrowRight size={14} />
            </button>
          )}

          {step === 3 && (
            <button type="button" onClick={handleSave} disabled={isSaving}
              style={{
                padding: "12px 28px", borderRadius: "12px", border: "none",
                background: "#6B4B7A", color: "white",
                fontSize: "14px", fontWeight: 700, cursor: "pointer",
                display: "flex", alignItems: "center", gap: "6px",
                fontFamily: "Inter, sans-serif", transition: "all 0.2s"
              }}
            >
              Save & Go to Dashboard <ArrowRight size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
