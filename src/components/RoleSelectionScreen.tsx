"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { GraduationCap, BookOpen, Shield, ArrowRight } from "lucide-react";
import { BackgroundOrbs } from "./BackgroundOrbs";
import { Button } from "./ui/button";

export type Role = "student" | "faculty" | "admin";

interface RoleSelectionScreenProps {
  onSelectRole: (role: Role) => void;
}

interface RoleCard {
  id: Role;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  accentClass: string; // Tailwind hover border color
  selectedRingClass: string; // Selected outline ring color
  selectedGlowClass: string; // Selected box shadow glow
  accentColor: string; // Raw hex or Tailwind color name
}

export function RoleSelectionScreen({ onSelectRole }: RoleSelectionScreenProps) {
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);

  const cards: RoleCard[] = [
    {
      id: "student",
      title: "Student",
      icon: GraduationCap,
      description: "Browse projects, build your profile, apply to opportunities",
      accentClass: "hover:border-sunset-orange hover:shadow-[0_0_25px_rgba(242,127,61,0.3)]",
      selectedRingClass: "ring-2 ring-sunset-orange border-sunset-orange",
      selectedGlowClass: "shadow-[0_0_35px_rgba(242,127,61,0.5)]",
      accentColor: "#F27F3D",
    },
    {
      id: "faculty",
      title: "Faculty",
      icon: BookOpen,
      description: "Post projects, guide students, endorse achievements",
      accentClass: "hover:border-sunset-amber hover:shadow-[0_0_25px_rgba(242,160,61,0.3)]",
      selectedRingClass: "ring-2 ring-sunset-amber border-sunset-amber",
      selectedGlowClass: "shadow-[0_0_35px_rgba(242,160,61,0.5)]",
      accentColor: "#F2A03D",
    },
    {
      id: "admin",
      title: "Admin",
      icon: Shield,
      description: "Manage the platform, verify users, configure settings",
      accentClass: "hover:border-sunset-rust hover:shadow-[0_0_25px_rgba(140,61,53,0.3)]",
      selectedRingClass: "ring-2 ring-sunset-rust border-sunset-rust",
      selectedGlowClass: "shadow-[0_0_35px_rgba(140,61,53,0.5)]",
      accentColor: "#8C3D35",
    },
  ];

  const handleContinue = () => {
    if (selectedRole) {
      onSelectRole(selectedRole);
    }
  };

  return (
    <div className="relative w-full h-full min-h-screen flex flex-col justify-center items-center overflow-hidden bg-sunset-gradient-2 px-6 py-12 select-none">
      {/* Ambient background orbs */}
      <BackgroundOrbs />

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-5xl flex flex-col items-center gap-12">
        {/* Headings */}
        <div className="text-center flex flex-col gap-3">
          <motion.h2
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] as const }}
            className="font-playfair text-4xl md:text-6xl font-extrabold text-[#FFC4B1]"
          >
            I am a...
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] as const }}
            className="font-inter text-base md:text-xl font-light text-sunset-peach/85"
          >
            Select your role to continue
          </motion.p>
        </div>

        {/* Roles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">
          {cards.map((card, idx) => {
            const Icon = card.icon;
            const isSelected = selectedRole === card.id;

            return (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.8,
                  delay: 0.2 + idx * 0.1, // Card 1: 0.2s, Card 2: 0.3s, Card 3: 0.4s (staggered by 100ms)
                  ease: [0.16, 1, 0.3, 1] as const,
                }}
                whileHover={{ scale: isSelected ? 1.03 : 1.02 }}
                onClick={() => setSelectedRole(card.id)}
                className={`glass-card cursor-pointer flex flex-col items-center justify-between p-8 rounded-2xl border text-center transition-all duration-300 ${
                  isSelected
                    ? `${card.selectedRingClass} ${card.selectedGlowClass} scale-[1.03]`
                    : `${card.accentClass} border-sunset-peach/15 hover:scale-[1.02]`
                }`}
              >
                {/* Icon wrapper */}
                <div 
                  className="p-4 rounded-full bg-sunset-violet/40 mb-6 border border-sunset-peach/10 transition-transform duration-300 group-hover:scale-110"
                  style={{
                    boxShadow: isSelected ? `0 0 20px ${card.accentColor}33` : "none",
                  }}
                >
                  <Icon className="w-10 h-10 text-sunset-peach" />
                </div>

                {/* Role title */}
                <h3 className="font-playfair text-2xl font-bold text-[#FFC4B1] mb-3">
                  {card.title}
                </h3>

                {/* Role Description */}
                <p className="font-inter text-sm md:text-base font-light text-sunset-peach/75 leading-relaxed">
                  {card.description}
                </p>
              </motion.div>
            );
          })}
        </div>

        {/* Continue Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5, ease: [0.16, 1, 0.3, 1] as const }}
          className="w-full flex justify-center mt-4"
        >
          <Button
            onClick={handleContinue}
            disabled={!selectedRole}
            className={`w-full max-w-xs py-4 flex items-center justify-center gap-2 rounded-xl text-base font-bold shadow-lg transition-all duration-300 group ${
              selectedRole
                ? "bg-sunset-orange hover:bg-sunset-orange/95 text-sunset-violet shadow-glow-orange cursor-pointer active:scale-95"
                : "bg-sunset-peach/10 text-sunset-peach/30 border border-sunset-peach/10 cursor-not-allowed shadow-none"
            }`}
          >
            <span>Continue</span>
            <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
