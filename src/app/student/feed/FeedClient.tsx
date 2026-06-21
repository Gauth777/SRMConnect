"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, RefreshCw, Star, GraduationCap } from "lucide-react";

export default function FeedClient() {
  const router = useRouter();
  const [profileData] = useState<any>(null);

  useEffect(() => {
    const data = localStorage.getItem("campusconnect_user");
    if (!data) {
      router.push("/login/student");
      return;
    }
    const parsed = JSON.parse(data);
    if (!parsed.loggedIn) {
      router.push("/login/student");
      return;
    }
    if (parsed.profileComplete === false) {
      router.push("/student/setup");
      return;
    }
  }, []);

  const handleResetProfile = () => {
    localStorage.setItem("campusconnect_user", JSON.stringify({
      role: "student",
      profileComplete: false,
      loggedIn: true
    }));
    router.push("/student/setup");
  };

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="w-full min-h-screen bg-gradient-to-b from-[#F5E6F0] to-[#FDE8D8] py-12 px-4 flex flex-col items-center justify-center text-[#7B4F9E] select-none"
    >
      <div className="w-full max-w-lg p-8 rounded-3xl bg-white/75 backdrop-blur-[12px] text-[#7B4F9E] border border-[#C896B8]/30 shadow-lg shadow-[#C896B8]/20 flex flex-col items-center text-center gap-8 relative overflow-hidden">
        {/* Decorative Floating Icon */}
        <div className="w-20 h-20 rounded-full bg-[#F5E6F0] border border-[#C896B8] flex items-center justify-center text-[#9E4F8A] relative">
          <div className="absolute inset-0 rounded-full bg-[#9E4F8A]/10 animate-pulse" />
          <GraduationCap className="w-10 h-10" />
        </div>

        {/* Text Contents */}
        <div className="flex flex-col gap-2">
          <h1 className="font-playfair text-4xl font-extrabold tracking-tight text-[#4A2870]">Student Feed</h1>
          <p className="font-inter text-[#7B4F9E] text-sm uppercase tracking-widest font-semibold">Coming Soon</p>
          <p className="font-inter text-xs md:text-sm font-light text-[#7B4F9E] max-w-sm mt-3 leading-relaxed">
            We are building a highly curated feed of project collaboration requests, academic discussions, and study groups just for you.
          </p>
        </div>

        {/* Saved Profile Summary Card */}
        {profileData && (
          <div className="w-full bg-white/85 border border-[#C896B8]/30 rounded-2xl p-5 text-left flex flex-col gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#7B4F9E] flex items-center gap-1.5">
              <Star className="w-3.5 h-3.5 fill-[#9E4F8A] text-[#9E4F8A]" />
              Active Student Profile
            </span>
            <div className="flex flex-col">
              <span className="font-playfair text-lg font-bold text-[#4A2870]">{profileData.fullName}</span>
              <span className="text-xs font-semibold text-[#7B4F9E] font-inter">
                {profileData.program} · {profileData.department} ({profileData.currentYear} Year)
              </span>
            </div>
            {profileData.skills?.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1 border-t border-[#C896B8]/20 pt-2">
                {profileData.skills.slice(0, 4).map((s: any) => (
                  <span key={s.name} className="text-[9px] font-bold font-inter bg-[#9E4F8A] text-white px-2 py-0.5 rounded-full">
                    {s.name}
                  </span>
                ))}
                {profileData.skills.length > 4 && (
                  <span className="text-[9px] font-bold font-inter bg-[#F5E6F0] text-[#7B4F9E] px-2 py-0.5 rounded-full">
                    +{profileData.skills.length - 4} more
                  </span>
                )}
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="w-full flex flex-col sm:flex-row gap-3 mt-2">
          {/* Back button */}
          <button
            onClick={() => router.push("/role-select")}
            className="flex-1 py-3.5 rounded-xl border border-[#C896B8] text-[#7B4F9E] hover:bg-[#F5E6F0] hover:text-[#4A2870] transition-all font-semibold text-sm flex items-center justify-center gap-2 cursor-pointer bg-transparent active:scale-95"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Go Back</span>
          </button>

          {/* Reset profile button */}
          <button
            onClick={handleResetProfile}
            className="flex-1 py-3.5 rounded-xl bg-[#9E4F8A] text-white hover:bg-[#4A2870] hover:text-white transition-all font-bold text-sm flex items-center justify-center gap-2 cursor-pointer shadow-md active:scale-95"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Reset Setup</span>
          </button>
        </div>
      </div>
    </motion.main>
  );
}
