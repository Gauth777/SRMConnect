"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Users,
  BadgeCheck,
  FileCheck,
  Flag,
  Trophy,
  BarChart3,
  Bell,
  LogOut,
  Settings,
  User,
  Shield,
  Menu,
  X,
} from "lucide-react";

interface AdminShellProps {
  children: React.ReactNode;
  adminName: string;
  adminEmail: string;
}

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", route: "/admin/dashboard" },
  { icon: Users, label: "User Management", route: "/admin/users" },
  { icon: BadgeCheck, label: "Faculty Advisor Tags", route: "/admin/fa-tags" },
  { icon: FileCheck, label: "Post Moderation", route: "/admin/moderation" },
  { icon: Flag, label: "Reports & Disputes", route: "/admin/reports" },
  { icon: Trophy, label: "Leaderboard Config", route: "/admin/leaderboard" },
  { icon: BarChart3, label: "Analytics", route: "/admin/analytics" },
];

export default function AdminShell({ children, adminName, adminEmail }: AdminShellProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("campusconnect_user");
    router.push("/");
  };

  const initials = adminName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .substring(0, 2);

  return (
    <div style={{ minHeight: "100vh", background: "#F5F4EF", fontFamily: "Inter, sans-serif" }}>
      {/* ===== NAVBAR ===== */}
      <header
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          height: "56px",
          background: "#63807B",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 20px",
          zIndex: 50,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {/* Mobile hamburger */}
          <button
            onClick={() => setShowMobileSidebar(!showMobileSidebar)}
            style={{
              display: "none",
              background: "transparent",
              border: "none",
              color: "white",
              cursor: "pointer",
              padding: "4px",
            }}
            className="mobile-menu-btn"
          >
            <Menu style={{ width: 20, height: 20 }} />
          </button>

          <span
            style={{
              fontFamily: "Playfair Display, Georgia, serif",
              fontSize: "20px",
              fontWeight: 800,
              color: "white",
            }}
          >
            CampusConnect
          </span>
          <span
            style={{
              background: "#E2C383",
              color: "#2C3830",
              fontSize: "10px",
              fontWeight: 700,
              padding: "2px 8px",
              borderRadius: "6px",
              fontFamily: "Inter, sans-serif",
            }}
          >
            Admin Panel
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <button
            style={{
              background: "transparent",
              border: "none",
              color: "white",
              cursor: "pointer",
              padding: "6px",
              borderRadius: "8px",
            }}
          >
            <Bell style={{ width: 20, height: 20 }} />
          </button>

          <div ref={profileRef} style={{ position: "relative" }}>
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                background: "#2C3830",
                color: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "13px",
                fontWeight: 700,
                border: "none",
                cursor: "pointer",
                fontFamily: "Inter, sans-serif",
              }}
            >
              {initials}
            </button>

            <AnimatePresence>
              {showProfileMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.15 }}
                  style={{
                    position: "absolute",
                    right: 0,
                    top: "44px",
                    width: "180px",
                    background: "white",
                    borderRadius: "12px",
                    border: "1px solid rgba(125,145,133,0.3)",
                    boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
                    zIndex: 60,
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      padding: "12px 16px",
                      borderBottom: "1px solid rgba(125,145,133,0.2)",
                    }}
                  >
                    <div style={{ fontSize: "13px", fontWeight: 700, color: "#2C3830" }}>
                      {adminName}
                    </div>
                    <div style={{ fontSize: "11px", color: "#7D9185" }}>{adminEmail}</div>
                  </div>
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      router.push("/admin/dashboard");
                    }}
                    style={{
                      width: "100%",
                      textAlign: "left",
                      padding: "10px 16px",
                      fontSize: "13px",
                      color: "#4A5E58",
                      background: "transparent",
                      border: "none",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = "rgba(199,202,182,0.3)")
                    }
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    <User style={{ width: 14, height: 14 }} /> View Profile
                  </button>
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      router.push("/admin/dashboard");
                    }}
                    style={{
                      width: "100%",
                      textAlign: "left",
                      padding: "10px 16px",
                      fontSize: "13px",
                      color: "#4A5E58",
                      background: "transparent",
                      border: "none",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = "rgba(199,202,182,0.3)")
                    }
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    <Settings style={{ width: 14, height: 14 }} /> Settings
                  </button>
                  <div style={{ borderTop: "1px solid rgba(125,145,133,0.2)" }} />
                  <button
                    onClick={handleLogout}
                    style={{
                      width: "100%",
                      textAlign: "left",
                      padding: "10px 16px",
                      fontSize: "13px",
                      color: "#C0392B",
                      fontWeight: 600,
                      background: "transparent",
                      border: "none",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = "rgba(192,57,43,0.08)")
                    }
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    <LogOut style={{ width: 14, height: 14 }} /> Logout
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      {/* ===== BODY ===== */}
      <div style={{ display: "flex", paddingTop: "56px", minHeight: "100vh" }}>
        {/* ===== LEFT SIDEBAR ===== */}
        <aside
          style={{
            width: "220px",
            background: "rgba(199,202,182,0.6)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            borderRight: "1px solid rgba(125,145,133,0.3)",
            padding: "20px 12px",
            position: "fixed",
            top: "56px",
            bottom: 0,
            display: "flex",
            flexDirection: "column",
            gap: "4px",
            overflowY: "auto",
            zIndex: 40,
          }}
          className="admin-sidebar"
        >
          {/* Admin mini card */}
          <div
            style={{
              background: "rgba(255,255,255,0.7)",
              borderRadius: "12px",
              padding: "12px",
              marginBottom: "12px",
              border: "1px solid rgba(125,145,133,0.25)",
            }}
          >
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                background: "#63807B",
                color: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "16px",
                fontWeight: 700,
                marginBottom: "8px",
              }}
            >
              {initials}
            </div>
            <div style={{ fontSize: "12px", fontWeight: 700, color: "#2C3830" }}>{adminName}</div>
            <div
              style={{
                fontSize: "10px",
                color: "#7D9185",
                display: "flex",
                alignItems: "center",
                gap: "4px",
                marginTop: "2px",
              }}
            >
              Super Admin <Shield style={{ width: 10, height: 10 }} />
            </div>
          </div>

          {/* Navigation */}
          {navItems.map((item) => {
            const isActive = pathname === item.route;
            const Icon = item.icon;
            return (
              <button
                key={item.route}
                onClick={() => router.push(item.route)}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: "10px",
                  border: "none",
                  background: isActive ? "#63807B" : "transparent",
                  color: isActive ? "white" : "#4A5E58",
                  fontSize: "13px",
                  fontWeight: isActive ? 700 : 500,
                  textAlign: "left",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  fontFamily: "Inter, sans-serif",
                }}
                onMouseEnter={(e) => {
                  if (!isActive) e.currentTarget.style.background = "rgba(199,202,182,0.8)";
                }}
                onMouseLeave={(e) => {
                  if (!isActive) e.currentTarget.style.background = "transparent";
                }}
              >
                <Icon style={{ width: 16, height: 16, flexShrink: 0 }} />
                <span style={{ fontSize: "12px" }}>{item.label}</span>
              </button>
            );
          })}

          <div style={{ flex: 1 }} />

          <div
            style={{
              textAlign: "center",
              fontSize: "10px",
              color: "#7D9185",
              fontWeight: 500,
              paddingTop: "12px",
            }}
          >
            CampusConnect v1.0
          </div>
        </aside>

        {/* Mobile sidebar overlay */}
        <AnimatePresence>
          {showMobileSidebar && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: "rgba(0,0,0,0.4)",
                zIndex: 45,
              }}
              onClick={() => setShowMobileSidebar(false)}
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showMobileSidebar && (
            <motion.aside
              initial={{ x: -220 }}
              animate={{ x: 0 }}
              exit={{ x: -220 }}
              transition={{ duration: 0.25 }}
              style={{
                width: "220px",
                background: "rgba(199,202,182,0.95)",
                backdropFilter: "blur(12px)",
                borderRight: "1px solid rgba(125,145,133,0.3)",
                padding: "20px 12px",
                position: "fixed",
                top: "56px",
                bottom: 0,
                left: 0,
                display: "flex",
                flexDirection: "column",
                gap: "4px",
                overflowY: "auto",
                zIndex: 46,
              }}
            >
              <div
                style={{
                  background: "rgba(255,255,255,0.7)",
                  borderRadius: "12px",
                  padding: "12px",
                  marginBottom: "12px",
                  border: "1px solid rgba(125,145,133,0.25)",
                }}
              >
                <div
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "50%",
                    background: "#63807B",
                    color: "white",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "16px",
                    fontWeight: 700,
                    marginBottom: "8px",
                  }}
                >
                  {initials}
                </div>
                <div style={{ fontSize: "12px", fontWeight: 700, color: "#2C3830" }}>
                  {adminName}
                </div>
                <div
                  style={{
                    fontSize: "10px",
                    color: "#7D9185",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                    marginTop: "2px",
                  }}
                >
                  Super Admin <Shield style={{ width: 10, height: 10 }} />
                </div>
              </div>

              {navItems.map((item) => {
                const isActive = pathname === item.route;
                const Icon = item.icon;
                return (
                  <button
                    key={item.route}
                    onClick={() => {
                      setShowMobileSidebar(false);
                      router.push(item.route);
                    }}
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      borderRadius: "10px",
                      border: "none",
                      background: isActive ? "#63807B" : "transparent",
                      color: isActive ? "white" : "#4A5E58",
                      fontSize: "13px",
                      fontWeight: isActive ? 700 : 500,
                      textAlign: "left",
                      cursor: "pointer",
                      transition: "all 0.2s",
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      fontFamily: "Inter, sans-serif",
                    }}
                  >
                    <Icon style={{ width: 16, height: 16, flexShrink: 0 }} />
                    <span style={{ fontSize: "12px" }}>{item.label}</span>
                  </button>
                );
              })}

              <div style={{ flex: 1 }} />
              <div
                style={{
                  textAlign: "center",
                  fontSize: "10px",
                  color: "#7D9185",
                  fontWeight: 500,
                  paddingTop: "12px",
                }}
              >
                CampusConnect v1.0
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* ===== MAIN CONTENT ===== */}
        <main
          style={{
            marginLeft: "220px",
            flex: 1,
            padding: "24px",
            minHeight: "calc(100vh - 56px)",
          }}
          className="admin-main"
        >
          {children}
        </main>
      </div>
    </div>
  );
}
