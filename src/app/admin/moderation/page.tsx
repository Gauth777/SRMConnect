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

interface PostItem {
  id: number;
  type: string;
  faculty: string;
  dept: string;
  time: string;
  title: string;
  skills: string[];
  duration: string;
  slots: number;
  deadline: string;
  status: "pending" | "approved" | "rejected";
}

const initialPosts: PostItem[] = [
  {
    id: 1, type: "PROJECT", faculty: "Dr. Godfrey", dept: "CSE", time: "2h ago",
    title: "AI-based Traffic Optimization System", skills: ["Python", "TensorFlow", "OpenCV"],
    duration: "3 months", slots: 4, deadline: "July 15", status: "pending",
  },
  {
    id: 2, type: "RESEARCH", faculty: "Dr. Baskar M.", dept: "CSE", time: "4h ago",
    title: "Federated Learning for Healthcare Data", skills: ["Python", "PyTorch", "Privacy"],
    duration: "6 months", slots: 2, deadline: "Aug 1", status: "pending",
  },
  {
    id: 3, type: "HACKATHON", faculty: "IEEE SRM", dept: "SRM", time: "6h ago",
    title: "Smart India Hackathon 2025 Team", skills: ["Full Stack", "AI", "IoT"],
    duration: "36 hours", slots: 6, deadline: "June 30", status: "pending",
  },
  {
    id: 4, type: "PROJECT", faculty: "Dr. Priya R.", dept: "ECE", time: "1d ago",
    title: "VLSI Design Automation Tool", skills: ["Verilog", "Python", "CAD"],
    duration: "4 months", slots: 3, deadline: "July 20", status: "approved",
  },
  {
    id: 5, type: "RESEARCH", faculty: "Dr. Lakshmi N.", dept: "IT", time: "2d ago",
    title: "Cloud Security Framework", skills: ["AWS", "Security", "DevOps"],
    duration: "5 months", slots: 2, deadline: "Aug 10", status: "rejected",
  },
];

function ModerationContent() {
  const { showToast } = useAdminToast();
  const [activeTab, setActiveTab] = useState<"pending" | "approved" | "rejected">("pending");
  const [posts, setPosts] = useState<PostItem[]>(initialPosts);
  const [previewPost, setPreviewPost] = useState<PostItem | null>(null);
  const [rejectPost, setRejectPost] = useState<PostItem | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const filteredPosts = posts.filter((p) => p.status === activeTab);
  const pendingCount = posts.filter((p) => p.status === "pending").length;

  const handleApprove = (id: number) => {
    setPosts((prev) => prev.map((p) => (p.id === id ? { ...p, status: "approved" } : p)));
    showToast("Post approved and now visible to students", "success");
  };

  const handleReject = (id: number) => {
    if (!rejectPost) return;
    setPosts((prev) => prev.map((p) => (p.id === id ? { ...p, status: "rejected" } : p)));
    showToast("Post rejected", "warning");
    setRejectPost(null);
    setRejectReason("");
  };

  const tabs = [
    { key: "pending" as const, label: `Pending (${pendingCount})` },
    { key: "approved" as const, label: "Approved" },
    { key: "rejected" as const, label: "Rejected" },
  ];

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
        Post Moderation
      </h2>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "20px", borderBottom: "1px solid #C7CAB6", paddingBottom: "8px" }}>
        {tabs.map((tab) => (
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

      {/* Post Cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <AnimatePresence mode="wait">
          {filteredPosts.map((post, i) => (
            <motion.div
              key={post.id}
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
                  <span
                    style={{
                      background: "#63807B",
                      color: "white",
                      fontSize: "10px",
                      fontWeight: 700,
                      padding: "2px 8px",
                      borderRadius: "4px",
                      letterSpacing: "0.5px",
                    }}
                  >
                    🚀 {post.type}
                  </span>
                  <span style={{ fontSize: "12px", color: "#4A5E58", fontWeight: 600 }}>
                    {post.faculty} · {post.dept}
                  </span>
                </div>
                <span style={{ fontSize: "11px", color: "#7D9185" }}>{post.time}</span>
              </div>

              <h3
                style={{
                  fontFamily: "Playfair Display, Georgia, serif",
                  fontSize: "16px",
                  fontWeight: 700,
                  color: "#2C3830",
                  marginBottom: "8px",
                }}
              >
                "{post.title}"
              </h3>

              <div style={{ fontSize: "12px", color: "#4A5E58", marginBottom: "8px" }}>
                <strong>Skills:</strong> {post.skills.join(", ")}
              </div>
              <div style={{ fontSize: "12px", color: "#7D9185", marginBottom: "16px" }}>
                Duration: {post.duration} · {post.slots} slots · Deadline: {post.deadline}
              </div>

              {activeTab === "pending" && (
                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                  <button
                    onClick={() => setPreviewPost(post)}
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
                    Preview Full Post
                  </button>
                  <button
                    onClick={() => handleApprove(post.id)}
                    style={{
                      padding: "8px 16px",
                      borderRadius: "10px",
                      border: "none",
                      background: "#8B956B",
                      color: "white",
                      fontSize: "12px",
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    ✅ Approve
                  </button>
                  <button
                    onClick={() => setRejectPost(post)}
                    style={{
                      padding: "8px 16px",
                      borderRadius: "10px",
                      border: "1px solid #C0392B",
                      background: "transparent",
                      color: "#C0392B",
                      fontSize: "12px",
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    ❌ Reject
                  </button>
                </div>
              )}

              {activeTab === "approved" && (
                <div style={{ fontSize: "12px", color: "#8B956B", fontWeight: 700, display: "flex", alignItems: "center", gap: "6px" }}>
                  <span>✅</span> Approved and visible to students
                </div>
              )}

              {activeTab === "rejected" && (
                <div style={{ fontSize: "12px", color: "#C0392B", fontWeight: 700, display: "flex", alignItems: "center", gap: "6px" }}>
                  <span>❌</span> Rejected
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
        {filteredPosts.length === 0 && (
          <div style={{ textAlign: "center", padding: "40px", color: "#7D9185", fontSize: "14px" }}>
            No posts in this category.
          </div>
        )}
      </div>

      {/* Preview Modal */}
      <AnimatePresence>
        {previewPost && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
              background: "rgba(0,0,0,0.4)", zIndex: 200,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
            onClick={() => setPreviewPost(null)}
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
                maxHeight: "80vh",
                overflow: "auto",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 style={{ fontFamily: "Playfair Display, Georgia, serif", fontSize: "18px", fontWeight: 700, color: "#2C3830", marginBottom: "12px" }}>
                "{previewPost.title}"
              </h3>
              <div style={{ fontSize: "12px", color: "#4A5E58", marginBottom: "8px" }}>
                <strong>Posted by:</strong> {previewPost.faculty} · {previewPost.dept}
              </div>
              <div style={{ fontSize: "12px", color: "#4A5E58", marginBottom: "8px" }}>
                <strong>Skills:</strong> {previewPost.skills.join(", ")}
              </div>
              <div style={{ fontSize: "12px", color: "#4A5E58", marginBottom: "8px" }}>
                <strong>Duration:</strong> {previewPost.duration}
              </div>
              <div style={{ fontSize: "12px", color: "#4A5E58", marginBottom: "8px" }}>
                <strong>Slots:</strong> {previewPost.slots}
              </div>
              <div style={{ fontSize: "12px", color: "#4A5E58", marginBottom: "16px" }}>
                <strong>Deadline:</strong> {previewPost.deadline}
              </div>
              <div style={{ fontSize: "12px", color: "#4A5E58", marginBottom: "20px" }}>
                <strong>Description:</strong> This is a detailed preview of the post content. In a real application, this would contain the full description, requirements, and other details provided by the faculty member.
              </div>
              <button
                onClick={() => setPreviewPost(null)}
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

      {/* Reject Modal */}
      <AnimatePresence>
        {rejectPost && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
              background: "rgba(0,0,0,0.4)", zIndex: 200,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
            onClick={() => setRejectPost(null)}
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
                maxWidth: 480,
                width: "90%",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 style={{ fontFamily: "Playfair Display, Georgia, serif", fontSize: "18px", fontWeight: 700, color: "#2C3830", marginBottom: "8px" }}>
                Reject Post
              </h3>
              <p style={{ fontSize: "13px", color: "#4A5E58", marginBottom: "12px" }}>
                "{rejectPost.title}"
              </p>
              <label style={{ fontSize: "12px", color: "#4A5E58", fontWeight: 600, display: "block", marginBottom: "6px" }}>
                Reason for rejection (optional):
              </label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={3}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: "10px",
                  border: "1px solid #C7CAB6",
                  background: "rgba(255,255,255,0.9)",
                  fontSize: "13px",
                  color: "#2C3830",
                  fontFamily: "Inter, sans-serif",
                  resize: "vertical",
                  outline: "none",
                  marginBottom: "16px",
                }}
              />
              <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
                <button
                  onClick={() => setRejectPost(null)}
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
                  Cancel
                </button>
                <button
                  onClick={() => handleReject(rejectPost.id)}
                  style={{
                    padding: "10px 20px",
                    borderRadius: "10px",
                    border: "none",
                    background: "#C0392B",
                    color: "white",
                    fontSize: "13px",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  Reject Post
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function AdminModerationPage() {
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
        <ModerationContent />
      </AdminShell>
    </AdminToastProvider>
  );
}
