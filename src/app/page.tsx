"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { LandingScreen } from "@/components/LandingScreen";

export default function Home() {
  const router = useRouter();

  const handleLandingNext = () => {
    router.push("/role-select");
  };

  return (
    <main className="flex-1 w-full h-full min-h-screen relative overflow-hidden bg-gradient-to-b from-[#2E1E38] to-[#120A17]">
      <LandingScreen onNext={handleLandingNext} />
    </main>
  );
}
