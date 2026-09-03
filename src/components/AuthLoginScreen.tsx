"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import { ApiError, apiRequest } from "@/lib/api";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { Role } from "./RoleSelectionScreen";
import { Input } from "./ui/input";

interface AuthLoginScreenProps {
  role: Role;
  onBack: () => void;
}

type Mode = "signin" | "signup";

interface ApplicationProfile {
  role: "STUDENT" | "FACULTY" | "ADMIN";
  profileComplete: boolean;
  fullName?: string | null;
  student?: {
    registrationNo?: string | null;
    department?: string | null;
    currentYear?: number | null;
  } | null;
  faculty?: {
    employeeId?: string | null;
    department?: string | null;
  } | null;
}

const REG_PATTERN = /^RA\d{13}$/;
const EMP_PATTERN = /^[a-zA-Z0-9]{4,20}$/;
const SRM_EMAIL_PATTERN = /^[a-zA-Z0-9._%+-]+@srmist\.edu\.in$/;

export function AuthLoginScreen({ role, onBack }: AuthLoginScreenProps) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("signin");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [form, setForm] = useState({
    registrationNo: "",
    employeeId: "",
    fullName: "",
    email: "",
    password: "",
  });

  const title = role === "student" ? "Student" : role === "faculty" ? "Faculty" : "Admin";
  const tagline =
    role === "student"
      ? "Your academic journey, connected."
      : role === "faculty"
        ? "Guide the next generation of innovators."
        : "Manage, monitor, and maintain CampusConnect.";

  const setField = (field: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
    setError("");
    setNotice("");
  };

  const validate = (): string | null => {
    if (!SRM_EMAIL_PATTERN.test(form.email)) {
      return "Use a valid @srmist.edu.in email address.";
    }
    if (form.password.length < 6) {
      return "Password must be at least 6 characters.";
    }
    if (role === "student" && !REG_PATTERN.test(form.registrationNo)) {
      return "Registration number must match RA followed by 13 digits.";
    }
    if (role === "faculty" && !EMP_PATTERN.test(form.employeeId)) {
      return "Employee ID must contain 4 to 20 letters or numbers.";
    }
    if (role === "faculty" && mode === "signup" && form.fullName.trim().length < 2) {
      return "Enter your full name to create the faculty account.";
    }
    return null;
  };

  const cacheUser = (profileComplete: boolean, profile?: ApplicationProfile) => {
    localStorage.setItem(
      "campusconnect_user",
      JSON.stringify({
        role,
        loggedIn: true,
        profileComplete,
        email: form.email,
        regNumber: role === "student" ? form.registrationNo : undefined,
        empId: role === "faculty" ? form.employeeId : undefined,
        name: profile?.fullName || form.fullName || undefined,
        fullName: profile?.fullName || form.fullName || undefined,
        department: profile?.student?.department || profile?.faculty?.department || undefined,
        currentYear: profile?.student?.currentYear || undefined,
      }),
    );
  };

  const finishAuthenticatedFlow = async () => {
    try {
      const profile = await apiRequest<ApplicationProfile>("/profiles/me");
      const actualRole = profile.role.toLowerCase();

      if (actualRole !== role) {
        await getSupabaseBrowserClient().auth.signOut({ scope: "local" });
        throw new Error(`This account is registered as ${actualRole}, not ${role}.`);
      }

      if (
        role === "student" &&
        profile.student?.registrationNo &&
        profile.student.registrationNo !== form.registrationNo
      ) {
        await getSupabaseBrowserClient().auth.signOut({ scope: "local" });
        throw new Error("The registration number does not match this account.");
      }

      if (
        role === "faculty" &&
        profile.faculty?.employeeId &&
        profile.faculty.employeeId !== form.employeeId
      ) {
        await getSupabaseBrowserClient().auth.signOut({ scope: "local" });
        throw new Error("The employee ID does not match this account.");
      }

      cacheUser(Boolean(profile.profileComplete), profile);
      router.push(role === "student" ? "/student/feed" : "/faculty/dashboard");
    } catch (profileError) {
      if (profileError instanceof ApiError && profileError.status === 404) {
        cacheUser(false);
        router.push(role === "student" ? "/student/setup" : "/faculty/setup");
        return;
      }
      throw profileError;
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setNotice("");

    if (role === "admin") {
      if (!form.email || !form.password) {
        setError("Enter the admin email and password.");
        return;
      }
      localStorage.setItem(
        "campusconnect_user",
        JSON.stringify({ role: "admin", loggedIn: true, name: "Admin", email: form.email }),
      );
      router.push("/admin/dashboard");
      return;
    }

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    try {
      const supabase = getSupabaseBrowserClient();

      if (mode === "signup") {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: form.email,
          password: form.password,
          options: {
            data: {
              requested_role: role,
            },
          },
        });

        if (signUpError) throw signUpError;

        if (!data.session) {
          setNotice(
            "Account created. Verify the confirmation email sent by Supabase, then return here and sign in.",
          );
          setMode("signin");
          return;
        }
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: form.email,
          password: form.password,
        });
        if (signInError) throw signInError;
      }

      await finishAuthenticatedFlow();
    } catch (authError) {
      const message = authError instanceof Error ? authError.message : "Authentication failed.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-[#2E1E38] to-[#120A17] text-white md:flex">
      <section className="relative flex min-h-[30vh] items-center justify-center overflow-hidden border-b border-sunset-peach/10 p-8 md:min-h-screen md:w-[45%] md:border-b-0 md:border-r md:p-16">
        <div className="absolute inset-0 bg-gradient-to-br from-sunset-violet/80 via-sunset-rust/50 to-sunset-orange/30" />
        <div className="relative z-10 max-w-sm text-center">
          <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-2xl border border-sunset-peach/20 bg-sunset-violet/50 text-4xl shadow-lg">◎</div>
          <h1 className="font-playfair text-4xl font-extrabold tracking-tight text-sunset-peach">CampusConnect</h1>
          <p className="mt-5 font-inter text-base font-light text-sunset-peach/80">{tagline}</p>
        </div>
      </section>

      <section className="flex min-h-[70vh] items-center justify-center p-6 md:min-h-screen md:w-[55%] md:p-16">
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md rounded-2xl border border-sunset-peach/15 bg-white/5 p-8 shadow-2xl backdrop-blur-xl"
        >
          <h2 className="font-playfair text-3xl font-bold text-[#FFC4B1]">
            {title} {role === "admin" ? "Login" : mode === "signin" ? "Login" : "Sign Up"}
          </h2>
          <p className="mt-2 text-sm text-sunset-peach/60">
            {role === "admin"
              ? "Admin authentication remains in prototype mode during this integration phase."
              : mode === "signin"
                ? "Sign in with your institutional account."
                : "Create your Supabase-backed institutional account."}
          </p>

          <form onSubmit={handleSubmit} className="mt-7 flex flex-col gap-5">
            {role === "student" && (
              <Field label="Registration Number">
                <Input
                  value={form.registrationNo}
                  onChange={(event) => setField("registrationNo", event.target.value.toUpperCase())}
                  placeholder="RA0000000000000"
                  maxLength={15}
                  required
                />
              </Field>
            )}

            {role === "faculty" && (
              <Field label="Employee ID">
                <Input
                  value={form.employeeId}
                  onChange={(event) => setField("employeeId", event.target.value)}
                  placeholder="Employee ID"
                  required
                />
              </Field>
            )}

            {role === "faculty" && mode === "signup" && (
              <Field label="Full Name">
                <Input
                  value={form.fullName}
                  onChange={(event) => setField("fullName", event.target.value)}
                  placeholder="Your full name"
                  required
                />
              </Field>
            )}

            <Field label={role === "admin" ? "Email Address" : "SRM Email ID"}>
              <Input
                type="email"
                value={form.email}
                onChange={(event) => setField("email", event.target.value.trim())}
                placeholder="yourname@srmist.edu.in"
                required
              />
            </Field>

            <Field label="Password">
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={(event) => setField("password", event.target.value)}
                  placeholder="At least 6 characters"
                  className="pr-12"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-sunset-peach/60 hover:text-sunset-orange"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </Field>

            {error && <p className="rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</p>}
            {notice && <p className="rounded-xl border border-emerald-300/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">{notice}</p>}

            <button
              type="submit"
              disabled={loading}
              className="h-12 rounded-xl bg-[#F27F3D] font-bold text-white transition hover:opacity-90 disabled:cursor-wait disabled:opacity-50"
            >
              {loading ? "Connecting..." : role === "admin" ? "Login" : mode === "signin" ? "Login" : "Create account"}
            </button>

            {role !== "admin" && (
              <button
                type="button"
                onClick={() => {
                  setMode((current) => (current === "signin" ? "signup" : "signin"));
                  setError("");
                  setNotice("");
                }}
                className="text-sm font-semibold text-sunset-peach/70 hover:text-sunset-orange"
              >
                {mode === "signin" ? "First time here? Create an account" : "Already registered? Sign in"}
              </button>
            )}

            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center justify-center gap-2 text-sm font-semibold text-sunset-peach/60 hover:text-sunset-orange"
            >
              <ArrowLeft className="h-4 w-4" /> Back to role selection
            </button>
          </form>
        </motion.div>
      </section>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-2">
      <span className="font-inter text-xs font-semibold uppercase tracking-wider text-sunset-peach/80">{label}</span>
      {children}
    </label>
  );
}
