"use client";

import React, { use, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { LoginScreen } from "@/components/LoginScreen";
import { Role } from "@/components/RoleSelectionScreen";
import { CheckCircle2, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PageProps {
  params: Promise<{ role: string }>;
}

export default function LoginPage({ params }: PageProps) {
  const router = useRouter();
  const resolvedParams = use(params);
  const role = resolvedParams.role as Role;

  const [successData, setSuccessData] = useState<{ role: Role; username: string } | null>(null);

  const handleBack = () => {
    router.push("/role-select?back=true");
  };

  const handleStudentLogin = () => {
    const existing = localStorage.getItem("campusconnect_user");

    if (existing) {
      const parsed = JSON.parse(existing);
      if (parsed.profileComplete === true) {
        router.push("/student/feed");
        return;
      }
    }

    localStorage.setItem("campusconnect_user", JSON.stringify({
      role: "student",
      profileComplete: false,
      loggedIn: true
    }));

    router.push("/student/setup");
  };

  const handleLoginSuccess = (formData: Record<string, string>) => {
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

    if (role === "student") {
      handleStudentLogin();
    } else {
      // For faculty and admin, show success overlay screen
      setSuccessData({
        role,
        username,
      });
    }
  };

  const handleLogout = () => {
    setSuccessData(null);
    router.push("/role-select");
  };

  if (successData) {
    return (
      <motion.div
        key="success-screen"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="w-full min-h-screen flex flex-col justify-center items-center p-6 bg-sunset-gradient-2 relative select-none"
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
    );
  }

  return (
    <motion.div
      initial={{ x: "100%", opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.25, 1, 0.5, 1] }}
      className="w-full min-h-screen"
    >
      <LoginScreen
        role={role}
        onBack={handleBack}
        onLoginSuccess={handleLoginSuccess}
      />
    </motion.div>
  );
}
