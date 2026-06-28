"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export default function BrowsePage() {
  const router = useRouter();
  return (
    <div className="min-h-screen bg-[#f5f3ec] flex flex-col items-center justify-center p-4">
      <div className="text-center max-w-md p-8 bg-[#e0decd] rounded-2xl border border-[#ab9b8e]/30 shadow-sm">
        <h1 className="font-playfair text-3xl font-extrabold text-[#8690a2] mb-2" style={{ fontFamily: "Playfair Display, Georgia, serif" }}>Browse Projects</h1>
        <p className="font-inter text-[#5a5a5a] mb-6" style={{ fontFamily: "Inter, sans-serif" }}>Coming Soon</p>
        <button
          onClick={() => router.push("/student/feed")}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#8690a2] hover:bg-[#8690a2]/90 text-white font-semibold rounded-xl transition-all cursor-pointer shadow-sm active:scale-95"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Feed</span>
        </button>
      </div>
    </div>
  );
}
