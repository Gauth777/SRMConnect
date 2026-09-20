"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, CalendarDays, X } from "lucide-react";
import { apiRequest } from "@/lib/api";

interface SavedProjectRecord {
  projectId: string;
  project: {
    id: string;
    title: string;
    domain: string;
    description: string;
    deadline: string;
    duration: string;
    slots: number;
    status: string;
    faculty: {
      department?: string | null;
      profile: { fullName?: string | null };
    };
    _count: { applications: number };
  };
}

export default function SavedPage() {
  const router = useRouter();
  const [records, setRecords] = useState<SavedProjectRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [workingId, setWorkingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    apiRequest<SavedProjectRecord[]>("/saved-projects/me")
      .then(setRecords)
      .catch((requestError) =>
        setError(requestError instanceof Error ? requestError.message : "Could not load saved projects."),
      )
      .finally(() => setLoading(false));
  }, []);

  const removeSaved = async (projectId: string) => {
    setWorkingId(projectId);
    setError("");
    try {
      await apiRequest(`/saved-projects/${projectId}`, { method: "DELETE" });
      setRecords((current) => current.filter((record) => record.projectId !== projectId));
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Could not remove saved project.");
    } finally {
      setWorkingId(null);
    }
  };

  return (
    <main className="min-h-screen bg-[#f5f3ec] px-4 py-8 text-[#3a3a3a] md:px-8">
      <div className="mx-auto max-w-5xl">
        <button onClick={() => router.push("/student/feed")} className="mb-6 inline-flex items-center gap-2 text-sm font-bold text-[#8690a2]">
          <ArrowLeft className="h-4 w-4" /> Back to feed
        </button>

        <div className="mb-7">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#ab9b8e]">Student workspace</p>
          <h1 className="mt-2 font-playfair text-4xl font-extrabold text-[#8690a2]">Saved Projects</h1>
          <p className="mt-2 text-sm text-[#5a5a5a]">Saved projects are attached to your student account.</p>
        </div>

        {error && <div className="mb-5 rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

        {loading ? (
          <div className="rounded-2xl bg-[#e0decd]/60 p-8 text-center text-sm font-semibold text-[#8690a2]">Loading saved projects…</div>
        ) : records.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#ab9b8e]/40 bg-[#e0decd]/45 p-10 text-center">
            <h2 className="text-lg font-extrabold text-[#8690a2]">No saved projects yet</h2>
            <p className="mt-2 text-sm text-[#5a5a5a]">Use the Save button on any faculty project in your feed.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {records.map(({ project }) => {
              const remaining = Math.max(0, project.slots - project._count.applications);
              return (
                <article key={project.id} className="rounded-2xl border border-[#ab9b8e]/25 bg-white/75 p-5 shadow-sm">
                  <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
                    <div>
                      <div className="mb-2 flex flex-wrap gap-2">
                        <span className="rounded-full bg-[#8690a2]/10 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-[#8690a2]">{project.domain}</span>
                        <span className="rounded-full bg-[#e0decd] px-2.5 py-1 text-[10px] font-bold uppercase text-[#5a5a5a]">{project.status}</span>
                      </div>
                      <h2 className="text-xl font-extrabold text-[#3a3a3a]">{project.title}</h2>
                      <p className="mt-1 text-sm font-semibold text-[#8690a2]">
                        {project.faculty.profile.fullName || "SRM Faculty"}
                        {project.faculty.department ? ` · ${project.faculty.department}` : ""}
                      </p>
                      <p className="mt-3 text-sm leading-6 text-[#5a5a5a]">{project.description}</p>
                      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-xs text-[#5a5a5a]">
                        <span className="inline-flex items-center gap-1"><CalendarDays className="h-3.5 w-3.5" /> Deadline {new Date(project.deadline).toLocaleDateString()}</span>
                        <span>{remaining} slots remaining</span>
                        <span>{project.duration}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => void removeSaved(project.id)}
                      disabled={workingId === project.id}
                      className="inline-flex items-center gap-2 rounded-xl border border-red-300 px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-50 disabled:opacity-50"
                    >
                      <X className="h-4 w-4" /> {workingId === project.id ? "Removing…" : "Remove"}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
