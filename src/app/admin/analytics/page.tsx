"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import AdminShell from "@/components/admin/AdminShell";
import LoadingScreen from "@/components/admin/LoadingScreen";
import { AdminToastProvider, useAdminToast } from "@/components/admin/AdminToast";
import { Users, GraduationCap, FileText, AlertTriangle, ShieldCheck, TrendingUp } from "lucide-react";

interface AdminData {
  name: string;
  email: string;
}

function AnalyticsContent() {
  const stats = [
    { icon: Users, label: "Total Students", value: "1,247", color: "#63807B" },
    { icon: GraduationCap, label: "Total Faculty", value: "89", color: "#7D9185" },
    { icon: FileText, label: "Active Posts", value: "34", color: "#8B956B" },
    { icon: AlertTriangle, label: "Pending Reports", value: "3", color: "#E2C383" },
    { icon: ShieldCheck, label: "FA Tagged Faculty", value: "12", color: "#63807B" },
    { icon: TrendingUp, label: "This Week New Joins", value: "28", color: "#8B956B" },
  ];

  const newUsersData = [
    { day: "Mon", value: 8 },
    { day: "Tue", value: 12 },
    { day: "Wed", value: 5 },
    { day: "Thu", value: 18 },
    { day: "Fri", value: 9 },
    { day: "Sat", value: 3 },
    { day: "Sun", value: 7 },
  ];
  const maxNewUsers = Math.max(...newUsersData.map((d) => d.value));

  const postsByType = [
    { label: "Project", value: 18 },
    { label: "Hackathon", value: 9 },
    { label: "Research", value: 6 },
    { label: "Inhouse", value: 3 },
  ];
  const maxPosts = Math.max(...postsByType.map((d) => d.value));

  const deptData = [
    { label: "CSE", value: 420 },
    { label: "ECE", value: 280 },
    { label: "MECH", value: 210 },
    { label: "IT", value: 160 },
    { label: "Others", value: 177 },
  ];
  const maxDept = Math.max(...deptData.map((d) => d.value));

  const barStyle = (value: number, max: number, color: string) => ({
    height: `${Math.max((value / max) * 100, 4)}%`,
    background: color,
    borderRadius: "4px 4px 0 0",
    minHeight: 4,
  });

  const hBarStyle = (value: number, max: number) => ({
    width: `${Math.max((value / max) * 100, 4)}%`,
    height: "20px",
    background: "linear-gradient(90deg, #63807B, #8B956B)",
    borderRadius: "4px",
    minWidth: 4,
  });

  return (
    <div>
      <h2
        style={{
          fontFamily: "Playfair Display, Georgia, serif",
          fontSize: "24px",
          fontWeight: 700,
          color: "#2C3830",
          marginBottom: "20px",
        }}
      >
        Platform Analytics
      </h2>

      {/* Stats Overview */}
      <div className="admin-stats-grid" style={{ marginBottom: "28px" }}>
        {stats.map((s, i) => {
          const Icon = s.icon;
          return (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
              style={{
                background: "rgba(255,255,255,0.9)",
                border: "1px solid #C7CAB6",
                borderRadius: "16px",
                padding: "20px",
                transition: "box-shadow 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = "0 4px 20px rgba(99,128,123,0.12)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                <Icon style={{ width: 16, height: 16, color: s.color }} />
                <span style={{ fontSize: "12px", color: "#4A5E58", fontFamily: "Inter, sans-serif" }}>{s.label}</span>
              </div>
              <div
                style={{
                  fontFamily: "Playfair Display, Georgia, serif",
                  fontSize: "36px",
                  fontWeight: 800,
                  color: s.color,
                }}
              >
                {s.value}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Charts Section */}
      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        {/* Chart 1 — New Users This Week */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
          style={{
            background: "rgba(255,255,255,0.9)",
            border: "1px solid #C7CAB6",
            borderRadius: "16px",
            padding: "24px",
          }}
        >
          <h3
            style={{
              fontFamily: "Playfair Display, Georgia, serif",
              fontSize: "16px",
              fontWeight: 700,
              color: "#2C3830",
              marginBottom: "20px",
            }}
          >
            New Users This Week
          </h3>
          <div style={{ display: "flex", alignItems: "flex-end", gap: "12px", height: 160, paddingBottom: 24, borderBottom: "1px solid #C7CAB6" }}>
            {newUsersData.map((d) => (
              <div key={d.day} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", height: "100%", justifyContent: "flex-end" }}>
                <span style={{ fontSize: "11px", fontWeight: 700, color: "#63807B" }}>{d.value}</span>
                <div style={{ width: "100%", ...barStyle(d.value, maxNewUsers, "#63807B") }} />
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: "12px", marginTop: 8 }}>
            {newUsersData.map((d) => (
              <div key={d.day} style={{ flex: 1, textAlign: "center", fontSize: "11px", color: "#7D9185", fontWeight: 600 }}>
                {d.day}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Chart 2 — Posts by Type */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
          style={{
            background: "rgba(255,255,255,0.9)",
            border: "1px solid #C7CAB6",
            borderRadius: "16px",
            padding: "24px",
          }}
        >
          <h3
            style={{
              fontFamily: "Playfair Display, Georgia, serif",
              fontSize: "16px",
              fontWeight: 700,
              color: "#2C3830",
              marginBottom: "20px",
            }}
          >
            Posts by Type
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {postsByType.map((d) => (
              <div key={d.label} style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <span style={{ fontSize: "12px", color: "#4A5E58", fontWeight: 600, width: 90, textAlign: "right", flexShrink: 0 }}>
                  {d.label}
                </span>
                <div style={{ flex: 1, display: "flex", alignItems: "center", gap: "10px" }}>
                  <div style={hBarStyle(d.value, maxPosts)} />
                  <span style={{ fontSize: "12px", fontWeight: 700, color: "#2C3830", minWidth: 24 }}>{d.value}</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Chart 3 — Top Departments */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.5 }}
          style={{
            background: "rgba(255,255,255,0.9)",
            border: "1px solid #C7CAB6",
            borderRadius: "16px",
            padding: "24px",
          }}
        >
          <h3
            style={{
              fontFamily: "Playfair Display, Georgia, serif",
              fontSize: "16px",
              fontWeight: 700,
              color: "#2C3830",
              marginBottom: "20px",
            }}
          >
            Top Departments by Student Count
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {deptData.map((d) => (
              <div key={d.label} style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <span style={{ fontSize: "12px", color: "#4A5E58", fontWeight: 600, width: 60, textAlign: "right", flexShrink: 0 }}>
                  {d.label}
                </span>
                <div style={{ flex: 1, display: "flex", alignItems: "center", gap: "10px" }}>
                  <div style={hBarStyle(d.value, maxDept)} />
                  <span style={{ fontSize: "12px", fontWeight: 700, color: "#2C3830", minWidth: 36 }}>{d.value}</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default function AdminAnalyticsPage() {
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
        <AnalyticsContent />
      </AdminShell>
    </AdminToastProvider>
  );
}
