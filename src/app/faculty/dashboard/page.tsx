"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function FacultyDashboardPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [facultyData, setFacultyData] = useState<{
    name: string;
    designation: string;
    department: string;
    campus: string;
  } | null>(null);

  useEffect(() => {
    setMounted(true);
    const data = localStorage.getItem("campusconnect_user");
    if (!data) { router.push("/login/faculty"); return; }
    const parsed = JSON.parse(data);
    if (parsed.role !== "faculty") { router.push("/login/faculty"); return; }
    if (!parsed.loggedIn) { router.push("/login/faculty"); return; }
    if (parsed.profileComplete === false) { router.push("/faculty/setup"); return; }
    setFacultyData({
      name: parsed.name || "Faculty",
      designation: parsed.designation || "Professor",
      department: parsed.department || "CSE",
      campus: parsed.campus || "KTR"
    });
  }, [router]);

  // Critical — return null until mounted to prevent hydration mismatch
  if (!mounted) return null;
  if (!facultyData) return null;

  return (
    <div style={{ minHeight: "100vh", background: "#F0EBF5", fontFamily: "Inter, sans-serif" }}>

      {/* NAVBAR */}
      <header style={{
        position: "fixed", top: 0, left: 0, right: 0, height: "56px",
        background: "#EDE8F0", borderBottom: "1px solid rgba(168,152,184,0.3)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 24px", zIndex: 50
      }}>
        <span style={{ fontFamily: "Playfair Display, Georgia, serif", fontSize: "20px", fontWeight: 800, color: "#7B6B8A" }}>
          CampusConnect
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <button
            onClick={() => { localStorage.clear(); router.push("/"); }}
            style={{ padding: "6px 14px", borderRadius: "8px", border: "1px solid rgba(168,152,184,0.4)", background: "transparent", color: "#A898B8", fontSize: "12px", cursor: "pointer" }}
          >
            Logout
          </button>
          <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "#7B6B8A", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", fontWeight: 700 }}>
            {facultyData.name.charAt(0)}
          </div>
        </div>
      </header>

      {/* BODY */}
      <div style={{ display: "flex", paddingTop: "56px", minHeight: "100vh" }}>

        {/* LEFT SIDEBAR */}
        <aside style={{
          width: "220px", background: "#EDE8F0",
          borderRight: "1px solid rgba(168,152,184,0.25)",
          padding: "20px 12px", position: "fixed",
          top: "56px", bottom: 0,
          display: "flex", flexDirection: "column", gap: "4px",
          overflowY: "auto"
        }}>
          {/* Mini profile */}
          <div style={{ background: "rgba(255,255,255,0.7)", borderRadius: "12px", padding: "12px", marginBottom: "12px", border: "1px solid rgba(168,152,184,0.3)" }}>
            <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: "#7B6B8A", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px", fontWeight: 700, marginBottom: "8px" }}>
              {facultyData.name.charAt(0)}
            </div>
            <div style={{ fontSize: "12px", fontWeight: 700, color: "#3D2A4A" }}>{facultyData.name}</div>
            <div style={{ fontSize: "10px", color: "#7B6B8A" }}>{facultyData.designation} · {facultyData.department}</div>
          </div>

          {/* Nav */}
          {[
            { label: "📊 Dashboard", path: "/faculty/dashboard", active: true },
            { label: "➕ Create Post", path: "/faculty/create-post", active: false },
            { label: "📋 My Posts", path: "/faculty/posts", active: false },
            { label: "👥 Applicants", path: "/faculty/applicants", active: false },
            { label: "🎓 Students", path: "/faculty/students", active: false },
            { label: "👤 My Profile", path: "/faculty/profile", active: false },
          ].map((item) => (
            <button key={item.path} onClick={() => router.push(item.path)}
              style={{
                width: "100%", padding: "10px 12px", borderRadius: "10px",
                border: "none", background: item.active ? "#7B6B8A" : "transparent",
                color: item.active ? "white" : "#7B6B8A",
                fontSize: "13px", fontWeight: item.active ? 700 : 500,
                textAlign: "left", cursor: "pointer", transition: "all 0.2s"
              }}>
              {item.label}
            </button>
          ))}
        </aside>

        {/* MAIN */}
        <main style={{ marginLeft: "220px", flex: 1, padding: "24px" }}>

          {/* Stats */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "16px", marginBottom: "24px" }}>
            {[
              { label: "Total Posts", value: "3", color: "#7B6B8A" },
              { label: "Total Applicants", value: "12", color: "#9B7BB0" },
              { label: "Accepted", value: "4", color: "#677661" },
              { label: "Pending", value: "8", color: "#E06C6B" },
            ].map((s) => (
              <div key={s.label} style={{ background: "rgba(255,255,255,0.85)", borderRadius: "16px", padding: "20px", border: "1px solid rgba(168,152,184,0.3)" }}>
                <div style={{ fontFamily: "Playfair Display, Georgia, serif", fontSize: "32px", fontWeight: 800, color: s.color }}>{s.value}</div>
                <div style={{ fontSize: "12px", color: "#7B6B8A", marginTop: "4px" }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* CTA */}
          <button onClick={() => router.push("/faculty/create-post")}
            style={{ width: "100%", padding: "16px", borderRadius: "14px", border: "none", background: "#7B6B8A", color: "white", fontSize: "15px", fontWeight: 700, cursor: "pointer", marginBottom: "24px" }}>
            + Post a New Project or Opportunity
          </button>

          {/* Recent Posts */}
          <div style={{ fontFamily: "Playfair Display, Georgia, serif", fontSize: "22px", fontWeight: 700, color: "#3D2A4A", marginBottom: "16px" }}>
            Your Recent Posts
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {[
              { type: "PROJECT", title: "AI-based Traffic Optimization", applicants: 5, deadline: "July 15", status: "Open" },
              { type: "RESEARCH", title: "Federated Learning for Healthcare", applicants: 4, deadline: "July 20", status: "Open" },
              { type: "HACKATHON", title: "Smart India Hackathon Team", applicants: 3, deadline: "June 30", status: "Closed" },
            ].map((post, i) => (
              <div key={i} style={{ background: "rgba(255,255,255,0.9)", borderRadius: "14px", padding: "16px", border: "1px solid #D4C8E0", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px" }}>
                <div>
                  <span style={{ display: "inline-block", background: "#7B6B8A", color: "white", fontSize: "10px", fontWeight: 700, padding: "2px 8px", borderRadius: "4px", marginBottom: "6px" }}>{post.type}</span>
                  <div style={{ fontSize: "14px", fontWeight: 700, color: "#3D2A4A" }}>{post.title}</div>
                  <div style={{ fontSize: "11px", color: "#7B6B8A", marginTop: "4px" }}>{post.applicants} applicants · Deadline: {post.deadline}</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
                  <span style={{ fontSize: "11px", fontWeight: 700, color: post.status === "Open" ? "#677661" : "#E06C6B", background: post.status === "Open" ? "rgba(103,118,97,0.1)" : "rgba(224,108,107,0.1)", padding: "3px 8px", borderRadius: "20px" }}>{post.status}</span>
                  <button style={{ padding: "6px 12px", borderRadius: "8px", border: "1px solid #A898B8", background: "transparent", color: "#7B6B8A", fontSize: "11px", fontWeight: 600, cursor: "pointer" }}>
                    View Applicants
                  </button>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
