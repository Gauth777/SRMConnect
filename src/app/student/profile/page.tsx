"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ExternalLink,
  GraduationCap,
  Mail,
  Pencil,
  UserRound,
} from "lucide-react";
import { apiRequest } from "@/lib/api";

interface StudentProfileResponse {
  email: string;
  fullName?: string | null;
  bio?: string | null;
  student?: {
    registrationNo: string;
    department?: string | null;
    program?: string | null;
    specialization?: string | null;
    currentYear?: number | null;
    cgpa?: number | null;
    batch?: string | null;
    skills?: Array<{ name: string; level: string }> | null;
    interests?: string[];
    projectTypes?: string[];
    preferredRoles?: string[];
    careerGoal?: string | null;
    githubUrl?: string | null;
    linkedinUrl?: string | null;
    portfolioUrl?: string | null;
    otherLink?: string | null;
  } | null;
}

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<StudentProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    apiRequest<StudentProfileResponse>("/profiles/me")
      .then(setProfile)
      .catch((requestError) =>
        setError(requestError instanceof Error ? requestError.message : "Could not load profile."),
      )
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <main className="flex min-h-screen items-center justify-center bg-[#f5f3ec] text-[#8690a2]">Loading profile…</main>;
  }

  const student = profile?.student;
  const skills = Array.isArray(student?.skills) ? student.skills : [];

  return (
    <main className="min-h-screen bg-[#f5f3ec] px-4 py-8 text-[#3a3a3a] md:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <button onClick={() => router.push("/student/feed")} className="inline-flex items-center gap-2 text-sm font-bold text-[#8690a2]">
            <ArrowLeft className="h-4 w-4" /> Back to feed
          </button>
          <button onClick={() => router.push("/student/setup")} className="inline-flex items-center gap-2 rounded-xl bg-[#8690a2] px-4 py-2 text-sm font-bold text-white">
            <Pencil className="h-4 w-4" /> Edit profile
          </button>
        </div>

        {error && <div className="mb-5 rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

        {profile && student && (
          <>
            <section className="rounded-2xl border border-[#ab9b8e]/25 bg-white/75 p-6 shadow-sm">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#8690a2]/15 text-[#8690a2]">
                  <UserRound className="h-9 w-9" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#ab9b8e]">Student profile</p>
                  <h1 className="mt-1 font-playfair text-4xl font-extrabold text-[#8690a2]">{profile.fullName || "Student"}</h1>
                  <div className="mt-2 flex flex-wrap gap-x-5 gap-y-2 text-sm text-[#5a5a5a]">
                    <span className="inline-flex items-center gap-1.5"><Mail className="h-4 w-4" /> {profile.email}</span>
                    <span className="inline-flex items-center gap-1.5"><GraduationCap className="h-4 w-4" /> {student.registrationNo}</span>
                  </div>
                </div>
              </div>

              <p className="mt-6 rounded-xl bg-[#e0decd]/55 p-4 text-sm leading-6 text-[#5a5a5a]">
                {profile.bio || "No bio added yet. Use Edit profile to add one."}
              </p>
            </section>

            <div className="mt-5 grid gap-5 lg:grid-cols-2">
              <Section title="Academics">
                <Info label="Department" value={student.department} />
                <Info label="Program" value={student.program} />
                <Info label="Specialization" value={student.specialization} />
                <Info label="Current year" value={student.currentYear ? `Year ${student.currentYear}` : null} />
                <Info label="CGPA" value={student.cgpa != null ? String(student.cgpa) : null} />
                <Info label="Batch" value={student.batch} />
                <Info label="Career goal" value={student.careerGoal} />
              </Section>

              <Section title="Skills">
                {skills.length === 0 ? (
                  <p className="text-sm text-[#5a5a5a]">No skills added yet.</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {skills.map((skill) => (
                      <span key={`${skill.name}-${skill.level}`} className="rounded-full border border-[#bdd1d3] bg-[#f5f3ec] px-3 py-1.5 text-xs font-semibold">
                        {skill.name} · {skill.level}
                      </span>
                    ))}
                  </div>
                )}
              </Section>

              <Section title="Interests & preferred work">
                <TagGroup label="Interests" values={student.interests || []} />
                <TagGroup label="Project types" values={student.projectTypes || []} />
                <TagGroup label="Preferred roles" values={student.preferredRoles || []} />
              </Section>

              <Section title="Links">
                <ProfileLink label="GitHub" href={student.githubUrl} />
                <ProfileLink label="LinkedIn" href={student.linkedinUrl} />
                <ProfileLink label="Portfolio" href={student.portfolioUrl} />
                <ProfileLink label="Other link" href={student.otherLink} />
              </Section>
            </div>
          </>
        )}
      </div>
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-[#ab9b8e]/20 bg-[#e0decd]/55 p-5">
      <h2 className="mb-4 text-lg font-extrabold text-[#8690a2]">{title}</h2>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

function Info({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex justify-between gap-4 border-b border-[#ab9b8e]/15 pb-2 text-sm">
      <span className="font-semibold text-[#5a5a5a]">{label}</span>
      <span className="text-right font-bold text-[#3a3a3a]">{value || "Not set"}</span>
    </div>
  );
}

function TagGroup({ label, values }: { label: string; values: string[] }) {
  return (
    <div>
      <p className="mb-2 text-xs font-bold uppercase tracking-wider text-[#ab9b8e]">{label}</p>
      {values.length ? (
        <div className="flex flex-wrap gap-2">
          {values.map((value) => <span key={value} className="rounded-full bg-white/70 px-2.5 py-1 text-xs font-semibold">{value}</span>)}
        </div>
      ) : (
        <p className="text-sm text-[#5a5a5a]">Not set</p>
      )}
    </div>
  );
}

function ProfileLink({
  label,
  href,
}: {
  label: string;
  href?: string | null;
}) {
  if (!href) return <Info label={label} value="Not set" />;
  return (
    <a href={href} target="_blank" rel="noreferrer" className="flex items-center justify-between rounded-xl bg-white/60 px-3 py-2 text-sm font-semibold text-[#5a5a5a] hover:bg-white">
      <span>{label}</span>
      <ExternalLink className="h-3.5 w-3.5" />
    </a>
  );
}
