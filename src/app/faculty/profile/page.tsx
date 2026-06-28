"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function FacultyProfilePage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [facultyData, setFacultyData] = useState<Record<string, string> | null>(null);

  useEffect(() => {
    setMounted(true);
    const data = localStorage.getItem("campusconnect_user");
    if (!data) { router.push("/login/faculty"); return; }
    const parsed = JSON.parse(data);
    if (parsed.role !== "faculty" || !parsed.loggedIn) { router.push("/login/faculty"); return; }
    if (!parsed.profileComplete) { router.push("/faculty/setup"); return; }
    setFacultyData(parsed);
  }, [router]);

  if (!mounted || !facultyData) return null;

  return (
    <div style={{ minHeight: "100vh", background: "#F0EBF5", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Inter, sans-serif", padding: "2rem" }}>
      <div style={{ background: "rgba(255,255,255,0.85)", borderRadius: "24px", padding: "2.5rem", border: "1px solid rgba(168,152,184,0.3)", maxWidth: "500px", width: "100%" }}>
        <h1 style={{ fontFamily: "Playfair Display, Georgia, serif", fontSize: "28px", fontWeight: 800, color: "#3D2A4A", marginBottom: "1rem" }}>Profile Placeholder</h1>
        <p style={{ color: "#7B6B8A", fontSize: "14px", marginBottom: "2rem" }}>Profile details would be displayed here.</p>
        <button onClick={() => router.push("/faculty/dashboard")}
          style={{ width: "100%", padding: "10px 24px", borderRadius: "12px", border: "none", background: "#7B6B8A", color: "white", fontSize: "13px", fontWeight: 700, cursor: "pointer" }}>
          ← Back to Dashboard
        </button>
      </div>
    </div>
  );
}
