"use client";

import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { LandingScreen } from "@/components/LandingScreen";
import { RoleSelectionScreen, Role } from "@/components/RoleSelectionScreen";
import { LoginScreen } from "@/components/LoginScreen";
import { CheckCircle2, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

type ScreenState = "landing" | "role-selection" | "student-login" | "faculty-login" | "admin-login";

export default function Home() {
  const [screen, setScreen] = useState<ScreenState>("landing");
  const [successData, setSuccessData] = useState<{ role: Role; username: string } | null>(null);

  // Transition to Role Selection
  const handleLandingNext = () => {
    setScreen("role-selection");
  };

  // Select a role and navigate to appropriate login screen
  const handleSelectRole = (role: Role) => {
    if (role === "student") setScreen("student-login");
    else if (role === "faculty") setScreen("faculty-login");
    else if (role === "admin") setScreen("admin-login");
  };

  // Go back to role selection
  const handleBackToRoles = () => {
    setScreen("role-selection");
  };

  // Handle successful form submission
  const handleLoginSuccess = (formData: Record<string, string>) => {
    // Extract a identifier/name from form data to personalize the success message
    let username = "User";
    if (formData.srmEmail) {
      username = formData.srmEmail.split("@")[0];
    } else if (formData.adminEmail) {
      username = formData.adminEmail.split("@")[0];
    } else if (formData.registrationNumber) {
      username = formData.registrationNumber;
    } else if (formData.facultyId) {
      username = formData.facultyId;
    }

    // Determine current role based on active screen
    let currentRole: Role = "student";
    if (screen === "faculty-login") currentRole = "faculty";
    else if (screen === "admin-login") currentRole = "admin";

    setSuccessData({
      role: currentRole,
      username: username,
    });
  };

  const handleLogout = () => {
    setSuccessData(null);
    setScreen("role-selection");
  };

  // Layout transition configurations
  const pageTransitionVariants = {
    landing: {
      initial: { opacity: 1, y: 0 },
      exit: {
        opacity: 0,
        y: -60,
        transition: { duration: 0.6, ease: [0.25, 1, 0.5, 1] as const },
      },
    },
    roles: {
      initial: { opacity: 0, y: 60 },
      animate: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.6, ease: [0.25, 1, 0.5, 1] as const },
      },
      exit: (custom: { direction: "forward" | "backward" }) => ({
        x: custom.direction === "forward" ? "-100%" : "100%",
        opacity: 0,
        transition: { duration: 0.5, ease: [0.25, 1, 0.5, 1] as const },
      }),
    },
    login: {
      initial: { x: "100%", opacity: 0 },
      animate: {
        x: 0,
        opacity: 1,
        transition: { duration: 0.5, ease: [0.25, 1, 0.5, 1] as const },
      },
      exit: {
        x: "100%",
        opacity: 0,
        transition: { duration: 0.4, ease: [0.25, 1, 0.5, 1] as const },
      },
    },
  };

  return (
    <main className="flex-1 w-full h-full min-h-screen relative overflow-hidden bg-gradient-to-b from-[#2E1E38] to-[#120A17]">
      
      {/* Page Transitions Container */}
      <AnimatePresence mode="wait" custom={{ direction: screen.includes("login") ? "forward" : "backward" }}>
        
        {/* PAGE 1: Landing Page */}
        {screen === "landing" && !successData && (
          <motion.div
            key="landing"
            variants={pageTransitionVariants.landing}
            initial="initial"
            exit="exit"
            className="w-full h-full min-h-screen"
          >
            <LandingScreen onNext={handleLandingNext} />
          </motion.div>
        )}

        {/* PAGE 2: Role Selection */}
        {screen === "role-selection" && !successData && (
          <motion.div
            key="roles"
            custom={{ direction: "forward" }}
            variants={pageTransitionVariants.roles}
            initial="initial"
            animate="animate"
            exit="exit"
            className="w-full h-full min-h-screen"
          >
            <RoleSelectionScreen onSelectRole={handleSelectRole} />
          </motion.div>
        )}

        {/* PAGE 3a: Student Login */}
        {screen === "student-login" && !successData && (
          <motion.div
            key="student-login"
            variants={pageTransitionVariants.login}
            initial="initial"
            animate="animate"
            exit="exit"
            className="w-full h-full min-h-screen"
          >
            <LoginScreen
              role="student"
              onBack={handleBackToRoles}
              onLoginSuccess={handleLoginSuccess}
            />
          </motion.div>
        )}

        {/* PAGE 3b: Faculty Login */}
        {screen === "faculty-login" && !successData && (
          <motion.div
            key="faculty-login"
            variants={pageTransitionVariants.login}
            initial="initial"
            animate="animate"
            exit="exit"
            className="w-full h-full min-h-screen"
          >
            <LoginScreen
              role="faculty"
              onBack={handleBackToRoles}
              onLoginSuccess={handleLoginSuccess}
            />
          </motion.div>
        )}

        {/* PAGE 3c: Admin Login */}
        {screen === "admin-login" && !successData && (
          <motion.div
            key="admin-login"
            variants={pageTransitionVariants.login}
            initial="initial"
            animate="animate"
            exit="exit"
            className="w-full h-full min-h-screen"
          >
            <LoginScreen
              role="admin"
              onBack={handleBackToRoles}
              onLoginSuccess={handleLoginSuccess}
            />
          </motion.div>
        )}

        {/* SUCCESS OVERLAY SCREEN (Premium Detail Addition) */}
        {successData && (
          <motion.div
            key="success-screen"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] as const }}
            className="w-full h-full min-h-screen flex flex-col justify-center items-center p-6 bg-sunset-gradient-2 relative select-none"
          >
            {/* Ambient Background Glows */}
            <div className="absolute w-[400px] h-[400px] rounded-full bg-sunset-orange/20 blur-[100px] top-1/4 left-1/4 animate-float" />
            <div className="absolute w-[350px] h-[350px] rounded-full bg-sunset-amber/20 blur-[100px] bottom-1/4 right-1/4 animate-float-delayed" />
            
            <div className="relative z-10 w-full max-w-md p-10 rounded-3xl border border-sunset-peach/15 glass-card shadow-glow-orange/10 flex flex-col items-center text-center gap-8">
              
              {/* Checkmark icon with pulsing circle */}
              <div className="relative flex items-center justify-center">
                <div className="absolute w-20 h-20 rounded-full bg-sunset-orange/10 border border-sunset-orange/25 animate-ping opacity-75" />
                <div className="w-20 h-20 rounded-full bg-sunset-orange/25 border border-sunset-orange/40 flex items-center justify-center shadow-glow-orange/30">
                  <CheckCircle2 className="w-10 h-10 text-[#FFC4B1]" />
                </div>
              </div>

              {/* Title & Description */}
              <div className="flex flex-col gap-2">
                <h2 className="font-playfair text-4xl font-extrabold text-[#FFC4B1]">
                  Access Granted
                </h2>
                <p className="font-inter text-base font-light text-sunset-peach/80 max-w-xs leading-relaxed mt-2">
                  Welcome back, <span className="font-semibold text-sunset-orange capitalize">{successData.username}</span>!
                </p>
                <p className="font-inter text-xs text-sunset-peach/50 mt-1 uppercase tracking-widest font-semibold">
                  Role: {successData.role}
                </p>
              </div>

              {/* Action Button */}
              <Button
                onClick={handleLogout}
                className="w-full bg-sunset-rust hover:bg-sunset-rust/95 text-[#FFC4B1] shadow-glow-rust/20 font-bold py-4 rounded-xl flex items-center justify-center gap-2 mt-2 group border border-sunset-peach/10"
              >
                <LogOut className="w-5 h-5 transition-transform duration-200 group-hover:-translate-x-0.5" />
                <span>Sign Out</span>
              </Button>
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </main>
  );
}
