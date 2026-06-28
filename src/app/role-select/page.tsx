"use client";

import React, { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { RoleSelectionScreen, Role } from "@/components/RoleSelectionScreen";

function RoleSelectContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isBack = searchParams.get("back") === "true";

  const handleSelectRole = (role: Role) => {
    router.push(`/login/${role}`);
  };

  // Determine transition based on whether user came back from login screen
  const initialX = isBack ? "-100%" : "0%";
  const initialY = isBack ? 0 : 60;
  const duration = isBack ? 0.4 : 0.6;

  return (
    <motion.div
      initial={{ opacity: 0, x: initialX, y: initialY }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{ duration: duration, ease: [0.25, 1, 0.5, 1] }}
      className="w-full min-h-screen"
    >
      <RoleSelectionScreen onSelectRole={handleSelectRole} />
    </motion.div>
  );
}

export default function RoleSelectPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-sunset-gradient-2" />}>
      <RoleSelectContent />
    </Suspense>
  );
}
