"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Building2, GraduationCap, Search, ShieldCheck, UserRound } from "lucide-react";
import { apiRequest } from "@/lib/api";

interface FacultyRecord {
  id: string;
  employeeId: string;
  designation?: string | null;
  campus?: string | null;
  department?: string | null;
  domains: string[];
  skills: string[];
  verificationStatus: "PENDING" | "VERIFIED" | "REJECTED";
  profile: {
    fullName?: string | null;
    email: string;
  };
  _count: { projects: number };
}

export default function FacultyPage() {
  const router = useRouter();
  const [faculty, setFaculty] = useState<FacultyRecord[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    apiRequest<FacultyRecord[]>("/profiles/faculty")
      .then(setFaculty)
      .catch((requestError) =>
        setError(requestError instanceof Error ? requestError.message : "Could not load faculty directory."),
      )
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const value = query.trim().toLowerCase();
    if (!value) return faculty;
    return faculty.filter((member) =>
      [
        member.profile.fullName || "",
        member.profile.email,
        member.department || "",
        member.designation || "",
        member.campus || "",
        ...member.domains,
        ...member.skills,
      ].some((field) => field.toLowerCase().includes(value)),
    );
  }, [faculty, query]);

  return (
    <main className="min-h-screen bg-[#f5f3ec] px-4 py-8 text-[#3a3a3a] md:px-8">
      <div className="mx-auto max-w-6xl">
        <button onClick={() => router.push("/student/feed")} className="mb-6 inline-flex items-center gap-2 text-sm font-bold text-[#8690a2]">
          <ArrowLeft className="h-4 w-4" /> Back to feed
        </button>

        <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#ab9b8e]">SRM Connect</p>
            <h1 className="mt-1 font-playfair text-4xl font-extrabold text-[#8690a2]">Faculty Directory</h1>
            <p className="mt-2 text-sm text-[#5a5a5a]">Faculty profiles are loaded from the SRM Connect database.</p>
          </div>
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#ab9b8e]" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search faculty, domain or skill" className="w-full rounded-xl border border-[#bdd1d3] bg-white/70 py-2.5 pl-10 pr-4 text-sm outline-none" />
          </div>
        </div>

        {error && <div className="mb-5 rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

        {loading ? (
          <div className="rounded-2xl bg-[#e0decd]/60 p-8 text-center text-sm font-semibold text-[#8690a2]">Loading faculty…</div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#ab9b8e]/40 bg-[#e0decd]/40 p-10 text-center">
            <GraduationCap className="mx-auto h-9 w-9 text-[#ab9b8e]" />
            <h2 className="mt-4 text-lg font-extrabold text-[#8690a2]">No faculty profiles found</h2>
            <p className="mt-2 text-sm text-[#5a5a5a]">Faculty will appear here after completing their SRM Connect profile.</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {filtered.map((member) => (
              <article key={member.id} className="rounded-2xl border border-[#ab9b8e]/25 bg-white/75 p-5 shadow-sm">
                <div className="flex gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#8690a2]/15 text-[#8690a2]">
                    <UserRound className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-lg font-extrabold text-[#3a3a3a]">{member.profile.fullName || "SRM Faculty"}</h2>
                      {member.verificationStatus === "VERIFIED" && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-1 text-[10px] font-extrabold text-emerald-700">
                          <ShieldCheck className="h-3 w-3" /> Verified
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-sm font-semibold text-[#8690a2]">{member.designation || "Faculty"}</p>
                    <p className="mt-1 text-xs text-[#5a5a5a]">{member.profile.email}</p>

                    <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-xs text-[#5a5a5a]">
                      {member.department && <span className="inline-flex items-center gap-1"><GraduationCap className="h-3.5 w-3.5" /> {member.department}</span>}
                      {member.campus && <span className="inline-flex items-center gap-1"><Building2 className="h-3.5 w-3.5" /> {member.campus}</span>}
                      <span>{member._count.projects} project{member._count.projects === 1 ? "" : "s"}</span>
                    </div>

                    {member.domains.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-1.5">
                        {member.domains.slice(0, 5).map((domain) => (
                          <span key={domain} className="rounded-full bg-[#e0decd]/75 px-2.5 py-1 text-[10px] font-bold text-[#5a5a5a]">{domain}</span>
                        ))}
                      </div>
                    )}

                    {member.skills.length > 0 && (
                      <p className="mt-3 text-xs text-[#5a5a5a]">
                        <span className="font-bold text-[#8690a2]">Skills:</span> {member.skills.slice(0, 6).join(", ")}
                      </p>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
