"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import AdminShell from "@/components/admin/AdminShell";
import LoadingScreen from "@/components/admin/LoadingScreen";
import { AdminToastProvider, useAdminToast } from "@/components/admin/AdminToast";
import { ArrowRight, Users, GraduationCap, FileText, AlertTriangle, ShieldCheck, TrendingUp, Activity, BookOpen, UserPlus } from "lucide-react";

interface AdminData {
  name: string;
  email: string;
}

function DashboardContent() {
  const router = useRouter();
  const { showToast } = useAdminToast();

  const stats = [
    { icon: Users, label: "Total Students", value: "1,247", color: "#63807B" },
    { icon: GraduationCap, label: "Total Faculty", value: "89", color: "#7D9185" },
    { icon: FileText, label: "Active Posts", value: "34", color: "#8B956B" },
    { icon: AlertTriangle, label: "Pending Reports", value: "3", color: "#E2C383" },
    { icon: ShieldCheck, label: "FA Tagged Faculty", value: "12", color: "#63807B" },
    { icon: TrendingUp, label: "This Week New Joins", value: "28", color: "#8B956B" },
  ];

  const quickActions = [
    { label: "Assign FA Tag", route: "/admin/fa-tags" },
    { label: "Review Posts", route: "/admin/moderation" },
    { label: "View Reports", route: "/admin/reports" },
    { label: "Configure Points", route: "/admin/leaderboard" },
  ];

  const activities = [
    { icon: "🟢", text: "Rahul Kumar joined as Student", time: "2h ago", borderColor: "#8B956B" },
    { icon: "🟢", text: "Dr. Godfrey posted \"AI Traffic Optimization\"", time: "3h ago", borderColor: "#8B956B" },
    { icon: "🔴", text: "Report filed on Post #234 by student", time: "5h ago", borderColor: "#C0392B" },
    { icon: "🟡", text: "Priya R. assigned Faculty Advisor tag", time: "1d ago", borderColor: "#E2C383" },
    { icon: "🔴", text: "Post flagged as inappropriate", time: "1d ago", borderColor: "#C0392B" },
    { icon: "🟢", text: "Ananya K. completed profile setup", time: "2d ago", borderColor: "#8B956B" },
  ];

  const topPosts = [
    { title: "AI Traffic Optimization", applicants: 12 },
    { title: "ML Research Assistant", applicants: 8 },
    { title: "Blockchain Cert Verify", applicants: 6 },
  ];

  const recentJoins = [
    { initial: "A", name: "Ananya K.", role: "Student", time: "2h ago" },
    { initial: "D", name: "Dr. Baskar", role: "Faculty", time: "5h ago" },
    { initial: "R", name: "Rahul M.", role: "Student", time: "1d ago" },
  ];

  const pendingCount = 3;
  const unresolvedReports = 2;
  const faTagRequests = 1;

  return (
    <div style={{ display: "flex", width: "100%" }}>
      {/* Main Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Stats Grid */}
        <div className="admin-stats-grid" style={{ marginBottom: "24px" }}>
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
                  cursor: "default",
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
                  <span style={{ fontSize: "12px", color: "#4A5E58", fontFamily: "Inter, sans-serif" }}>
                    {s.label}
                  </span>
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

        {/* Quick Actions */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px", marginBottom: "24px" }}>
          {quickActions.map((action, i) => (
            <motion.button
              key={action.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: 0.3 + i * 0.05 }}
              onClick={() => router.push(action.route)}
              style={{
                background: "#63807B",
                color: "white",
                borderRadius: "12px",
                padding: "14px 16px",
                fontSize: "13px",
                fontWeight: 700,
                border: "none",
                cursor: "pointer",
                fontFamily: "Inter, sans-serif",
                transition: "background 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#4A5E58")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "#63807B")}
            >
              + {action.label}
            </motion.button>
          ))}
        </div>

        {/* Mobile: stack quick actions */}
        <style jsx>{`
          @media (max-width: 768px) {
            div[style*="gridTemplateColumns: repeat(4"] {
              grid-template-columns: repeat(2, 1fr) !important;
            }
          }
          @media (max-width: 480px) {
            div[style*="gridTemplateColumns: repeat(4"] {
              grid-template-columns: 1fr !important;
            }
          }
        `}</style>

        {/* Pending Actions Banner */}
        {pendingCount > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.5 }}
            style={{
              background: "rgba(226,195,131,0.2)",
              border: "1px solid #E2C383",
              borderRadius: "12px",
              padding: "16px 20px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "12px",
              marginBottom: "24px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#2C3830", fontSize: "13px", fontWeight: 600 }}>
              <span>⚠️</span>
              <span>
                {pendingCount} posts pending moderation · {unresolvedReports} reports unresolved · {faTagRequests} FA tag request pending
              </span>
            </div>
            <button
              onClick={() => router.push("/admin/moderation")}
              style={{
                background: "transparent",
                border: "none",
                color: "#63807B",
                fontSize: "13px",
                fontWeight: 700,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "4px",
              }}
            >
              Review Now <ArrowRight style={{ width: 14, height: 14 }} />
            </button>
          </motion.div>
        )}

        {/* Recent Activity */}
        <div style={{ marginBottom: "24px" }}>
          <h2
            style={{
              fontFamily: "Playfair Display, Georgia, serif",
              fontSize: "22px",
              fontWeight: 700,
              color: "#2C3830",
              marginBottom: "16px",
            }}
          >
            Recent Activity
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {activities.map((activity, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.25, delay: 0.6 + i * 0.05 }}
                style={{
                  background: "rgba(255,255,255,0.85)",
                  borderLeft: `3px solid ${activity.borderColor}`,
                  borderRadius: "10px",
                  padding: "12px 16px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: "8px",
                }}
              >
                <span style={{ fontSize: "13px", color: "#2C3830", fontWeight: 500 }}>
                  {activity.icon} {activity.text}
                </span>
                <span style={{ fontSize: "11px", color: "#7D9185", fontWeight: 500, whiteSpace: "nowrap" }}>
                  {activity.time}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Sidebar */}
      <aside
        className="admin-right-sidebar"
        style={{
          width: "260px",
          marginLeft: "24px",
          display: "flex",
          flexDirection: "column",
          gap: "20px",
          flexShrink: 0,
        }}
      >
        {/* Platform Health */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          style={{
            background: "rgba(255,255,255,0.9)",
            border: "1px solid #C7CAB6",
            borderRadius: "16px",
            padding: "20px",
          }}
        >
          <h3
            style={{
              fontFamily: "Playfair Display, Georgia, serif",
              fontSize: "16px",
              fontWeight: 700,
              color: "#2C3830",
              marginBottom: "16px",
            }}
          >
            Platform Health
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {[
              { label: "Active Users Today", value: "142", color: "#8B956B" },
              { label: "Posts This Week", value: "18", color: "#8B956B" },
              { label: "Applications Today", value: "34", color: "#8B956B" },
              { label: "Reports Resolved", value: "8", color: "#8B956B" },
            ].map((item) => (
              <div key={item.label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: item.color, flexShrink: 0 }} />
                  <span style={{ fontSize: "12px", color: "#4A5E58", fontWeight: 500 }}>{item.label}</span>
                </div>
                <span style={{ fontSize: "13px", fontWeight: 700, color: "#2C3830" }}>{item.value}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Top Posts This Week */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.35 }}
          style={{
            background: "rgba(255,255,255,0.9)",
            border: "1px solid #C7CAB6",
            borderRadius: "16px",
            padding: "20px",
          }}
        >
          <h3
            style={{
              fontFamily: "Playfair Display, Georgia, serif",
              fontSize: "16px",
              fontWeight: 700,
              color: "#2C3830",
              marginBottom: "16px",
            }}
          >
            Top Posts This Week
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {topPosts.map((post, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "8px 0",
                  borderBottom: i < topPosts.length - 1 ? "1px solid rgba(199,202,182,0.5)" : "none",
                }}
              >
                <span style={{ fontSize: "12px", color: "#2C3830", fontWeight: 500 }}>{post.title}</span>
                <span style={{ fontSize: "11px", color: "#7D9185", fontWeight: 600, whiteSpace: "nowrap" }}>
                  {post.applicants} applicants
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Recent Joins */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.5 }}
          style={{
            background: "rgba(255,255,255,0.9)",
            border: "1px solid #C7CAB6",
            borderRadius: "16px",
            padding: "20px",
          }}
        >
          <h3
            style={{
              fontFamily: "Playfair Display, Georgia, serif",
              fontSize: "16px",
              fontWeight: 700,
              color: "#2C3830",
              marginBottom: "16px",
            }}
          >
            Recent Joins
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {recentJoins.map((join, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div
                  style={{
                    width: "28px",
                    height: "28px",
                    borderRadius: "50%",
                    background: "#63807B",
                    color: "white",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "10px",
                    fontWeight: 700,
                    flexShrink: 0,
                  }}
                >
                  {join.initial}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: "12px", fontWeight: 600, color: "#2C3830" }}>{join.name}</div>
                  <div style={{ fontSize: "10px", color: "#7D9185" }}>
                    {join.role} · {join.time}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </aside>
    </div>
  );
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [adminData, setAdminData] = useState<AdminData | null>(null);

  useEffect(() => {
    setMounted(true);
    const data = localStorage.getItem("campusconnect_user");
    if (!data) {
      router.push("/login/admin");
      return;
    }
    const parsed = JSON.parse(data);
    if (parsed.role !== "admin") {
      router.push("/login/admin");
      return;
    }
    if (!parsed.loggedIn) {
      router.push("/login/admin");
      return;
    }
    setAdminData({ name: parsed.name || "Admin", email: parsed.email || "" });
    setIsLoading(false);
  }, [router]);

  if (!mounted) return null;
  if (isLoading || !adminData) return <LoadingScreen />;

  return (
    <AdminToastProvider>
      <AdminShell adminName={adminData.name} adminEmail={adminData.email}>
        <DashboardContent />
      </AdminShell>
    </AdminToastProvider>
  );
}
