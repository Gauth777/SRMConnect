"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check, UserRound, X } from "lucide-react";
import { apiRequest } from "@/lib/api";

interface FacultyProject {
  id: string;
  title: string;
  domain: string;
  status: string;
  deadline: string;
  _count: { applications: number };
}

interface Applicant {
  id: string;
  status: "PENDING" | "ACCEPTED" | "REJECTED" | "WITHDRAWN";
  createdAt: string;
  student: {
    registrationNo: string;
    department?: string | null;
    program?: string | null;
    currentYear?: number | null;
    cgpa?: number | null;
    skills?: Array<{ name: string; level: string }> | null;
    profile: { fullName?: string | null; email: string };
  };
}

export default function FacultyApplicantsPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<FacultyProject[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("campusconnect_user") || "null");
    if (!user?.loggedIn || user.role !== "faculty") {
      router.push("/login/faculty");
      return;
    }

    apiRequest<FacultyProject[]>("/projects/mine")
      .then((records) => {
        setProjects(records);
        if (records[0]) setSelectedProjectId(records[0].id);
      })
      .catch((requestError) => setError(requestError instanceof Error ? requestError.message : "Could not load your projects."))
      .finally(() => setLoading(false));
  }, [router]);

  useEffect(() => {
    if (!selectedProjectId) {
      setApplicants([]);
      return;
    }
    setLoading(true);
    apiRequest<Applicant[]>(`/applications/projects/${selectedProjectId}`)
      .then(setApplicants)
      .catch((requestError) => setError(requestError instanceof Error ? requestError.message : "Could not load applicants."))
      .finally(() => setLoading(false));
  }, [selectedProjectId]);

  const decide = async (applicationId: string, status: "accepted" | "rejected") => {
    setUpdatingId(applicationId);
    setError("");
    try {
      await apiRequest(`/applications/${applicationId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      setApplicants((current) =>
        current.map((applicant) =>
          applicant.id === applicationId ? { ...applicant, status: status.toUpperCase() as Applicant["status"] } : applicant,
        ),
      );
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Could not update application status.");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <main className="min-h-screen bg-[#f5f3ec] px-4 py-8 text-[#3a3a3a] md:px-8">
      <div className="mx-auto max-w-6xl">
        <button onClick={() => router.push("/faculty/dashboard")} className="mb-6 inline-flex items-center gap-2 text-sm font-bold text-[#6B4B7A]">
          <ArrowLeft className="h-4 w-4" /> Back to dashboard
        </button>

        <div className="mb-7">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#9B7BB0]">Faculty workspace</p>
          <h1 className="mt-2 font-playfair text-4xl font-extrabold text-[#6B4B7A]" style={{ fontFamily: "Playfair Display, Georgia, serif" }}>Project Applicants</h1>
          <p className="mt-2 text-sm text-[#5a5a5a]">Review live applications submitted through the student feed.</p>
        </div>

        {error && <div className="mb-5 rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

        {projects.length > 0 && (
          <div className="mb-6 rounded-2xl border border-[#9B7BB0]/20 bg-white/70 p-4">
            <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-[#6B4B7A]">Select project</label>
            <select value={selectedProjectId} onChange={(event) => setSelectedProjectId(event.target.value)} className="w-full rounded-xl border border-[#9B7BB0]/30 bg-white px-4 py-3 text-sm font-semibold outline-none">
              {projects.map((project) => (
                <option key={project.id} value={project.id}>{project.title} — {project._count.applications} applicant{project._count.applications === 1 ? "" : "s"}</option>
              ))}
            </select>
          </div>
        )}

        {loading ? (
          <div className="rounded-2xl border border-[#9B7BB0]/20 bg-white/60 p-8 text-center text-sm font-semibold text-[#6B4B7A]">Loading applicants…</div>
        ) : projects.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#9B7BB0]/40 bg-white/50 p-10 text-center">
            <h2 className="text-lg font-bold text-[#6B4B7A]">No projects published yet</h2>
            <p className="mt-2 text-sm text-[#5a5a5a]">Publish your first project and student applications will appear here.</p>
            <button onClick={() => router.push("/faculty/create-post")} className="mt-5 rounded-xl bg-[#6B4B7A] px-5 py-2.5 text-sm font-bold text-white">Create a post</button>
          </div>
        ) : applicants.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#9B7BB0]/40 bg-white/50 p-10 text-center">
            <h2 className="text-lg font-bold text-[#6B4B7A]">No applicants for this project</h2>
            <p className="mt-2 text-sm text-[#5a5a5a]">Applications submitted by students will appear automatically.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {applicants.map((applicant) => (
              <article key={applicant.id} className="rounded-2xl border border-[#9B7BB0]/20 bg-white/80 p-5 shadow-sm">
                <div className="flex flex-col justify-between gap-5 md:flex-row md:items-start">
                  <div className="flex gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#6B4B7A]/10 text-[#6B4B7A]"><UserRound className="h-5 w-5" /></div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-lg font-extrabold text-[#3D2A4A]">{applicant.student.profile.fullName || "Student"}</h2>
                        <span className="rounded-full bg-[#9B7BB0]/10 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-[#6B4B7A]">{applicant.status}</span>
                      </div>
                      <p className="mt-1 text-sm text-[#5a5a5a]">{applicant.student.registrationNo} · {applicant.student.profile.email}</p>
                      <p className="mt-1 text-xs text-[#5a5a5a]">{applicant.student.department || "Department not set"}{applicant.student.currentYear ? ` · Year ${applicant.student.currentYear}` : ""}{applicant.student.cgpa != null ? ` · CGPA ${applicant.student.cgpa}` : ""}</p>
                      {Array.isArray(applicant.student.skills) && applicant.student.skills.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {applicant.student.skills.slice(0, 6).map((skill) => <span key={`${applicant.id}-${skill.name}`} className="rounded-full border border-[#9B7BB0]/25 px-2.5 py-1 text-[10px] font-semibold text-[#6B4B7A]">{skill.name} · {skill.level}</span>)}
                        </div>
                      )}
                    </div>
                  </div>

                  {applicant.status === "PENDING" && (
                    <div className="flex gap-2">
                      <button onClick={() => decide(applicant.id, "accepted")} disabled={updatingId === applicant.id} className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white disabled:opacity-50"><Check className="h-4 w-4" /> Accept</button>
                      <button onClick={() => decide(applicant.id, "rejected")} disabled={updatingId === applicant.id} className="inline-flex items-center gap-1.5 rounded-xl border border-red-300 px-4 py-2 text-xs font-bold text-red-600 disabled:opacity-50"><X className="h-4 w-4" /> Reject</button>
                    </div>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
