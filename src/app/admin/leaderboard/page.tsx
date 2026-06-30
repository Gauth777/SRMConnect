"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import AdminShell from "@/components/admin/AdminShell";
import LoadingScreen from "@/components/admin/LoadingScreen";
import { AdminToastProvider, useAdminToast } from "@/components/admin/AdminToast";
import { Pencil } from "lucide-react";

interface AdminData {
  name: string;
  email: string;
}

interface PointActivity {
  id: number;
  activity: string;
  points: number;
}

const initialActivities: PointActivity[] = [
  { id: 1, activity: "Faculty-endorsed certification", points: 10 },
  { id: 2, activity: "Verified technical achievement", points: 20 },
  { id: 3, activity: "Selected for a project", points: 15 },
  { id: 4, activity: "Successfully completed project", points: 50 },
  { id: 5, activity: "Hackathon participation", points: 10 },
  { id: 6, activity: "Hackathon finalist", points: 30 },
  { id: 7, activity: "Hackathon winner", points: 60 },
  { id: 8, activity: "Research paper / publication", points: 75 },
  { id: 9, activity: "Patent / major recognition", points: 100 },
  { id: 10, activity: "Faculty-verified contribution", points: 30 },
  { id: 11, activity: "Helping complete campus project", points: 25 },
];

function LeaderboardContent() {
  const { showToast } = useAdminToast();
  const [activities, setActivities] = useState<PointActivity[]>(initialActivities);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editValue, setEditValue] = useState("");
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const startEdit = (id: number, currentPoints: number) => {
    setEditingId(id);
    setEditValue(String(currentPoints));
  };

  const saveEdit = (id: number) => {
    const val = parseInt(editValue, 10);
    if (isNaN(val) || val < 0) {
      showToast("Please enter a valid number", "error");
      return;
    }
    setActivities((prev) => prev.map((a) => (a.id === id ? { ...a, points: val } : a)));
    setEditingId(null);
    showToast("Points updated successfully", "success");
  };

  const handleSaveAll = () => {
    showToast("All changes saved", "success");
  };

  const handleReset = () => {
    setShowResetConfirm(false);
    showToast("All student points reset for the new semester", "warning");
  };

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
        Leaderboard Points Configuration
      </h2>

      {/* Points Table */}
      <div style={{ marginTop: "24px", marginBottom: "24px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {activities.map((a, i) => (
            <motion.div
              key={a.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: i * 0.03 }}
              style={{
                background: "rgba(255,255,255,0.9)",
                border: "1px solid #C7CAB6",
                borderRadius: "12px",
                padding: "14px 18px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: "12px",
              }}
            >
              <span style={{ fontSize: "13px", color: "#2C3830", fontWeight: 600, flex: 1, minWidth: 0 }}>
                {a.activity}
              </span>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                {editingId === a.id ? (
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <input
                      type="number"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") saveEdit(a.id);
                        if (e.key === "Escape") setEditingId(null);
                      }}
                      autoFocus
                      style={{
                        width: 60,
                        padding: "6px 8px",
                        borderRadius: "8px",
                        border: "1px solid #63807B",
                        background: "white",
                        fontSize: "14px",
                        color: "#2C3830",
                        fontWeight: 700,
                        fontFamily: "Inter, sans-serif",
                        textAlign: "center",
                        outline: "none",
                      }}
                    />
                    <button
                      onClick={() => saveEdit(a.id)}
                      style={{
                        padding: "6px 12px",
                        borderRadius: "8px",
                        border: "none",
                        background: "#8B956B",
                        color: "white",
                        fontSize: "11px",
                        fontWeight: 700,
                        cursor: "pointer",
                      }}
                    >
                      Save
                    </button>
                  </div>
                ) : (
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span
                      style={{
                        fontFamily: "Playfair Display, Georgia, serif",
                        fontSize: "18px",
                        fontWeight: 700,
                        color: "#63807B",
                        minWidth: 40,
                        textAlign: "right",
                      }}
                    >
                      {a.points}
                    </span>
                    <button
                      onClick={() => startEdit(a.id, a.points)}
                      style={{
                        padding: "6px",
                        borderRadius: "8px",
                        border: "1px solid #C7CAB6",
                        background: "transparent",
                        color: "#7D9185",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Pencil style={{ width: 14, height: 14 }} />
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Save All Button */}
      <button
        onClick={handleSaveAll}
        style={{
          width: "100%",
          padding: "14px",
          borderRadius: "12px",
          border: "none",
          background: "#63807B",
          color: "white",
          fontSize: "14px",
          fontWeight: 700,
          cursor: "pointer",
          fontFamily: "Inter, sans-serif",
          marginBottom: "24px",
          transition: "background 0.2s",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = "#4A5E58")}
        onMouseLeave={(e) => (e.currentTarget.style.background = "#63807B")}
      >
        Save All Changes
      </button>

      {/* Reset Section */}
      <div
        style={{
          background: "rgba(226,195,131,0.15)",
          border: "1px solid #E2C383",
          borderRadius: "12px",
          padding: "20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "12px",
        }}
      >
        <div>
          <div style={{ fontSize: "14px", fontWeight: 700, color: "#2C3830", marginBottom: "4px" }}>⚠️ Semester Reset</div>
          <div style={{ fontSize: "12px", color: "#4A5E58" }}>
            Reset all student points to 0 while keeping lifetime achievement records.
          </div>
        </div>
        <button
          onClick={() => setShowResetConfirm(true)}
          style={{
            padding: "10px 20px",
            borderRadius: "10px",
            border: "none",
            background: "#E2C383",
            color: "#2C3830",
            fontSize: "13px",
            fontWeight: 700,
            cursor: "pointer",
            fontFamily: "Inter, sans-serif",
            transition: "background 0.2s",
            whiteSpace: "nowrap",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "#d4b46e")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "#E2C383")}
        >
          Reset Semester Points
        </button>
      </div>

      {/* Reset Confirmation Modal */}
      <AnimatePresence>
        {showResetConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
              background: "rgba(0,0,0,0.4)", zIndex: 200,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
            onClick={() => setShowResetConfirm(false)}
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
                maxWidth: 420,
                width: "90%",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ fontSize: "24px", marginBottom: "8px" }}>⚠️</div>
              <h3 style={{ fontFamily: "Playfair Display, Georgia, serif", fontSize: "18px", fontWeight: 700, color: "#2C3830", marginBottom: "8px" }}>
                Reset Semester Points
              </h3>
              <p style={{ fontSize: "13px", color: "#4A5E58", marginBottom: "20px" }}>
                This will reset all student points to 0 for the new semester. Lifetime achievement records will be preserved. This action cannot be undone.
              </p>
              <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
                <button
                  onClick={() => setShowResetConfirm(false)}
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
                  onClick={handleReset}
                  style={{
                    padding: "10px 20px",
                    borderRadius: "10px",
                    border: "none",
                    background: "#E2C383",
                    color: "#2C3830",
                    fontSize: "13px",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  Confirm Reset
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function AdminLeaderboardPage() {
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
        <LeaderboardContent />
      </AdminShell>
    </AdminToastProvider>
  );
}
