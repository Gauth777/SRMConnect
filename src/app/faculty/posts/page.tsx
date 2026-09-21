"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ApiError, apiRequest } from "@/lib/api";

interface FacultyProject {
  id: string;
  postType: string;
  title: string;
  domain: string;
  mode: string;
  status: string;
  deadline: string;
  _count?: { applications?: number };
}

export default function FacultyPostsPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<FacultyProject[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setMounted(true);
      const data = localStorage.getItem("campusconnect_user");
      if (!data) { router.replace("/login/faculty"); return; }

      let parsed: any;
      try { parsed = JSON.parse(data); }
      catch {
        localStorage.removeItem("campusconnect_user");
        router.replace("/login/faculty");
        return;
      }

      if (parsed.role !== "faculty" || !parsed.loggedIn) {
        router.replace("/login/faculty");
        return;
      }
      if (!parsed.profileComplete) {
        router.replace("/faculty/setup");
        return;
      }

      try {
        const rows = await apiRequest<FacultyProject[]>("/projects/mine");
        if (!cancelled) setProjects(rows);
      } catch (requestError) {
        if (requestError instanceof ApiError && requestError.status === 401) {
          localStorage.removeItem("campusconnect_user");
          router.replace("/login/faculty");
          return;
        }
        if (!cancelled) {
          setError(requestError instanceof Error ? requestError.message : "Could not load your posts.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void load();
    return () => { cancelled = true; };
  }, [router]);

  if (!mounted) return null;

  return (
    <div style={{ minHeight: "100vh", background: "#F0EBF5", padding: "32px", fontFamily: "Inter, sans-serif" }}>
      <div style={{ maxWidth: "900px", margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "16px", marginBottom: "24px" }}>
          <div>
            <h1 style={{ fontFamily: "Playfair Display, Georgia, serif", color: "#3D2A4A", fontSize: "32px", margin: 0 }}>My Posts</h1>
            <p style={{ color: "#7B6B8A", fontSize: "14px", marginTop: "6px" }}>Projects and opportunities published from your faculty account.</p>
          </div>
          <button
            onClick={() => router.push("/faculty/create-post")}
            style={{ padding: "10px 16px", borderRadius: "10px", border: "none", background: "#7B6B8A", color: "white", fontSize: "13px", fontWeight: 700, cursor: "pointer" }}
          >
            + Create Post
          </button>
        </div>

        {loading ? (
          <div style={{ color: "#7B6B8A" }}>Loading posts…</div>
        ) : error ? (
          <div style={{ background: "#fff", border: "1px solid rgba(224,108,107,0.35)", borderRadius: "14px", padding: "18px", color: "#9A1A1B" }}>
            {error}
          </div>
        ) : projects.length === 0 ? (
          <div style={{ background: "rgba(255,255,255,0.85)", borderRadius: "20px", padding: "36px", textAlign: "center", border: "1px solid rgba(168,152,184,0.3)" }}>
            <div style={{ fontSize: "48px", marginBottom: "12px" }}>📋</div>
            <h2 style={{ color: "#3D2A4A", fontSize: "22px", marginBottom: "8px" }}>No posts yet</h2>
            <p style={{ color: "#7B6B8A", fontSize: "14px", marginBottom: "20px" }}>Once you publish a project or opportunity, it will appear here.</p>
            <button
              onClick={() => router.push("/faculty/create-post")}
              style={{ padding: "10px 18px", borderRadius: "10px", border: "none", background: "#7B6B8A", color: "white", fontSize: "13px", fontWeight: 700, cursor: "pointer" }}
            >
              Create your first post
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {projects.map((post) => (
              <div
                key={post.id}
                style={{
                  background: "rgba(255,255,255,0.92)",
                  borderRadius: "16px",
                  padding: "18px",
                  border: "1px solid rgba(168,152,184,0.3)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: "16px",
                }}
              >
                <div>
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "8px" }}>
                    <span style={{ background: "#7B6B8A", color: "white", borderRadius: "999px", padding: "3px 9px", fontSize: "10px", fontWeight: 700 }}>
                      {post.postType}
                    </span>
                    <span style={{ background: "rgba(103,118,97,0.12)", color: "#677661", borderRadius: "999px", padding: "3px 9px", fontSize: "10px", fontWeight: 700 }}>
                      {post.status}
                    </span>
                  </div>
                  <div style={{ color: "#3D2A4A", fontSize: "16px", fontWeight: 700 }}>{post.title}</div>
                  <div style={{ color: "#7B6B8A", fontSize: "12px", marginTop: "6px" }}>
                    {post.domain} · {post.mode} · {post._count?.applications || 0} applicants · Deadline {new Date(post.deadline).toLocaleDateString()}
                  </div>
                </div>

                <button
                  onClick={() => router.push("/faculty/applicants")}
                  style={{ padding: "8px 12px", borderRadius: "8px", border: "1px solid #A898B8", background: "transparent", color: "#7B6B8A", fontSize: "11px", fontWeight: 600, cursor: "pointer", flexShrink: 0 }}
                >
                  View Applicants
                </button>
              </div>
            ))}
          </div>
        )}

        <button
          onClick={() => router.push("/faculty/dashboard")}
          style={{ marginTop: "24px", padding: "9px 14px", borderRadius: "10px", border: "1px solid #A898B8", background: "transparent", color: "#7B6B8A", fontSize: "12px", fontWeight: 600, cursor: "pointer" }}
        >
          ← Back to Dashboard
        </button>
      </div>
    </div>
  );
}
