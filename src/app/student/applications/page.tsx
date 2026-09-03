"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, CalendarDays, CheckCircle2, Clock3, XCircle } from "lucide-react";
import { apiRequest } from "@/lib/api";

interface StudentApplication {
  id: string;
  status: "PENDING" | "ACCEPTED" | "REJECTED" | "WITHDRAWN";
  createdAt: string;
  project: {
    id: string;
    title: string;
    domain: string;
    deadline: string;
    status: string;
    faculty: {
      department?: string | null;
      profile: { fullName?: string | null };
    };
  };
}

export default function ApplicationsPage() {
  const router = useRouter();
  const [applications, setApplications] = useState<StudentApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("campusconnect_user") || "null");
    if (!user?.loggedIn || user.role !== "student") {
      router.push("/login/student");
      return;
    }

    apiRequest<StudentApplication[]>("/applications/me")
      .then(setApplications)
      .catch((requestError) => setError(requestError instanceof Error ? requestError.message : "Could not load applications."))
      .finally(() => setLoading(false));
  }, [router]);

  const withdraw = async (applicationId: string) => {
    setUpdatingId(applicationId);
    setError("");
    try {
      await apiRequest(`/applications/${applicationId}/withdraw`, { method: "PATCH" });
      setApplications((current) =>
        current.map((application) =>
          application.id === applicationId ? { ...application, status: "WITHDRAWN" } : application,
        ),
      );
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Could not withdraw application.");
    } finally {
      setUpdatingId(null);
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
          <h1 className="mt-2 font-playfair text-4xl font-extrabold text-[#8690a2]" style={{ fontFamily: "Playfair Display, Georgia, serif" }}>My Applications</h1>
          <p className="mt-2 text-sm text-[#5a5a5a]">These records are loaded from the SRM Connect database.</p>
        </div>

        {error && <div className="mb-5 rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
        {loading ? (
          <div className="rounded-2xl border border-[#ab9b8e]/20 bg-[#e0decd]/70 p-8 text-center text-sm font-semibold text-[#8690a2]">Loading applications…</div>
        ) : applications.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#ab9b8e]/50 bg-[#e0decd]/50 p-10 text-center">
            <h2 className="text-lg font-bold text-[#8690a2]">No applications yet</h2>
            <p className="mt-2 text-sm text-[#5a5a5a]">Apply to a live faculty project from your feed and it will appear here.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {applications.map((application) => (
              <article key={application.id} className="rounded-2xl border border-[#ab9b8e]/25 bg-[#e0decd]/80 p-5 shadow-sm">
                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
                  <div>
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <StatusBadge status={application.status} />
                      <span className="rounded-full bg-[#bdd1d3]/40 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#5a5a5a]">{application.project.domain}</span>
                    </div>
                    <h2 className="text-xl font-extrabold text-[#8690a2]">{application.project.title}</h2>
                    <p className="mt-1 text-sm text-[#5a5a5a]">{application.project.faculty.profile.fullName || "SRM Faculty"} · {application.project.faculty.department || "SRM"}</p>
                    <div className="mt-3 flex flex-wrap gap-4 text-xs text-[#5a5a5a]">
                      <span className="inline-flex items-center gap-1"><Clock3 className="h-3.5 w-3.5" /> Applied {new Date(application.createdAt).toLocaleDateString()}</span>
                      <span className="inline-flex items-center gap-1"><CalendarDays className="h-3.5 w-3.5" /> Deadline {new Date(application.project.deadline).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {application.status === "PENDING" && (
                    <button
                      onClick={() => withdraw(application.id)}
                      disabled={updatingId === application.id}
                      className="rounded-xl border border-red-300 px-4 py-2 text-xs font-bold text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                    >
                      {updatingId === application.id ? "Withdrawing…" : "Withdraw application"}
                    </button>
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

function StatusBadge({ status }: { status: StudentApplication["status"] }) {
  const label = status.charAt(0) + status.slice(1).toLowerCase();
  const Icon = status === "ACCEPTED" ? CheckCircle2 : status === "REJECTED" || status === "WITHDRAWN" ? XCircle : Clock3;
  const classes = status === "ACCEPTED" ? "bg-emerald-100 text-emerald-700" : status === "REJECTED" || status === "WITHDRAWN" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700";
  return <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider ${classes}`}><Icon className="h-3.5 w-3.5" />{label}</span>;
}
