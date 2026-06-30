"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import AdminShell from "@/components/admin/AdminShell";
import LoadingScreen from "@/components/admin/LoadingScreen";
import { AdminToastProvider, useAdminToast } from "@/components/admin/AdminToast";
import { Search, Filter } from "lucide-react";

interface AdminData {
  name: string;
  email: string;
}

interface Student {
  id: number;
  name: string;
  regNo: string;
  department: string;
  year: string;
  status: "Active" | "Suspended";
}

interface Faculty {
  id: number;
  name: string;
  empId: string;
  department: string;
  designation: string;
  faStatus: boolean;
  status: "Active" | "Suspended";
}

const mockStudents: Student[] = [
  { id: 1, name: "Rahul Kumar", regNo: "RA2011003010001", department: "CSE", year: "3rd", status: "Active" },
  { id: 2, name: "Ananya Krishnan", regNo: "RA2011003010023", department: "ECE", year: "2nd", status: "Active" },
  { id: 3, name: "Priya Sharma", regNo: "RA2011003010045", department: "IT", year: "4th", status: "Suspended" },
  { id: 4, name: "Vikram Reddy", regNo: "RA2011003010067", department: "MECH", year: "3rd", status: "Active" },
  { id: 5, name: "Sneha Patel", regNo: "RA2011003010089", department: "CSE", year: "2nd", status: "Active" },
  { id: 6, name: "Arjun Mehta", regNo: "RA2011003010101", department: "ECE", year: "1st", status: "Active" },
  { id: 7, name: "Divya Nair", regNo: "RA2011003010123", department: "IT", year: "3rd", status: "Suspended" },
  { id: 8, name: "Karthik S.", regNo: "RA2011003010145", department: "CSE", year: "4th", status: "Active" },
];

const mockFaculty: Faculty[] = [
  { id: 1, name: "Dr. Godfrey", empId: "EMP001", department: "CSE", designation: "Professor", faStatus: true, status: "Active" },
  { id: 2, name: "Dr. Baskar M.", empId: "EMP002", department: "CSE", designation: "Associate Professor", faStatus: false, status: "Active" },
  { id: 3, name: "Dr. Priya R.", empId: "EMP003", department: "ECE", designation: "Assistant Professor", faStatus: false, status: "Active" },
  { id: 4, name: "Dr. Suresh K.", empId: "EMP004", department: "MECH", designation: "Professor", faStatus: false, status: "Suspended" },
  { id: 5, name: "Dr. Lakshmi N.", empId: "EMP005", department: "IT", designation: "HOD", faStatus: true, status: "Active" },
];

function UsersContent() {
  const { showToast } = useAdminToast();
  const [activeTab, setActiveTab] = useState<"students" | "faculty">("students");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"All" | "Active" | "Suspended">("All");
  const [students, setStudents] = useState<Student[]>(mockStudents);
  const [faculty, setFaculty] = useState<Faculty[]>(mockFaculty);
  const [deleteTarget, setDeleteTarget] = useState<{ type: "student" | "faculty"; item: Student | Faculty } | null>(null);

  const filteredStudents = students.filter((s) => {
    const matchSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.regNo.toLowerCase().includes(searchQuery.toLowerCase());
    const matchFilter = filterStatus === "All" || s.status === filterStatus;
    return matchSearch && matchFilter;
  });

  const filteredFaculty = faculty.filter((f) => {
    const matchSearch =
      f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.empId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchFilter = filterStatus === "All" || f.status === filterStatus;
    return matchSearch && matchFilter;
  });

  const toggleSuspendStudent = (id: number) => {
    setStudents((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: s.status === "Active" ? "Suspended" : "Active" } : s))
    );
    showToast("Student status updated", "success");
  };

  const toggleSuspendFaculty = (id: number) => {
    setFaculty((prev) =>
      prev.map((f) => (f.id === id ? { ...f, status: f.status === "Active" ? "Suspended" : "Active" } : f))
    );
    showToast("Faculty status updated", "success");
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    if (deleteTarget.type === "student") {
      setStudents((prev) => prev.filter((s) => s.id !== deleteTarget.item.id));
    } else {
      setFaculty((prev) => prev.filter((f) => f.id !== deleteTarget.item.id));
    }
    showToast("User deleted permanently", "success");
    setDeleteTarget(null);
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
        User Management
      </h2>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "20px" }}>
        {(["students", "faculty"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: "10px 24px",
              borderRadius: "10px",
              background: activeTab === tab ? "#63807B" : "transparent",
              color: activeTab === tab ? "white" : "#4A5E58",
              fontSize: "13px",
              fontWeight: activeTab === tab ? 700 : 600,
              cursor: "pointer",
              fontFamily: "Inter, sans-serif",
              border: activeTab === tab ? "none" : "1px solid #C7CAB6",
              transition: "all 0.2s",
            }}
          >
            {tab === "students" ? "Students" : "Faculty"}
          </button>
        ))}
      </div>

      {/* Search + Filter */}
      <div style={{ display: "flex", gap: "12px", marginBottom: "20px", flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
          <Search style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", width: 16, height: 16, color: "#7D9185" }} />
          <input
            type="text"
            placeholder={`Search ${activeTab}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: "100%",
              padding: "10px 12px 10px 38px",
              borderRadius: "10px",
              border: "1px solid #C7CAB6",
              background: "rgba(255,255,255,0.9)",
              fontSize: "13px",
              color: "#2C3830",
              fontFamily: "Inter, sans-serif",
              outline: "none",
            }}
          />
        </div>
        <div style={{ position: "relative" }}>
          <Filter style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", width: 14, height: 14, color: "#7D9185" }} />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as "All" | "Active" | "Suspended")}
            style={{
              padding: "10px 12px 10px 34px",
              borderRadius: "10px",
              border: "1px solid #C7CAB6",
              background: "rgba(255,255,255,0.9)",
              fontSize: "13px",
              color: "#2C3830",
              fontFamily: "Inter, sans-serif",
              cursor: "pointer",
              outline: "none",
            }}
          >
            <option value="All">All</option>
            <option value="Active">Active</option>
            <option value="Suspended">Suspended</option>
          </select>
        </div>
      </div>

      {/* Students Table */}
      {activeTab === "students" && (
        <div className="admin-table-container" style={{ background: "rgba(255,255,255,0.9)", borderRadius: "16px", border: "1px solid #C7CAB6", overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
            <thead>
              <tr style={{ background: "rgba(199,202,182,0.3)" }}>
                {["#", "Name", "Reg No", "Department", "Year", "Status", "Actions"].map((h) => (
                  <th key={h} style={{ padding: "12px 16px", textAlign: "left", color: "#2C3830", fontWeight: 700, fontSize: "12px", borderBottom: "1px solid #C7CAB6" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((s, i) => (
                <tr
                  key={s.id}
                  style={{
                    background: s.status === "Suspended" ? "rgba(192,57,43,0.05)" : "transparent",
                    borderBottom: "1px solid rgba(199,202,182,0.4)",
                  }}
                >
                  <td style={{ padding: "12px 16px", color: "#7D9185", fontWeight: 600 }}>{i + 1}</td>
                  <td style={{ padding: "12px 16px", color: "#2C3830", fontWeight: 600 }}>{s.name}</td>
                  <td style={{ padding: "12px 16px", color: "#4A5E58" }}>{s.regNo}</td>
                  <td style={{ padding: "12px 16px", color: "#4A5E58" }}>{s.department}</td>
                  <td style={{ padding: "12px 16px", color: "#4A5E58" }}>{s.year}</td>
                  <td style={{ padding: "12px 16px" }}>
                    <span
                      style={{
                        display: "inline-block",
                        padding: "3px 10px",
                        borderRadius: "20px",
                        fontSize: "11px",
                        fontWeight: 700,
                        background: s.status === "Active" ? "rgba(139,149,107,0.15)" : "rgba(192,57,43,0.1)",
                        color: s.status === "Active" ? "#8B956B" : "#C0392B",
                      }}
                    >
                      {s.status}
                    </span>
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                      <button
                        style={{
                          padding: "6px 12px",
                          borderRadius: "8px",
                          border: "1px solid #7D9185",
                          background: "transparent",
                          color: "#7D9185",
                          fontSize: "11px",
                          fontWeight: 600,
                          cursor: "pointer",
                        }}
                      >
                        View Profile
                      </button>
                      <button
                        onClick={() => toggleSuspendStudent(s.id)}
                        style={{
                          padding: "6px 12px",
                          borderRadius: "8px",
                          border: "1px solid #C0392B",
                          background: "transparent",
                          color: "#C0392B",
                          fontSize: "11px",
                          fontWeight: 600,
                          cursor: "pointer",
                        }}
                      >
                        {s.status === "Active" ? "Suspend" : "Activate"}
                      </button>
                      <button
                        onClick={() => setDeleteTarget({ type: "student", item: s })}
                        style={{
                          padding: "6px 12px",
                          borderRadius: "8px",
                          border: "none",
                          background: "#C0392B",
                          color: "white",
                          fontSize: "11px",
                          fontWeight: 600,
                          cursor: "pointer",
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Faculty Table */}
      {activeTab === "faculty" && (
        <div className="admin-table-container" style={{ background: "rgba(255,255,255,0.9)", borderRadius: "16px", border: "1px solid #C7CAB6", overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
            <thead>
              <tr style={{ background: "rgba(199,202,182,0.3)" }}>
                {["#", "Name", "Emp ID", "Department", "Designation", "FA Status", "Status", "Actions"].map((h) => (
                  <th key={h} style={{ padding: "12px 16px", textAlign: "left", color: "#2C3830", fontWeight: 700, fontSize: "12px", borderBottom: "1px solid #C7CAB6" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredFaculty.map((f, i) => (
                <tr
                  key={f.id}
                  style={{
                    background: f.status === "Suspended" ? "rgba(192,57,43,0.05)" : "transparent",
                    borderBottom: "1px solid rgba(199,202,182,0.4)",
                  }}
                >
                  <td style={{ padding: "12px 16px", color: "#7D9185", fontWeight: 600 }}>{i + 1}</td>
                  <td style={{ padding: "12px 16px", color: "#2C3830", fontWeight: 600 }}>{f.name}</td>
                  <td style={{ padding: "12px 16px", color: "#4A5E58" }}>{f.empId}</td>
                  <td style={{ padding: "12px 16px", color: "#4A5E58" }}>{f.department}</td>
                  <td style={{ padding: "12px 16px", color: "#4A5E58" }}>{f.designation}</td>
                  <td style={{ padding: "12px 16px" }}>
                    <span
                      style={{
                        display: "inline-block",
                        padding: "3px 10px",
                        borderRadius: "20px",
                        fontSize: "11px",
                        fontWeight: 700,
                        background: f.faStatus ? "rgba(99,128,123,0.15)" : "rgba(199,202,182,0.3)",
                        color: f.faStatus ? "#63807B" : "#7D9185",
                      }}
                    >
                      {f.faStatus ? "Tagged" : "Not Tagged"}
                    </span>
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <span
                      style={{
                        display: "inline-block",
                        padding: "3px 10px",
                        borderRadius: "20px",
                        fontSize: "11px",
                        fontWeight: 700,
                        background: f.status === "Active" ? "rgba(139,149,107,0.15)" : "rgba(192,57,43,0.1)",
                        color: f.status === "Active" ? "#8B956B" : "#C0392B",
                      }}
                    >
                      {f.status}
                    </span>
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                      <button
                        style={{
                          padding: "6px 12px",
                          borderRadius: "8px",
                          border: "1px solid #7D9185",
                          background: "transparent",
                          color: "#7D9185",
                          fontSize: "11px",
                          fontWeight: 600,
                          cursor: "pointer",
                        }}
                      >
                        View Profile
                      </button>
                      <button
                        onClick={() => toggleSuspendFaculty(f.id)}
                        style={{
                          padding: "6px 12px",
                          borderRadius: "8px",
                          border: "1px solid #C0392B",
                          background: "transparent",
                          color: "#C0392B",
                          fontSize: "11px",
                          fontWeight: 600,
                          cursor: "pointer",
                        }}
                      >
                        {f.status === "Active" ? "Suspend" : "Activate"}
                      </button>
                      <button
                        onClick={() => setDeleteTarget({ type: "faculty", item: f })}
                        style={{
                          padding: "6px 12px",
                          borderRadius: "8px",
                          border: "none",
                          background: "#C0392B",
                          color: "white",
                          fontSize: "11px",
                          fontWeight: 600,
                          cursor: "pointer",
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteTarget && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: "fixed",
              top: 0, left: 0, right: 0, bottom: 0,
              background: "rgba(0,0,0,0.4)",
              zIndex: 200,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            onClick={() => setDeleteTarget(null)}
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
                maxWidth: 400,
                width: "90%",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ fontSize: "20px", marginBottom: "8px" }}>⚠️</div>
              <h3 style={{ fontFamily: "Playfair Display, Georgia, serif", fontSize: "18px", fontWeight: 700, color: "#2C3830", marginBottom: "8px" }}>
                Delete User
              </h3>
              <p style={{ fontSize: "13px", color: "#4A5E58", marginBottom: "20px" }}>
                Are you sure you want to permanently delete <strong>{deleteTarget.item.name}</strong>? This action cannot be undone.
              </p>
              <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
                <button
                  onClick={() => setDeleteTarget(null)}
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
                  onClick={confirmDelete}
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
                  Delete Permanently
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function AdminUsersPage() {
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
        <UsersContent />
      </AdminShell>
    </AdminToastProvider>
  );
}
