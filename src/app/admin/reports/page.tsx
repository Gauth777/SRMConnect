"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import AdminShell from "@/components/admin/AdminShell";
import LoadingScreen from "@/components/admin/LoadingScreen";
import { AdminToastProvider, useAdminToast } from "@/components/admin/AdminToast";

interface AdminData {
  name: string;
  email: string;
}

interface ReportItem {
  id: number;
  reportId: string;
  time: string;
  reporterName: string;
  reporterRole: string;
  againstTitle: string;
  reason: string;
  description: string;
  status: "open" | "resolved";
}

const initialReports: ReportItem[] = [
  {
    id: 1, reportId: "#234", time: "5h ago",
    reporterName: "Rahul Sharma", reporterRole: "Student",
    againstTitle: "Fake Hackathon Opportunity",
    reason: "Misleading information",
    description: "This post contains false claims about the prize money and eligibility criteria.",
    status: "open",
  },
  {
    id: 2, reportId: "#235", time: "8h ago",
    reporterName: "Ananya Krishnan", reporterRole: "Student",
    againstTitle: "Unauthorized Certificate Claim",
    reason: "Inappropriate content",
    description: "A student is claiming a certificate that was never verified by any faculty.",
    status: "open",
  },
  {
    id: 3, reportId: "#231", time: "1d ago",
    reporterName: "Dr. Godfrey", reporterRole: "Faculty",
    againstTitle: "Spam Application",
    reason: "Spam / Duplicate",
    description: "Multiple duplicate applications from the same student with different names.",
    status: "resolved",
  },
];

function ReportsContent() {
  const { showToast } = useAdminToast();
  const [activeTab, setActiveTab] = useState<"open" | "resolved">("open");
  const [reports, setReports] = useState<ReportItem[]>(initialReports);
  const [viewPost, setViewPost] = useState<ReportItem | null>(null);

  const filtered = reports.filter((r) => r.status === activeTab);
  const openCount = reports.filter((r) => r.status === "open").length;

  const handleDismiss = (id: number) => {
    setReports((prev) => prev.map((r) => (r.id === id ? { ...r, status: "resolved" } : r)));
    showToast("Report dismissed — no action taken", "success");
  };

  const handleRemove = (id: number) => {
    setReports((prev) => prev.map((r) => (r.id === id ? { ...r, status: "resolved" } : r)));
    showToast("Post removed and report resolved", "error");
  };

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
        Reports & Disputes
      </h2>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "20px", borderBottom: "1px solid #C7CAB6", paddingBottom: "8px" }}>
        {[
          { key: "open" as const, label: `Open Reports (${openCount})` },
          { key: "resolved" as const, label: "Resolved" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              padding: "10px 20px",
              borderRadius: "10px",
              border: "none",
              background: activeTab === tab.key ? "#63807B" : "transparent",
              color: activeTab === tab.key ? "white" : "#4A5E58",
              fontSize: "13px",
              fontWeight: activeTab === tab.key ? 700 : 600,
              cursor: "pointer",
              fontFamily: "Inter, sans-serif",
              transition: "all 0.2s",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Report Cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <AnimatePresence mode="wait">
          {filtered.map((report, i) => (
            <motion.div
              key={report.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25, delay: i * 0.05 }}
              style={{
                background: "rgba(255,255,255,0.9)",
                border: "1px solid #C7CAB6",
                borderRadius: "16px",
                padding: "20px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px", flexWrap: "wrap", gap: "8px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ fontSize: "16px" }}>🚨</span>
                  <span style={{ fontSize: "14px", fontWeight: 700, color: "#2C3830" }}>Report {report.reportId}</span>
                </div>
                <span style={{ fontSize: "11px", color: "#7D9185" }}>{report.time}</span>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginBottom: "16px" }}>
                <div style={{ fontSize: "13px", color: "#4A5E58" }}>
                  <strong style={{ color: "#2C3830" }}>Reported by:</strong> {report.reporterName} ({report.reporterRole})
                </div>
                <div style={{ fontSize: "13px", color: "#4A5E58" }}>
                  <strong style={{ color: "#2C3830" }}>Against:</strong> Post "{report.againstTitle}"
                </div>
                <div style={{ fontSize: "13px", color: "#4A5E58" }}>
                  <strong style={{ color: "#2C3830" }}>Reason:</strong> {report.reason}
                </div>
                <div style={{ fontSize: "12px", color: "#7D9185", marginTop: "4px" }}>
                  "{report.description}"
                </div>
              </div>

              {activeTab === "open" && (
                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                  <button
                    onClick={() => setViewPost(report)}
                    style={{
                      padding: "8px 16px",
                      borderRadius: "10px",
                      border: "1px solid #7D9185",
                      background: "transparent",
                      color: "#7D9185",
                      fontSize: "12px",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    View Post
                  </button>
                  <button
                    onClick={() => handleDismiss(report.id)}
                    style={{
                      padding: "8px 16px",
                      borderRadius: "10px",
                      border: "1px solid #8B956B",
                      background: "transparent",
                      color: "#8B956B",
                      fontSize: "12px",
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    Dismiss Report
                  </button>
                  <button
                    onClick={() => handleRemove(report.id)}
                    style={{
                      padding: "8px 16px",
                      borderRadius: "10px",
                      border: "none",
                      background: "#C0392B",
                      color: "white",
                      fontSize: "12px",
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    Remove Post
                  </button>
                </div>
              )}

              {activeTab === "resolved" && (
                <div style={{ fontSize: "12px", color: "#8B956B", fontWeight: 700, display: "flex", alignItems: "center", gap: "6px" }}>
                  <span>✅</span> Resolved
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
        {filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: "40px", color: "#7D9185", fontSize: "14px" }}>
            No reports in this category.
          </div>
        )}
      </div>

      {/* View Post Modal */}
      <AnimatePresence>
        {viewPost && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
              background: "rgba(0,0,0,0.4)", zIndex: 200,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
            onClick={() => setViewPost(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.2 }}
              style={{
                background: "white",
                borderRadius: "16px",
                padding: "24px",
                maxWidth: 520,
                width: "90%",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 style={{ fontFamily: "Playfair Display, Georgia, serif", fontSize: "18px", fontWeight: 700, color: "#2C3830", marginBottom: "12px" }}>
                Post Details
              </h3>
              <div style={{ fontSize: "13px", color: "#4A5E58", marginBottom: "8px" }}>
                <strong>Title:</strong> {viewPost.againstTitle}
              </div>
              <div style={{ fontSize: "13px", color: "#4A5E58", marginBottom: "8px" }}>
                <strong>Reported by:</strong> {viewPost.reporterName} ({viewPost.reporterRole})
              </div>
              <div style={{ fontSize: "13px", color: "#4A5E58", marginBottom: "8px" }}>
                <strong>Reason:</strong> {viewPost.reason}
              </div>
              <div style={{ fontSize: "12px", color: "#7D9185", marginBottom: "20px" }}>
                {viewPost.description}
              </div>
              <button
                onClick={() => setViewPost(null)}
                style={{
                  padding: "10px 20px",
                  borderRadius: "10px",
                  border: "1px solid #7D9185",
                  background: "transparent",
                  color: "#7D9185",
                  fontSize: "13px",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function AdminReportsPage() {
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
        <ReportsContent />
      </AdminShell>
    </AdminToastProvider>
  );
}
