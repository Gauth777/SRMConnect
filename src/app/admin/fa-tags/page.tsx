"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import AdminShell from "@/components/admin/AdminShell";
import LoadingScreen from "@/components/admin/LoadingScreen";
import { AdminToastProvider, useAdminToast } from "@/components/admin/AdminToast";

interface AdminData {
  name: string;
  email: string;
}

interface FacultyCard {
  id: number;
  name: string;
  department: string;
  campus: string;
  endorsements: number;
  projects: number;
  yearsExp: number;
  tagged: boolean;
}

const initialTagged: FacultyCard[] = [
  { id: 1, name: "Dr. Godfrey", department: "CSE", campus: "Kattankulathur", endorsements: 12, projects: 8, yearsExp: 10, tagged: true },
  { id: 2, name: "Dr. Lakshmi N.", department: "IT", campus: "KTR", endorsements: 8, projects: 15, yearsExp: 12, tagged: true },
  { id: 3, name: "Dr. Rajesh P.", department: "ECE", campus: "Ramapuram", endorsements: 6, projects: 10, yearsExp: 8, tagged: true },
];

const initialEligible: FacultyCard[] = [
  { id: 4, name: "Dr. Priya R.", department: "CSE", campus: "KTR", endorsements: 3, projects: 23, yearsExp: 5, tagged: false },
  { id: 5, name: "Dr. Baskar M.", department: "CSE", campus: "Kattankulathur", endorsements: 5, projects: 18, yearsExp: 7, tagged: false },
  { id: 6, name: "Dr. Suresh K.", department: "MECH", campus: "KTR", endorsements: 2, projects: 12, yearsExp: 6, tagged: false },
  { id: 7, name: "Dr. Anitha V.", department: "IT", campus: "Ramapuram", endorsements: 4, projects: 9, yearsExp: 4, tagged: false },
];

function FaTagsContent() {
  const { showToast } = useAdminToast();
  const [tagged, setTagged] = useState<FacultyCard[]>(initialTagged);
  const [eligible, setEligible] = useState<FacultyCard[]>(initialEligible);

  const handleRemove = (id: number) => {
    const faculty = tagged.find((f) => f.id === id);
    if (!faculty) return;
    setTagged((prev) => prev.filter((f) => f.id !== id));
    setEligible((prev) => [...prev, { ...faculty, tagged: false }]);
    showToast(`FA Tag removed from ${faculty.name}`, "success");
  };

  const handleAssign = (id: number) => {
    const faculty = eligible.find((f) => f.id === id);
    if (!faculty) return;
    setEligible((prev) => prev.filter((f) => f.id !== id));
    setTagged((prev) => [...prev, { ...faculty, tagged: true }]);
    showToast(`FA Tag assigned to ${faculty.name}`, "success");
  };

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);

  return (
    <div>
      <h2
        style={{
          fontFamily: "Playfair Display, Georgia, serif",
          fontSize: "24px",
          fontWeight: 700,
          color: "#2C3830",
          marginBottom: "4px",
        }}
      >
        Faculty Advisor Tag Management
      </h2>
      <p style={{ fontSize: "13px", color: "#7D9185", marginBottom: "24px", fontWeight: 500 }}>
        Assign or remove Faculty Advisor permissions
      </p>

      {/* Section 1 — Currently Tagged */}
      <div style={{ marginBottom: "32px" }}>
        <h3
          style={{
            fontFamily: "Playfair Display, Georgia, serif",
            fontSize: "18px",
            fontWeight: 700,
            color: "#2C3830",
            marginBottom: "16px",
          }}
        >
          Currently Tagged Faculty
        </h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "16px" }}>
          {tagged.map((f, i) => (
            <motion.div
              key={f.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.08 }}
              style={{
                background: "rgba(139,149,107,0.1)",
                border: "1px solid #8B956B",
                borderRadius: "16px",
                padding: "20px",
                display: "flex",
                flexDirection: "column",
                gap: "12px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div
                  style={{
                    width: "44px",
                    height: "44px",
                    borderRadius: "50%",
                    background: "#63807B",
                    color: "white",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "15px",
                    fontWeight: 700,
                    flexShrink: 0,
                  }}
                >
                  {getInitials(f.name)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: "14px", fontWeight: 700, color: "#2C3830" }}>{f.name}</div>
                  <div style={{ fontSize: "11px", color: "#8B956B", fontWeight: 600, display: "flex", alignItems: "center", gap: "4px" }}>
                    <span>✅</span> Faculty Advisor
                  </div>
                </div>
              </div>
              <div style={{ fontSize: "12px", color: "#4A5E58", fontWeight: 500 }}>
                {f.department} · {f.campus}
              </div>
              <div style={{ fontSize: "11px", color: "#7D9185" }}>
                {f.endorsements} endorsements given · {f.projects} projects verified
              </div>
              <button
                onClick={() => handleRemove(f.id)}
                style={{
                  marginTop: "4px",
                  padding: "8px 16px",
                  borderRadius: "10px",
                  border: "1px solid #C0392B",
                  background: "transparent",
                  color: "#C0392B",
                  fontSize: "12px",
                  fontWeight: 700,
                  cursor: "pointer",
                  fontFamily: "Inter, sans-serif",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(192,57,43,0.08)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                }}
              >
                Remove FA Tag
              </button>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Section 2 — Eligible Faculty */}
      <div>
        <h3
          style={{
            fontFamily: "Playfair Display, Georgia, serif",
            fontSize: "18px",
            fontWeight: 700,
            color: "#2C3830",
            marginBottom: "16px",
          }}
        >
          Eligible Faculty
        </h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "16px" }}>
          {eligible.map((f, i) => (
            <motion.div
              key={f.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 + i * 0.08 }}
              style={{
                background: "rgba(255,255,255,0.9)",
                border: "1px solid #C7CAB6",
                borderRadius: "16px",
                padding: "20px",
                display: "flex",
                flexDirection: "column",
                gap: "12px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div
                  style={{
                    width: "44px",
                    height: "44px",
                    borderRadius: "50%",
                    background: "#7D9185",
                    color: "white",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "15px",
                    fontWeight: 700,
                    flexShrink: 0,
                  }}
                >
                  {getInitials(f.name)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: "14px", fontWeight: 700, color: "#2C3830" }}>{f.name}</div>
                  <div style={{ fontSize: "11px", color: "#7D9185", fontWeight: 600, display: "flex", alignItems: "center", gap: "4px" }}>
                    <span>○</span> Not Tagged
                  </div>
                </div>
              </div>
              <div style={{ fontSize: "12px", color: "#4A5E58", fontWeight: 500 }}>
                {f.department} · {f.campus}
              </div>
              <div style={{ fontSize: "11px", color: "#7D9185" }}>
                {f.yearsExp} years experience · {f.projects} projects guided
              </div>
              <button
                onClick={() => handleAssign(f.id)}
                style={{
                  marginTop: "4px",
                  padding: "8px 16px",
                  borderRadius: "10px",
                  border: "none",
                  background: "#63807B",
                  color: "white",
                  fontSize: "12px",
                  fontWeight: 700,
                  cursor: "pointer",
                  fontFamily: "Inter, sans-serif",
                  transition: "background 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#4A5E58";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "#63807B";
                }}
              >
                Assign FA Tag
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function AdminFaTagsPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [adminData, setAdminData] = useState<AdminData | null>(null);

  useEffect(() => {
    setMounted(true);
    const data = localStorage.getItem("campusconnect_user");
    if (!data) { router.push("/login/admin"); return; }
    const parsed = JSON.parse(data);
    if (parsed.role !== "admin") { router.push("/login/admin"); return; }
    if (!parsed.loggedIn) { router.push("/login/admin"); return; }
    setAdminData({ name: parsed.name || "Admin", email: parsed.email || "" });
    setIsLoading(false);
  }, [router]);

  if (!mounted) return null;
  if (isLoading || !adminData) return <LoadingScreen />;

  return (
    <AdminToastProvider>
      <AdminShell adminName={adminData.name} adminEmail={adminData.email}>
        <FaTagsContent />
      </AdminShell>
    </AdminToastProvider>
  );
}
