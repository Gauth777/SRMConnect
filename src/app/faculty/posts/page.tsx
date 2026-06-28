"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function FacultyPostsPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const data = localStorage.getItem("campusconnect_user");
    if (!data) { router.push("/login/faculty"); return; }
    const parsed = JSON.parse(data);
    if (parsed.role !== "faculty" || !parsed.loggedIn) { router.push("/login/faculty"); return; }
    if (!parsed.profileComplete) { router.push("/faculty/setup"); return; }
  }, [router]);

  if (!mounted) return null;

  return (
    <div style={{ minHeight: "100vh", background: "#F0EBF5", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Inter, sans-serif" }}>
      <div style={{ background: "rgba(255,255,255,0.85)", borderRadius: "24px", padding: "3rem", textAlign: "center", border: "1px solid rgba(168,152,184,0.3)", maxWidth: "400px", width: "90%" }}>
        <div style={{ fontSize: "48px", marginBottom: "16px" }}>📋</div>
        <h1 style={{ fontFamily: "Playfair Display, Georgia, serif", color: "#3D2A4A", fontSize: "28px", marginBottom: "8px" }}>My Posts</h1>
        <p style={{ color: "#7B6B8A", fontSize: "14px", marginBottom: "24px" }}>Your posted projects and opportunities will appear here.</p>
        <button onClick={() => router.push("/faculty/dashboard")}
          style={{ padding: "10px 24px", borderRadius: "12px", border: "none", background: "#7B6B8A", color: "white", fontSize: "13px", fontWeight: 700, cursor: "pointer" }}>
          ← Back to Dashboard
        </button>
      </div>
    </div>
  );
}
