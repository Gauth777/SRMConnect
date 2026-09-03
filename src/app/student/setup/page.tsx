"use client";

import "./setup.css";
import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { apiRequest } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import {
  Globe,
  UploadCloud,
  FileText,
  Trash2,
  X,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  ChevronDown,
} from "lucide-react";

const GithubIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={props.className}
  >
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

const LinkedinIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={props.className}
  >
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

const PRELOADED_SKILLS = [
  "Python", "JavaScript", "React", "Node.js", "C++", "Java",
  "Machine Learning", "Deep Learning", "SQL", "MongoDB",
  "Flutter", "Figma", "AWS", "Docker", "Git", "TypeScript",
  "Cybersecurity", "Data Analysis", "TensorFlow", "Django",
];

const PRELOADED_INTERESTS = [
  "Web Development", "AI / ML", "Cybersecurity", "IoT",
  "Blockchain", "Data Science", "Cloud Computing",
  "Research", "Open Source", "Competitive Programming",
  "Robotics", "AR / VR", "Mobile Development",
];

const PROJECT_TYPES = ["Academic", "Hackathon", "Research", "Startup"];

const ROLES = [
  "Frontend Dev", "Backend Dev", "Full Stack", "ML Engineer",
  "UI/UX Designer", "DevOps", "Researcher", "Data Analyst",
];

interface Skill {
  name: string;
  level: "Beginner" | "Intermediate" | "Advanced";
}

interface SetupFormData {
  fullName: string;
  phoneNumber: string;
  dob: string;
  gender: string;
  bio: string;
  department: string;
  program: string;
  specialization: string;
  currentYear: string;
  cgpa: string;
  batch: string;
  skills: Skill[];
  interests: string[];
  projectTypes: string[];
  preferredRoles: string[];
  careerGoal: string;
  githubUrl: string;
  linkedinUrl: string;
  portfolioUrl: string;
  resume: { name: string; size: string } | null;
  otherLink: string;
}

export default function StudentSetupPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const [skillInput, setSkillInput] = useState("");
  const [showSkillDropdown, setShowSkillDropdown] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<SetupFormData>({
    fullName: "John Doe",
    phoneNumber: "",
    dob: "",
    gender: "",
    bio: "",
    department: "",
    program: "",
    specialization: "",
    currentYear: "",
    cgpa: "",
    batch: "",
    skills: [],
    interests: [],
    projectTypes: [],
    preferredRoles: [],
    careerGoal: "",
    githubUrl: "",
    linkedinUrl: "",
    portfolioUrl: "",
    resume: null,
    otherLink: "",
  });

  useEffect(() => {
    const data = localStorage.getItem("campusconnect_user");
    if (!data) { router.push("/login/student"); return; }
    const parsed = JSON.parse(data);
    if (!parsed.loggedIn) { router.push("/login/student"); return; }
    if (parsed.profileComplete === true) { router.push("/student/feed"); return; }
    setIsLoading(false);
  }, [router]);

  const handleChange = (field: keyof SetupFormData, value: string | null | string[] | Skill[]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (step < 6) { setDirection(1); setStep((p) => p + 1); }
  };

  const handleBack = () => {
    if (step > 1) { setDirection(-1); setStep((p) => p - 1); }
  };

  const handleSkip = () => {
    if (step === 4 || step === 5) { setDirection(1); setStep((p) => p + 1); }
  };

  const handleProfileComplete = async () => {
    const existing = JSON.parse(localStorage.getItem("campusconnect_user") || "{}");
    if (!existing.regNumber) {
      alert("Your registration number is missing from this session. Please sign in again.");
      router.push("/login/student");
      return;
    }

    const yearMap: Record<string, number> = { "1st": 1, "2nd": 2, "3rd": 3, "4th": 4 };
    setIsSaving(true);
    try {
      await apiRequest("/profiles/me/student", {
        method: "PUT",
        body: JSON.stringify({
          fullName: formData.fullName.trim(),
          registrationNo: existing.regNumber,
          phoneNumber: formData.phoneNumber || undefined,
          dob: formData.dob || undefined,
          gender: formData.gender || undefined,
          bio: formData.bio || undefined,
          department: formData.department || undefined,
          program: formData.program || undefined,
          specialization: formData.specialization || undefined,
          currentYear: yearMap[formData.currentYear],
          cgpa: formData.cgpa ? Number(formData.cgpa) : undefined,
          batch: formData.batch || undefined,
          skills: formData.skills,
          interests: formData.interests,
          projectTypes: formData.projectTypes,
          preferredRoles: formData.preferredRoles,
          careerGoal: formData.careerGoal || undefined,
          githubUrl: formData.githubUrl || undefined,
          linkedinUrl: formData.linkedinUrl || undefined,
          portfolioUrl: formData.portfolioUrl || undefined,
          otherLink: formData.otherLink || undefined,
        }),
      });

      localStorage.setItem("campusconnect_user", JSON.stringify({
        ...existing,
        role: "student",
        profileComplete: true,
        loggedIn: true,
        fullName: formData.fullName.trim(),
        department: formData.department,
        currentYear: formData.currentYear,
      }));
      router.push("/student/feed");
    } catch (error) {
      alert(error instanceof Error ? error.message : "Could not save your profile.");
    } finally {
      setIsSaving(false);
    }
  };

  const isStep1Valid = () =>
    formData.fullName.trim().length > 0 &&
    formData.phoneNumber.trim().length >= 10 &&
    formData.dob.trim().length > 0 &&
    formData.gender.length > 0;

  const isStep2Valid = () => {
    const specFilled =
      formData.department === "Others"
        ? formData.specialization.trim().length > 0
        : formData.specialization.length > 0;
    return (
      formData.department.length > 0 &&
      formData.program.length > 0 &&
      specFilled &&
      formData.currentYear.length > 0 &&
      formData.cgpa.length > 0 &&
      formData.batch.length > 0 &&
      parseFloat(formData.cgpa) >= 0 &&
      parseFloat(formData.cgpa) <= 10
    );
  };

  const isStep3Valid = () => formData.skills.length >= 3;

  const isNextDisabled = () => {
    if (step === 1) return !isStep1Valid();
    if (step === 2) return !isStep2Valid();
    if (step === 3) return !isStep3Valid();
    return false;
  };

  const handleAddSkill = (skillName: string) => {
    const trimmed = skillName.trim();
    if (!trimmed) return;
    if (formData.skills.some((s) => s.name.toLowerCase() === trimmed.toLowerCase())) {
      setSkillInput(""); setShowSkillDropdown(false); return;
    }
    setFormData((prev) => ({
      ...prev,
      skills: [...prev.skills, { name: trimmed, level: "Beginner" }],
    }));
    setSkillInput(""); setShowSkillDropdown(false);
  };

  const handleRemoveSkill = (skillName: string) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((s) => s.name !== skillName),
    }));
  };

  const cycleSkillLevel = (skillName: string) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.map((s) => {
        if (s.name !== skillName) return s;
        const next: Record<string, "Beginner" | "Intermediate" | "Advanced"> = {
          Beginner: "Intermediate",
          Intermediate: "Advanced",
          Advanced: "Beginner",
        };
        return { ...s, level: next[s.level] };
      }),
    }));
  };

  const toggleArrayItem = (
    field: "interests" | "projectTypes" | "preferredRoles",
    item: string
  ) => {
    setFormData((prev) => {
      const arr = prev[field];
      return {
        ...prev,
        [field]: arr.includes(item) ? arr.filter((x) => x !== item) : [...arr, item],
      };
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== "application/pdf") { alert("Only PDF files are allowed."); return; }
    if (file.size > 5 * 1024 * 1024) { alert("File size exceeds 5MB."); return; }
    setFormData((prev) => ({
      ...prev,
      resume: { name: file.name, size: `${(file.size / (1024 * 1024)).toFixed(2)} MB` },
    }));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    if (file.type !== "application/pdf") { alert("Only PDF files are allowed."); return; }
    if (file.size > 5 * 1024 * 1024) { alert("File size exceeds 5MB."); return; }
    setFormData((prev) => ({
      ...prev,
      resume: { name: file.name, size: `${(file.size / (1024 * 1024)).toFixed(2)} MB` },
    }));
  };

  const calculateCompletionPercent = () => {
    let score = 0;
    if (formData.bio.trim().length > 0) score += 10;
    if (formData.interests.length > 0) score += 10;
    if (formData.projectTypes.length > 0) score += 10;
    if (formData.preferredRoles.length > 0) score += 10;
    if (formData.careerGoal.trim().length > 0) score += 10;
    if (formData.githubUrl.trim().length > 0) score += 10;
    if (formData.linkedinUrl.trim().length > 0) score += 10;
    if (formData.resume !== null) score += 10;
    if (formData.otherLink.trim().length > 0) score += 10;
    return score;
  };

  const getSpecializations = (dept: string) => {
    if (dept === "CSE") return ["AI & ML", "Cyber Security", "Cloud Computing", "Software Engineering", "Data Science", "Full Stack", "Others"];
    if (dept === "ECE") return ["VLSI", "Embedded Systems", "Signal Processing", "Others"];
    if (dept === "MECH") return ["Automotive", "Thermal", "Manufacturing", "Robotics", "Others"];
    if (dept === "EEE") return ["Power Systems", "Control Systems", "Renewable Energy", "Others"];
    if (dept === "IT") return ["Information Security", "Web Technologies", "Data Engineering", "Others"];
    return [];
  };

  const specializations = getSpecializations(formData.department);

  const filteredSuggestions = PRELOADED_SKILLS.filter(
    (skill) =>
      skill.toLowerCase().includes(skillInput.toLowerCase()) &&
      !formData.skills.some((s) => s.name.toLowerCase() === skill.toLowerCase())
  );

  const slideVariants = {
    enter: (dir: number) => ({ x: dir > 0 ? 300 : -300, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -300 : 300, opacity: 0 }),
  };

  const stepTitles = [
    { title: "Tell us about yourself", sub: "Let's start with the basics" },
    { title: "Your academic background", sub: "Help us understand where you are in your journey" },
    { title: "What do you know?", sub: "Add at least 3 skills — type or pick from suggestions" },
    { title: "What drives you?", sub: "Tell us what you're passionate about" },
    { title: "Show your work", sub: "Add your profiles and resume — make your application stand out" },
    { title: "Profile Preview", sub: "Review your details before saving" },
  ];

  if (isLoading) {
    return (
      <div
        className="setup-root w-full min-h-screen flex items-center justify-center"
        style={{ minHeight: "100vh", width: "100%", background: "linear-gradient(160deg, #F2E8FF 0%, #FFE8F5 100%)" }}
      >
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-[#9E4F8A] border-t-transparent animate-spin" />
          <p className="text-sm tracking-widest font-semibold uppercase text-[#7B4F9E]">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="setup-root"
      style={{
        minHeight: "100vh",
        width: "100%",
        background: "linear-gradient(160deg, #F2E8FF 0%, #FFE8F5 100%)",
        backgroundAttachment: "fixed",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
      }}
    >
      <div
        className="setup-card w-full"
        style={{
          maxWidth: "680px",
          background: "rgba(255,255,255,0.72)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderRadius: "24px",
          border: "1px solid rgba(200,150,184,0.25)",
          padding: "2.5rem",
          boxShadow: "0 8px 40px rgba(158,79,138,0.10)",
        }}
      >
        {/* Progress Bar */}
        {step < 6 && (
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold uppercase tracking-widest text-[#9E4F8A]">
                Step {step} of 5
              </span>
              <span className="text-xs font-bold text-[#9E6CB8]">{step * 20}%</span>
            </div>
            <div className="w-full h-1.5 rounded-full" style={{ background: "rgba(158,79,138,0.15)" }}>
              <div
                className="h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${step * 20}%`, background: "#9E4F8A" }}
              />
            </div>
          </div>
        )}

        {/* Step Title */}
        <div className="mb-6">
          <h1 style={{ fontFamily: "Playfair Display, Georgia, serif", fontSize: "clamp(22px,4vw,32px)", fontWeight: 800, color: "#4A2870", marginBottom: "4px" }}>
            {stepTitles[step - 1].title}
          </h1>
          <p style={{ fontSize: "14px", color: "#9E6CB8" }}>{stepTitles[step - 1].sub}</p>
        </div>

        {/* Animated Step Content */}
        <div style={{ overflow: "hidden", minHeight: "320px" }}>
          <AnimatePresence custom={direction} mode="wait">
            <motion.div
              key={step}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >

              {/* STEP 1 */}
              {step === 1 && (
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-[#4A2870]">Full Name *</label>
                    <input
                      type="text"
                      value={formData.fullName}
                      onChange={(e) => handleChange("fullName", e.target.value)}
                      placeholder="Your full name"
                      className="w-full h-12 px-4 rounded-xl border border-[#9E4F8A]/30 bg-white/70 text-[#4A2870] placeholder-[#C896B8] focus:outline-none focus:ring-2 focus:ring-[#9E4F8A]/40 transition-all text-sm font-medium"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold uppercase tracking-wider text-[#4A2870]">Phone Number *</label>
                      <input
                        type="tel"
                        value={formData.phoneNumber}
                        onChange={(e) => handleChange("phoneNumber", e.target.value)}
                        placeholder="10-digit mobile number"
                        className="w-full h-12 px-4 rounded-xl border border-[#9E4F8A]/30 bg-white/70 text-[#4A2870] placeholder-[#C896B8] focus:outline-none focus:ring-2 focus:ring-[#9E4F8A]/40 transition-all text-sm font-medium"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold uppercase tracking-wider text-[#4A2870]">Date of Birth *</label>
                      <input
                        type="date"
                        value={formData.dob}
                        onChange={(e) => handleChange("dob", e.target.value)}
                        className="w-full h-12 px-4 rounded-xl border border-[#9E4F8A]/30 bg-white/70 text-[#4A2870] focus:outline-none focus:ring-2 focus:ring-[#9E4F8A]/40 transition-all text-sm font-medium"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-[#4A2870]">Gender *</label>
                    <div className="flex gap-3 flex-wrap">
                      {["Male", "Female", "Prefer not to say"].map((g) => (
                        <button
                          key={g}
                          type="button"
                          onClick={() => handleChange("gender", g)}
                          className={`px-5 py-2.5 rounded-full text-sm font-semibold border transition-all cursor-pointer ${formData.gender === g
                              ? "bg-[#9E4F8A] border-[#9E4F8A] text-white"
                              : "border-[#C896B8] text-[#7B4F9E] hover:bg-[#F5E6F0]"
                            }`}
                        >
                          {g}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5 relative">
                    <label className="text-xs font-semibold uppercase tracking-wider text-[#4A2870]">
                      Bio <span className="text-[#9E6CB8] lowercase font-normal">(optional)</span>
                    </label>
                    <textarea
                      maxLength={160}
                      placeholder="Write a short bio..."
                      value={formData.bio}
                      onChange={(e) => handleChange("bio", e.target.value)}
                      className="w-full h-24 px-4 py-3 rounded-xl border border-[#9E4F8A]/30 bg-white/70 text-[#4A2870] placeholder-[#C896B8] focus:outline-none focus:ring-2 focus:ring-[#9E4F8A]/40 transition-all text-sm font-medium resize-none"
                    />
                    <span className="absolute bottom-2 right-3 text-[10px] font-semibold text-[#9E6CB8]">
                      {formData.bio.length} / 160
                    </span>
                  </div>
                </div>
              )}

              {/* STEP 2 */}
              {step === 2 && (
                <div className="flex flex-col gap-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Department */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold uppercase tracking-wider text-[#4A2870]">Department *</label>
                      <div className="relative">
                        <select
                          value={formData.department}
                          onChange={(e) => {
                            handleChange("department", e.target.value);
                            handleChange("specialization", "");
                          }}
                          className="w-full h-12 pl-4 pr-10 rounded-xl border border-[#9E4F8A]/30 bg-white/70 text-[#4A2870] focus:outline-none focus:ring-2 focus:ring-[#9E4F8A]/40 transition-all text-sm font-medium appearance-none cursor-pointer"
                        >
                          <option value="" disabled>Select Department</option>
                          {["CSE", "ECE", "MECH", "CIVIL", "EEE", "IT", "Biotech", "Chemical", "Others"].map((d) => (
                            <option key={d} value={d}>{d}</option>
                          ))}
                        </select>
                        <ChevronDown className="w-4 h-4 text-[#4A2870] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                    </div>

                    {/* Batch */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold uppercase tracking-wider text-[#4A2870]">Batch *</label>
                      <div className="relative">
                        <select
                          value={formData.batch}
                          onChange={(e) => handleChange("batch", e.target.value)}
                          className="w-full h-12 pl-4 pr-10 rounded-xl border border-[#9E4F8A]/30 bg-white/70 text-[#4A2870] focus:outline-none focus:ring-2 focus:ring-[#9E4F8A]/40 transition-all text-sm font-medium appearance-none cursor-pointer"
                        >
                          <option value="" disabled>Select Batch</option>
                          {["2021-2025", "2022-2026", "2023-2027", "2024-2028", "2025-2029"].map((b) => (
                            <option key={b} value={b}>{b}</option>
                          ))}
                        </select>
                        <ChevronDown className="w-4 h-4 text-[#4A2870] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                    </div>
                  </div>

                  {/* Program */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-[#4A2870]">Program *</label>
                    <div className="flex h-12 bg-white/70 p-1.5 rounded-xl border border-[#9E4F8A]/30 items-center justify-between">
                      {["B.Tech", "M.Tech", "PhD"].map((p) => (
                        <button
                          key={p}
                          type="button"
                          onClick={() => handleChange("program", p)}
                          className={`flex-1 h-full rounded-lg text-xs font-bold transition-all cursor-pointer ${formData.program === p
                              ? "bg-[#9E4F8A] text-white shadow-sm"
                              : "text-[#7B4F9E] hover:bg-[#F5E6F0]"
                            }`}
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Specialization */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-[#4A2870]">Specialization *</label>
                    {formData.department === "Others" || specializations.length === 0 ? (
                      <input
                        type="text"
                        value={formData.specialization}
                        onChange={(e) => handleChange("specialization", e.target.value)}
                        placeholder="Enter your specialization"
                        className="w-full h-12 px-4 rounded-xl border border-[#9E4F8A]/30 bg-white/70 text-[#4A2870] placeholder-[#C896B8] focus:outline-none focus:ring-2 focus:ring-[#9E4F8A]/40 transition-all text-sm font-medium"
                      />
                    ) : (
                      <div className="relative">
                        <select
                          value={formData.specialization}
                          onChange={(e) => handleChange("specialization", e.target.value)}
                          className="w-full h-12 pl-4 pr-10 rounded-xl border border-[#9E4F8A]/30 bg-white/70 text-[#4A2870] focus:outline-none focus:ring-2 focus:ring-[#9E4F8A]/40 transition-all text-sm font-medium appearance-none cursor-pointer"
                        >
                          <option value="" disabled>Select Specialization</option>
                          {specializations.map((spec) => (
                            <option key={spec} value={spec}>{spec}</option>
                          ))}
                        </select>
                        <ChevronDown className="w-4 h-4 text-[#4A2870] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Current Year */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold uppercase tracking-wider text-[#4A2870]">Current Year *</label>
                      <div className="flex h-12 bg-white/70 p-1.5 rounded-xl border border-[#9E4F8A]/30 items-center justify-between">
                        {["1st", "2nd", "3rd", "4th"].map((y) => (
                          <button
                            key={y}
                            type="button"
                            onClick={() => handleChange("currentYear", y)}
                            className={`flex-1 h-full rounded-lg text-xs font-bold transition-all cursor-pointer ${formData.currentYear === y
                                ? "bg-[#9E4F8A] text-white shadow-sm"
                                : "text-[#7B4F9E] hover:bg-[#F5E6F0]"
                              }`}
                          >
                            {y}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* CGPA */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold uppercase tracking-wider text-[#4A2870]">CGPA *</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        max="10"
                        placeholder="e.g. 8.5"
                        value={formData.cgpa}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === "" || (parseFloat(val) >= 0 && parseFloat(val) <= 10)) {
                            handleChange("cgpa", val);
                          }
                        }}
                        className="w-full h-12 px-4 rounded-xl border border-[#9E4F8A]/30 bg-white/70 text-[#4A2870] placeholder-[#C896B8] focus:outline-none focus:ring-2 focus:ring-[#9E4F8A]/40 transition-all text-sm font-medium"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3 */}
              {step === 3 && (
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5 relative">
                    <label className="text-xs font-semibold uppercase tracking-wider text-[#4A2870]">
                      Skills * <span className="text-[#9E6CB8] text-[10px] lowercase font-normal">(add at least 3)</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Type a skill and press Enter..."
                      value={skillInput}
                      onChange={(e) => { setSkillInput(e.target.value); setShowSkillDropdown(true); }}
                      onFocus={() => setShowSkillDropdown(true)}
                      onBlur={() => setTimeout(() => setShowSkillDropdown(false), 200)}
                      onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAddSkill(skillInput); } }}
                      className="w-full h-12 px-4 rounded-xl border border-[#9E4F8A]/30 bg-white/70 text-[#4A2870] placeholder-[#C896B8] focus:outline-none focus:ring-2 focus:ring-[#9E4F8A]/40 transition-all text-sm font-medium"
                    />
                    {showSkillDropdown && skillInput.trim().length > 0 && filteredSuggestions.length > 0 && (
                      <div className="absolute top-[68px] left-0 right-0 max-h-40 overflow-y-auto bg-[#F5E6F0] border border-[#C896B8] rounded-xl shadow-lg z-20 py-1.5">
                        {filteredSuggestions.map((s) => (
                          <button
                            key={s}
                            type="button"
                            onClick={() => handleAddSkill(s)}
                            className="w-full text-left px-4 py-2 text-xs font-semibold text-[#7B4F9E] hover:bg-white/60 transition-colors"
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2 py-2 min-h-[50px] border-b border-[#C896B8]/20">
                    <AnimatePresence>
                      {formData.skills.map((skill) => {
                        const levelBg =
                          skill.level === "Beginner"
                            ? "bg-[#F5E6F0] text-[#7B4F9E] border border-[#C896B8]"
                            : skill.level === "Intermediate"
                              ? "bg-[#C896B8] text-[#4A2870]"
                              : "bg-[#9E4F8A] text-white";
                        return (
                          <motion.div
                            key={skill.name}
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0, opacity: 0 }}
                            transition={{ type: "spring", stiffness: 300, damping: 18 }}
                            className="inline-flex items-center gap-1.5 pl-3 pr-2 py-1.5 bg-[#9E4F8A] rounded-full border border-[#9E4F8A]"
                          >
                            <span className="text-xs font-semibold text-white">{skill.name}</span>
                            <button
                              type="button"
                              onClick={() => cycleSkillLevel(skill.name)}
                              className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full cursor-pointer transition-colors ${levelBg}`}
                            >
                              {skill.level}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRemoveSkill(skill.name)}
                              className="w-5 h-5 rounded-full text-[#C896B8] hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                    {formData.skills.length === 0 && (
                      <p className="text-xs text-[#9E6CB8] italic flex items-center gap-1.5 self-center">
                        <Sparkles className="w-3.5 h-3.5" /> No skills added yet.
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#4A2870]">Suggested Skills</span>
                    <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto pr-1">
                      {PRELOADED_SKILLS.map((skill) => {
                        const isAdded = formData.skills.some((s) => s.name === skill);
                        return (
                          <button
                            key={skill}
                            type="button"
                            disabled={isAdded}
                            onClick={() => handleAddSkill(skill)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${isAdded
                                ? "bg-[#9E4F8A] text-white border border-[#9E4F8A] cursor-not-allowed"
                                : "bg-transparent border border-[#C896B8] text-[#7B4F9E] hover:bg-[#F5E6F0] hover:border-[#9E4F8A] cursor-pointer active:scale-95"
                              }`}
                          >
                            {skill}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="text-xs font-semibold text-[#9E6CB8]">
                    {formData.skills.length} skills added (minimum 3 required)
                  </div>
                </div>
              )}

              {/* STEP 4 */}
              {step === 4 && (
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-[#4A2870]">Areas of Interest</label>
                    <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto pr-1">
                      {PRELOADED_INTERESTS.map((interest) => {
                        const isSel = formData.interests.includes(interest);
                        return (
                          <button
                            key={interest}
                            type="button"
                            onClick={() => toggleArrayItem("interests", interest)}
                            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer ${isSel
                                ? "bg-[#9E4F8A] border-[#9E4F8A] text-white"
                                : "border-[#C896B8] bg-transparent text-[#7B4F9E] hover:bg-[#F5E6F0]"
                              }`}
                          >
                            {interest}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold uppercase tracking-wider text-[#4A2870]">Preferred Project Type</label>
                      <div className="flex flex-wrap gap-2">
                        {PROJECT_TYPES.map((pt) => {
                          const isSel = formData.projectTypes.includes(pt);
                          return (
                            <button
                              key={pt}
                              type="button"
                              onClick={() => toggleArrayItem("projectTypes", pt)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${isSel
                                  ? "bg-[#9E4F8A] border-[#9E4F8A] text-white"
                                  : "border-[#C896B8] bg-transparent text-[#7B4F9E] hover:bg-[#F5E6F0]"
                                }`}
                            >
                              {pt}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold uppercase tracking-wider text-[#4A2870]">Preferred Role</label>
                      <div className="flex flex-wrap gap-1.5">
                        {ROLES.map((r) => {
                          const isSel = formData.preferredRoles.includes(r);
                          return (
                            <button
                              key={r}
                              type="button"
                              onClick={() => toggleArrayItem("preferredRoles", r)}
                              className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${isSel
                                  ? "bg-[#9E4F8A] border-[#9E4F8A] text-white"
                                  : "border-[#C896B8] bg-transparent text-[#7B4F9E] hover:bg-[#F5E6F0]"
                                }`}
                            >
                              {r}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5 relative">
                    <label className="text-xs font-semibold uppercase tracking-wider text-[#4A2870]">Career Goal</label>
                    <textarea
                      maxLength={200}
                      placeholder="e.g. I want to become an AI researcher..."
                      value={formData.careerGoal}
                      onChange={(e) => handleChange("careerGoal", e.target.value)}
                      className="w-full h-20 px-4 py-2.5 rounded-xl border border-[#9E4F8A]/30 bg-white/70 text-[#4A2870] placeholder-[#C896B8] focus:outline-none focus:ring-2 focus:ring-[#9E4F8A]/40 transition-all text-sm font-medium resize-none"
                    />
                    <span className="absolute bottom-2 right-3 text-[9px] font-semibold text-[#9E6CB8]">
                      {formData.careerGoal.length} / 200
                    </span>
                  </div>
                </div>
              )}

              {/* STEP 5 */}
              {step === 5 && (
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold uppercase tracking-wider text-[#4A2870]">GitHub URL</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9E6CB8]">
                        <GithubIcon className="w-4 h-4" />
                      </span>
                      <input
                        type="url"
                        placeholder="https://github.com/yourusername"
                        value={formData.githubUrl}
                        onChange={(e) => handleChange("githubUrl", e.target.value)}
                        className="w-full h-12 pl-10 pr-4 rounded-xl border border-[#9E4F8A]/30 bg-white/70 text-[#4A2870] placeholder-[#C896B8] focus:outline-none focus:ring-2 focus:ring-[#9E4F8A]/40 transition-all text-sm font-medium"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-semibold uppercase tracking-wider text-[#4A2870]">LinkedIn URL</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9E6CB8]">
                          <LinkedinIcon className="w-4 h-4" />
                        </span>
                        <input
                          type="url"
                          placeholder="https://linkedin.com/in/yourname"
                          value={formData.linkedinUrl}
                          onChange={(e) => handleChange("linkedinUrl", e.target.value)}
                          className="w-full h-12 pl-10 pr-4 rounded-xl border border-[#9E4F8A]/30 bg-white/70 text-[#4A2870] placeholder-[#C896B8] focus:outline-none focus:ring-2 focus:ring-[#9E4F8A]/40 transition-all text-sm font-medium"
                        />
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-semibold uppercase tracking-wider text-[#4A2870]">Portfolio URL</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9E6CB8]">
                          <Globe className="w-4 h-4" />
                        </span>
                        <input
                          type="url"
                          placeholder="https://yourportfolio.com"
                          value={formData.portfolioUrl}
                          onChange={(e) => handleChange("portfolioUrl", e.target.value)}
                          className="w-full h-12 pl-10 pr-4 rounded-xl border border-[#9E4F8A]/30 bg-white/70 text-[#4A2870] placeholder-[#C896B8] focus:outline-none focus:ring-2 focus:ring-[#9E4F8A]/40 transition-all text-sm font-medium"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-[#4A2870]">Resume Upload</label>
                    {!formData.resume ? (
                      <div
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full py-6 px-4 rounded-2xl border-2 border-dashed border-[#9E4F8A] bg-[#F5E6F0]/60 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-[#F5E6F0]/80 transition-all group"
                      >
                        <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".pdf" className="hidden" />
                        <UploadCloud className="w-8 h-8 text-[#9E4F8A] mb-2 group-hover:scale-110 transition-transform duration-300" />
                        <p className="text-xs font-semibold text-[#7B4F9E]">
                          Drag & drop your resume here or <span className="text-[#9E4F8A] underline">click to browse</span>
                        </p>
                        <p className="text-[10px] text-[#C896B8] mt-1 font-semibold">PDF only · Max 5MB</p>
                      </div>
                    ) : (
                      <div className="w-full p-4 rounded-xl border border-[#C896B8] bg-[#F5E6F0]/50 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-[#C896B8] flex items-center justify-center text-[#4A2870]">
                            <FileText className="w-5 h-5" />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-xs font-bold text-[#4A2870] truncate max-w-[240px]">{formData.resume.name}</span>
                            <span className="text-[10px] font-semibold text-[#9E6CB8]">{formData.resume.size}</span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleChange("resume", null)}
                          className="w-8 h-8 rounded-lg hover:bg-[#F5E6F0] text-[#9E6CB8] hover:text-[#4A2870] flex items-center justify-center transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold uppercase tracking-wider text-[#4A2870]">Other Link</label>
                    <input
                      type="url"
                      placeholder="Any other relevant link"
                      value={formData.otherLink}
                      onChange={(e) => handleChange("otherLink", e.target.value)}
                      className="w-full h-12 px-4 rounded-xl border border-[#9E4F8A]/30 bg-white/70 text-[#4A2870] placeholder-[#C896B8] focus:outline-none focus:ring-2 focus:ring-[#9E4F8A]/40 transition-all text-sm font-medium"
                    />
                  </div>
                </div>
              )}

              {/* STEP 6 — Profile Preview */}
              {step === 6 && (
                <div className="flex flex-col gap-6">
                  <div className="flex flex-col md:flex-row items-center gap-6 border-b border-[#C896B8]/30 pb-6">
                    {(() => {
                      const percent = calculateCompletionPercent();
                      const rad = 42;
                      const circ = 2 * Math.PI * rad;
                      const offset = circ - (percent / 100) * circ;
                      return (
                        <div className="relative flex items-center justify-center">
                          <svg className="w-24 h-24 transform -rotate-90">
                            <circle cx="48" cy="48" r={rad} stroke="#C896B8" strokeOpacity="0.2" strokeWidth="6" fill="transparent" />
                            <circle
                              cx="48" cy="48" r={rad} stroke="#9E4F8A" strokeWidth="6" fill="transparent"
                              strokeDasharray={circ} strokeDashoffset={offset}
                              className="transition-all duration-500 ease-out" strokeLinecap="round"
                            />
                          </svg>
                          <div className="absolute flex flex-col items-center justify-center">
                            <span style={{ fontFamily: "Playfair Display, Georgia, serif", fontSize: "20px", fontWeight: 900, color: "#4A2870" }}>{percent}%</span>
                            <span className="text-[8px] font-bold text-[#9E6CB8] uppercase tracking-wider">Complete</span>
                          </div>
                        </div>
                      );
                    })()}
                    <div className="text-center md:text-left">
                      <h1 style={{ fontFamily: "Playfair Display, Georgia, serif", fontSize: "28px", fontWeight: 800, color: "#4A2870" }}>
                        Ready to Connect?
                      </h1>
                      <p className="text-sm text-[#9E6CB8] mt-1 leading-relaxed">
                        Review your profile details below before saving.
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-4 max-h-[300px] overflow-y-auto pr-2">
                    <div className="bg-white/85 p-4 rounded-2xl border border-[#C896B8]/25 flex flex-col gap-2">
                      <div className="flex justify-between items-baseline flex-wrap gap-2">
                        <span style={{ fontFamily: "Playfair Display, Georgia, serif", fontSize: "20px", fontWeight: 700, color: "#4A2870" }}>
                          {formData.fullName}
                        </span>
                        <span className="text-xs font-semibold text-[#9E6CB8] uppercase tracking-widest">
                          {formData.program} · {formData.department}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-1 text-[11px] font-bold text-[#9E6CB8]">
                        <span>Year: {formData.currentYear}</span>
                        <span>Batch: {formData.batch}</span>
                        <span>CGPA: {formData.cgpa}</span>
                        <span>Gender: {formData.gender}</span>
                      </div>
                      {formData.bio && (
                        <p className="text-xs text-[#4A2870]/80 italic mt-2 border-t border-[#C896B8]/15 pt-2 leading-relaxed">
                          &ldquo;{formData.bio}&rdquo;
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#9E6CB8]">Skills & Proficiency</span>
                      <div className="flex flex-wrap gap-1.5">
                        {formData.skills.map((s) => (
                          <span key={s.name} className="text-[10px] font-bold px-2.5 py-1 rounded-full border bg-[#9E4F8A] text-white border-[#9E4F8A]/50">
                            {s.name} ({s.level})
                          </span>
                        ))}
                      </div>
                    </div>

                    {(formData.interests.length > 0 || formData.preferredRoles.length > 0) && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {formData.interests.length > 0 && (
                          <div className="flex flex-col gap-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[#9E6CB8]">Interests</span>
                            <div className="flex flex-wrap gap-1">
                              {formData.interests.map((i) => (
                                <span key={i} className="text-[9px] font-semibold border border-[#C896B8] text-[#7B4F9E] px-2 py-0.5 rounded-md">
                                  {i}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        {formData.preferredRoles.length > 0 && (
                          <div className="flex flex-col gap-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[#9E6CB8]">Preferred Roles</span>
                            <div className="flex flex-wrap gap-1">
                              {formData.preferredRoles.map((r) => (
                                <span key={r} className="text-[9px] font-semibold border border-[#C896B8] text-[#7B4F9E] px-2 py-0.5 rounded-md">
                                  {r}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="flex flex-col gap-2 border-t border-[#C896B8]/20 pt-3">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#9E6CB8]">Links & Documents</span>
                      <div className="flex flex-wrap gap-2">
                        {formData.githubUrl && (
                          <a href={formData.githubUrl} target="_blank" rel="noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#F5E6F0] border border-[#C896B8] rounded-full text-xs font-semibold text-[#4A2870]">
                            <GithubIcon className="w-3.5 h-3.5" /> GitHub
                          </a>
                        )}
                        {formData.linkedinUrl && (
                          <a href={formData.linkedinUrl} target="_blank" rel="noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#F5E6F0] border border-[#C896B8] rounded-full text-xs font-semibold text-[#4A2870]">
                            <LinkedinIcon className="w-3.5 h-3.5" /> LinkedIn
                          </a>
                        )}
                        {formData.portfolioUrl && (
                          <a href={formData.portfolioUrl} target="_blank" rel="noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#F5E6F0] border border-[#C896B8] rounded-full text-xs font-semibold text-[#4A2870]">
                            <Globe className="w-3.5 h-3.5" /> Portfolio
                          </a>
                        )}
                        {formData.resume && (
                          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#F5E6F0] border border-[#C896B8] rounded-full text-xs font-semibold text-[#4A2870]">
                            <FileText className="w-3.5 h-3.5" /> {formData.resume.name}
                          </div>
                        )}
                        {!formData.githubUrl && !formData.linkedinUrl && !formData.portfolioUrl && !formData.resume && (
                          <p className="text-[10px] text-[#9E6CB8] italic">No links or documents attached.</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer Navigation */}
        <div className="flex items-center justify-between border-t border-[#C896B8]/20 pt-5 mt-6 flex-wrap gap-4">
          {step > 1 ? (
            <button
              type="button"
              onClick={handleBack}
              className="px-5 py-2.5 rounded-xl border border-[#C896B8] text-[#7B4F9E] hover:bg-[#F5E6F0] transition-all font-semibold text-sm flex items-center gap-2 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              {step === 6 ? "Edit Profile" : "Back"}
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-4">
            {(step === 4 || step === 5) && (
              <button
                type="button"
                onClick={handleSkip}
                className="text-xs font-bold text-[#9E6CB8] hover:underline cursor-pointer"
              >
                Skip for now
              </button>
            )}

            {step < 5 ? (
              <button
                type="button"
                disabled={isNextDisabled()}
                onClick={handleNext}
                className={`px-6 py-3 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${isNextDisabled()
                    ? "bg-[#F5E6F0]/50 text-[#4A2870]/30 border border-[#C896B8]/20 cursor-not-allowed"
                    : "bg-[#4A2870] text-white hover:bg-[#9E4F8A] cursor-pointer shadow-md active:scale-95"
                  }`}
              >
                Next <ArrowRight className="w-4 h-4" />
              </button>
            ) : step === 5 ? (
              <button
                type="button"
                onClick={handleNext}
                className="px-6 py-3 rounded-xl font-bold text-sm bg-[#4A2870] text-white hover:bg-[#9E4F8A] cursor-pointer shadow-md active:scale-95 flex items-center gap-2"
              >
                Complete Profile <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleProfileComplete}
                disabled={isSaving}
                className="px-7 py-3.5 rounded-xl font-bold text-base bg-[#4A2870] text-white hover:bg-[#9E4F8A] cursor-pointer shadow-md active:scale-95 flex items-center gap-2 disabled:cursor-wait disabled:opacity-60"
              >
                {isSaving ? "Saving profile..." : "Looks good, Let's go!"} <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
