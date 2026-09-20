"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Bookmark,
  Home,
  CalendarDays,
  FileText,
  GraduationCap,
  LogOut,
  RefreshCw,
  Search,
  User,
  Users,
} from "lucide-react";
import { apiRequest } from "@/lib/api";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

interface StudentProfile {
  id: string;
  email: string;
  fullName?: string | null;
  role: "STUDENT" | "FACULTY" | "ADMIN";
  student?: {
    registrationNo: string;
  } | null;
}

interface FeedProject {
  id: string;
  postType: "PROJECT" | "HACKATHON" | "RESEARCH" | "INHOUSE" | "GUEST_LECTURE" | "WORKSHOP";
  title: string;
  domain: string;
  description: string;
  mode: string;
  skills: string[];
  skillLevel: string;
  slots: number;
  duration: string;
  deadline: string;
  createdAt: string;
  faculty: {
    department?: string | null;
    designation?: string | null;
    profile: { fullName?: string | null };
  };
  _count: { applications: number };
}

interface ApplicationRecord {
  projectId: string;
}

interface SavedProjectRecord {
  projectId: string;
}

const TABS = ["All", "Projects", "Hackathons", "Research"] as const;

export default function FeedClient() {
  const router = useRouter();
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [projects, setProjects] = useState<FeedProject[]>([]);
  const [appliedProjectIds, setAppliedProjectIds] = useState<string[]>([]);
  const [savedProjectIds, setSavedProjectIds] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<(typeof TABS)[number]>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [workingProjectId, setWorkingProjectId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");

  const loadFeed = useCallback(async (quiet = false) => {
    if (!quiet) setLoading(true);
    setError("");

    try {
      const supabase = getSupabaseBrowserClient();
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData.user) {
        router.replace("/login/student");
        return;
      }

      const [profileRecord, projectRecords, applications, savedProjects] = await Promise.all([
        apiRequest<StudentProfile>("/profiles/me"),
        apiRequest<FeedProject[]>("/projects"),
        apiRequest<ApplicationRecord[]>("/applications/me"),
        apiRequest<SavedProjectRecord[]>("/saved-projects/me"),
      ]);

      if (profileRecord.role !== "STUDENT") {
        throw new Error("This account is not registered as a student.");
      }

      setProfile(profileRecord);
      setProjects(projectRecords);
      setAppliedProjectIds(applications.map((application) => application.projectId));
      setSavedProjectIds(savedProjects.map((saved) => saved.projectId));
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Could not load the student feed.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [router]);

  useEffect(() => {
    void loadFeed();
  }, [loadFeed]);

  const filteredProjects = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return projects.filter((project) => {
      const matchesTab =
        activeTab === "All" ||
        (activeTab === "Projects" && ["PROJECT", "INHOUSE", "WORKSHOP", "GUEST_LECTURE"].includes(project.postType)) ||
        (activeTab === "Hackathons" && project.postType === "HACKATHON") ||
        (activeTab === "Research" && project.postType === "RESEARCH");

      if (!matchesTab) return false;
      if (!query) return true;

      return [
        project.title,
        project.domain,
        project.description,
        project.faculty.profile.fullName || "",
        project.faculty.department || "",
        ...project.skills,
      ].some((value) => value.toLowerCase().includes(query));
    });
  }, [activeTab, projects, searchQuery]);

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2600);
  };

  const applyToProject = async (project: FeedProject) => {
    if (appliedProjectIds.includes(project.id)) return;

    setWorkingProjectId(project.id);
    setError("");
    try {
      await apiRequest(`/applications/projects/${project.id}`, {
        method: "POST",
        body: JSON.stringify({}),
      });

      setAppliedProjectIds((current) => [...current, project.id]);
      setProjects((current) =>
        current.map((item) =>
          item.id === project.id
            ? { ...item, _count: { applications: item._count.applications + 1 } }
            : item,
        ),
      );
      showToast("Application submitted. It is now available in My Applications.");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Could not submit application.");
    } finally {
      setWorkingProjectId(null);
    }
  };

  const toggleSaved = async (project: FeedProject) => {
    const isSaved = savedProjectIds.includes(project.id);
    setWorkingProjectId(project.id);
    setError("");

    try {
      await apiRequest(`/saved-projects/${project.id}`, {
        method: isSaved ? "DELETE" : "POST",
      });

      setSavedProjectIds((current) =>
        isSaved ? current.filter((id) => id !== project.id) : [...current, project.id],
      );
      showToast(isSaved ? "Removed from Saved Projects." : "Saved project.");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Could not update saved project.");
    } finally {
      setWorkingProjectId(null);
    }
  };

  const logout = async () => {
    await getSupabaseBrowserClient().auth.signOut({ scope: "local" });
    localStorage.removeItem("campusconnect_user");
    router.replace("/");
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f5f3ec] text-[#8690a2]">
        <div className="text-center">
          <RefreshCw className="mx-auto h-8 w-8 animate-spin" />
          <p className="mt-3 text-sm font-semibold">Loading your SRM Connect feed…</p>
        </div>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f3ec] text-[#3a3a3a]">
      <header className="sticky top-0 z-40 border-b border-[#ab9b8e]/25 bg-[#e0decd]/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 md:px-6">
          <button onClick={() => router.push("/student/feed")} className="font-playfair text-2xl font-extrabold text-[#8690a2]">
            CampusConnect
          </button>

          <div className="hidden max-w-xl flex-1 md:block">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#ab9b8e]" />
              <input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search faculty projects, domains or skills"
                className="w-full rounded-full border border-[#bdd1d3] bg-[#f5f3ec] py-2 pl-10 pr-4 text-sm outline-none focus:border-[#8690a2]"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setRefreshing(true);
                void loadFeed(true);
              }}
              disabled={refreshing}
              className="rounded-xl border border-[#ab9b8e]/30 p-2 text-[#8690a2] hover:bg-white/50 disabled:opacity-50"
              title="Refresh feed"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            </button>
            <button
              onClick={() => router.push("/student/profile")}
              className="hidden rounded-xl border border-[#ab9b8e]/30 px-3 py-2 text-left text-xs font-semibold text-[#5a5a5a] sm:block"
            >
              <span className="block text-[#8690a2]">{profile?.fullName || "Student"}</span>
              <span>{profile?.student?.registrationNo}</span>
            </button>
            <button onClick={logout} className="rounded-xl p-2 text-red-600 hover:bg-red-50" title="Logout">
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 md:grid-cols-[220px_minmax(0,1fr)] md:px-6">
        <aside className="h-fit rounded-2xl border border-[#ab9b8e]/20 bg-[#e0decd]/70 p-3 md:sticky md:top-20">
          <NavButton icon={Home} label="Feed" onClick={() => router.push("/student/feed")} active />
          <NavButton icon={FileText} label="My Applications" onClick={() => router.push("/student/applications")} />
          <NavButton icon={GraduationCap} label="Faculty Directory" onClick={() => router.push("/student/faculty")} />
          <NavButton icon={Bookmark} label="Saved Projects" onClick={() => router.push("/student/saved")} />
          <NavButton icon={User} label="My Profile" onClick={() => router.push("/student/profile")} />
        </aside>

        <main className="min-w-0">
          <div className="mb-6 flex flex-col gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#ab9b8e]">Student feed</p>
              <h1 className="mt-1 font-playfair text-3xl font-extrabold text-[#8690a2]">Faculty opportunities</h1>
              <p className="mt-2 text-sm text-[#5a5a5a]">Only projects published by registered faculty are shown here.</p>
            </div>

            <div className="relative md:hidden">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#ab9b8e]" />
              <input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search projects"
                className="w-full rounded-xl border border-[#bdd1d3] bg-white/70 py-2.5 pl-10 pr-4 text-sm outline-none"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {TABS.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`rounded-full px-4 py-2 text-xs font-bold transition ${activeTab === tab ? "bg-[#8690a2] text-white" : "border border-[#ab9b8e]/30 bg-white/60 text-[#5a5a5a] hover:bg-white"}`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {error && <div className="mb-5 rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

          {filteredProjects.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#ab9b8e]/40 bg-[#e0decd]/45 p-10 text-center">
              <Users className="mx-auto h-9 w-9 text-[#ab9b8e]" />
              <h2 className="mt-4 text-lg font-extrabold text-[#8690a2]">
                {projects.length === 0 ? "No faculty projects have been posted yet" : "No matching projects"}
              </h2>
              <p className="mx-auto mt-2 max-w-lg text-sm text-[#5a5a5a]">
                {projects.length === 0
                  ? "Once a faculty member publishes a project, it will appear here automatically."
                  : "Try another search term or clear the current filter."}
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredProjects.map((project) => {
                const applied = appliedProjectIds.includes(project.id);
                const saved = savedProjectIds.includes(project.id);
                const remaining = Math.max(0, project.slots - project._count.applications);
                const busy = workingProjectId === project.id;

                return (
                  <article key={project.id} className="rounded-2xl border border-[#ab9b8e]/25 bg-white/75 p-5 shadow-sm">
                    <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-start">
                      <div className="min-w-0 flex-1">
                        <div className="mb-3 flex flex-wrap items-center gap-2 text-[10px] font-extrabold uppercase tracking-wider">
                          <span className="rounded-full bg-[#8690a2]/10 px-2.5 py-1 text-[#8690a2]">{formatPostType(project.postType)}</span>
                          <span className="rounded-full bg-[#bdd1d3]/35 px-2.5 py-1 text-[#5a5a5a]">{project.domain}</span>
                          <span className="rounded-full bg-[#e0decd] px-2.5 py-1 text-[#5a5a5a]">{project.mode}</span>
                        </div>

                        <h2 className="text-xl font-extrabold text-[#3a3a3a]">{project.title}</h2>
                        <p className="mt-1 text-sm font-semibold text-[#8690a2]">
                          {project.faculty.profile.fullName || "SRM Faculty"}
                          {project.faculty.department ? ` · ${project.faculty.department}` : ""}
                          {project.faculty.designation ? ` · ${project.faculty.designation}` : ""}
                        </p>
                        <p className="mt-3 text-sm leading-6 text-[#5a5a5a]">{project.description}</p>

                        {project.skills.length > 0 && (
                          <div className="mt-4 flex flex-wrap gap-2">
                            {project.skills.map((skill) => (
                              <span key={skill} className="rounded-full border border-[#bdd1d3] bg-[#f5f3ec] px-2.5 py-1 text-[11px] font-semibold text-[#5a5a5a]">
                                {skill}
                              </span>
                            ))}
                          </div>
                        )}

                        <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs text-[#5a5a5a]">
                          <span className="inline-flex items-center gap-1.5"><CalendarDays className="h-3.5 w-3.5" /> Deadline {new Date(project.deadline).toLocaleDateString()}</span>
                          <span>{project.duration}</span>
                          <span>{remaining} of {project.slots} slots remaining</span>
                          <span>{project.skillLevel.replaceAll("_", " ")}</span>
                        </div>
                      </div>

                      <div className="flex shrink-0 gap-2">
                        <button
                          onClick={() => void toggleSaved(project)}
                          disabled={busy}
                          className={`inline-flex items-center gap-1.5 rounded-xl border px-4 py-2 text-xs font-bold transition disabled:opacity-50 ${saved ? "border-[#8690a2] bg-[#8690a2]/10 text-[#8690a2]" : "border-[#ab9b8e]/40 text-[#5a5a5a] hover:bg-[#f5f3ec]"}`}
                        >
                          <Bookmark className={`h-4 w-4 ${saved ? "fill-current" : ""}`} />
                          {saved ? "Saved" : "Save"}
                        </button>

                        <button
                          onClick={() => void applyToProject(project)}
                          disabled={applied || busy}
                          className="rounded-xl bg-[#8690a2] px-4 py-2 text-xs font-bold text-white transition hover:bg-[#748092] disabled:cursor-not-allowed disabled:bg-[#ab9b8e]"
                        >
                          {applied ? "Applied ✓" : busy ? "Working…" : "Apply"}
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </main>
      </div>

      {toast && <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-xl bg-[#3a3a3a] px-5 py-3 text-sm font-semibold text-white shadow-xl">{toast}</div>}
    </div>
  );
}

function NavButton({
  icon: Icon,
  label,
  onClick,
  active = false,
}: {
  icon: typeof User;
  label: string;
  onClick: () => void;
  active?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`mb-1 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition ${active ? "bg-[#8690a2] text-white" : "text-[#5a5a5a] hover:bg-white/60"}`}
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );
}

function formatPostType(type: FeedProject["postType"]) {
  return type
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
