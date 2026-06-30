"use client";

import React, { use } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { LoginScreen } from "@/components/LoginScreen";
import { Role } from "@/components/RoleSelectionScreen";

interface PageProps {
  params: Promise<{ role: string }>;
}

export default function LoginPage({ params }: PageProps) {
  const router = useRouter();
  const resolvedParams = use(params);
  const role = resolvedParams.role as Role;

  // Faculty login handler per specification
  const handleFacultyLogin = (formData: Record<string, string>) => {
    // Validation already performed in LoginScreen
    const existing = localStorage.getItem("campusconnect_user");
    if (existing) {
      const parsed = JSON.parse(existing);
      if (parsed.role === "faculty" && parsed.profileComplete === true) {
        router.push("/faculty/dashboard");
        return;
      }
    }
    // New faculty – store data and redirect to setup wizard
    localStorage.setItem(
      "campusconnect_user",
      JSON.stringify({
        role: "faculty",
        profileComplete: false,
        loggedIn: true,
        empId: formData.empId,
        name: formData.name,
        email: formData.email,
      })
    );
    router.push("/faculty/setup");
  };

  const handleLoginSuccess = (formData: Record<string, string>) => {
    if (role === "admin") {
      localStorage.setItem(
        "campusconnect_user",
        JSON.stringify({
          role: "admin",
          loggedIn: true,
          name: "Admin",
          email: formData.adminEmail || "admin@srmist.edu.in",
        })
      );
      router.push("/admin/dashboard");
    } else if (role === "faculty") {
      handleFacultyLogin(formData);
    } else {
      // Existing student flow (unchanged)
      const existing = localStorage.getItem("campusconnect_user");
      if (existing) {
        const parsed = JSON.parse(existing);
        if (parsed.profileComplete === true) {
          router.push("/student/feed");
          return;
        }
      }
      localStorage.setItem(
        "campusconnect_user",
        JSON.stringify({ role: "student", profileComplete: false, loggedIn: true })
      );
      router.push("/student/setup");
    }
  };

  const handleBack = () => {
    router.push("/role-select?back=true");
  };

  return (
    <motion.div
      initial={{ x: "100%", opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.25, 1, 0.5, 1] }}
      className="w-full min-h-screen"
    >
      <LoginScreen role={role} onBack={handleBack} onLoginSuccess={handleLoginSuccess} />
    </motion.div>
  );
}
