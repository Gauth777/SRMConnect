"use client";

import React, { useEffect, useMemo, useState, useRef, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  Search as SearchIcon,
  FileText,
  User,
  GraduationCap,
  Trophy,
  Bookmark,
  Mail,
  Bell,
  LogOut,
  Settings,
  X,
  CheckCircle,
  MoreHorizontal,
  Sparkles,
  Users
} from "lucide-react";
import { readFacultyPosts, safeParseJson } from "@/components/faculty/faculty-data";

// Types
interface Post {
  id: number;
  type: "project" | "hackathon" | "achievement" | "research";
  faculty?: string;
  dept?: string;
  time: string;
  title: string;
  description?: string;
  skills?: string[];
  domain?: string;
  duration?: string;
  slots?: number;
  remaining?: number;
  deadline?: string;
  compatibility?: number;
  rolesNeeded?: string;
  teamSlots?: string;
  studentName?: string;
  verifiedBy?: string;
  reactions?: number;
  designation?: string;
}

interface CampusConnectUser {
  role: string;
  profileComplete: boolean;
  loggedIn: boolean;
  fullName?: string;
  department?: string;
  currentYear?: string;
}

// Mock Data
const MOCK_POSTS: Post[] = [
  {
    id: 1,
    type: "project",
    faculty: "Dr. Godfrey",
    dept: "CSE",
    time: "2h ago",
    title: "AI-based Traffic Optimization System",
    description: "Using deep reinforcement learning to optimize urban traffic flow in real-time.",
    skills: ["Python", "TensorFlow", "OpenCV"],
    domain: "AI & ML",
    duration: "3 months",
    slots: 4,
    remaining: 2,
    deadline: "July 15, 2025",
    compatibility: 87
  },
  {
    id: 2,
    type: "project",
    faculty: "Dr. Baskar M.",
    dept: "CSE",
    time: "5h ago",
    title: "Blockchain Certificate Verification",
    description: "Building a tamper-proof certificate issuance and verification system using Ethereum smart contracts.",
    skills: ["Node.js", "Solidity", "React"],
    domain: "Blockchain",
    duration: "4 months",
    slots: 3,
    remaining: 1,
    deadline: "August 1, 2025",
    compatibility: 91
  },
  {
    id: 3,
    type: "project",
    faculty: "Dr. Priya R.",
    dept: "ECE",
    time: "1d ago",
    title: "Federated Learning for Healthcare",
    description: "Developing privacy-preserving collaborative ML models to analyze distributed medical imaging data.",
    skills: ["Python", "PyTorch", "Privacy"],
    domain: "Healthcare Tech",
    duration: "6 months",
    slots: 2,
    remaining: 2,
    deadline: "July 20, 2025",
    compatibility: 78
  },
  {
    id: 4,
    type: "hackathon",
    faculty: "IEEE SRM",
    dept: "SRM Student Chapter",
    time: "1d ago",
    title: "Smart India Hackathon 2025",
    description: "National level 36-hour hackathon focusing on digital solutions for product development, cybersecurity, and robotics.",
    rolesNeeded: "Backend Dev, ML Engineer, UI Designer",
    teamSlots: "3/6 members joined",
    deadline: "June 30, 2025",
    compatibility: 93
  },
  {
    id: 5,
    type: "hackathon",
    faculty: "Google DSC",
    dept: "Developer Student Club",
    time: "2d ago",
    title: "Solution Challenge 2025",
    description: "Develop a solution for one or more of the UN Sustainable Development Goals using Google technology.",
    rolesNeeded: "Frontend Dev, DevOps, Full Stack",
    teamSlots: "2/4 members joined",
    deadline: "July 10, 2025",
    compatibility: 85
  },
  {
    id: 6,
    type: "achievement",
    studentName: "Rahul Sharma",
    time: "3h ago",
    title: "Cleared AWS Cloud Practitioner Certification",
    verifiedBy: "Verified by Dr. Baskar M.",
    reactions: 14
  },
  {
    id: 7,
    type: "achievement",
    studentName: "Ananya Krishnan",
    time: "12h ago",
    title: "Won 1st Place at CodeStorm 2025",
    verifiedBy: "Verified by Admin",
    reactions: 32
  },
  {
    id: 8,
    type: "research",
    faculty: "Dr. Godfrey",
    designation: "Professor & Head of Research",
    dept: "CSE Dept",
    time: "4h ago",
    title: "NLP & Computer Vision Research Assistant",
    description: "Looking for research assistants to collaborate on high-impact publications focusing on multimodal models.",
    domain: "NLP & CV",
    compatibility: 91
  }
];

export default function FeedClient() {
  const router = useRouter();

  // Authentication & Profile Setup Guard
  const userProfile = useSyncExternalStore(subscribeToStorage, readStudentProfileSnapshot, () => null);

  // States
  const facultyPosts = useSyncExternalStore(subscribeToStorage, readFacultyPostsSnapshot, () => []);
  const [activeTab, setActiveTab] = useState<string>("All");
  const [savedPostIds, setSavedPostIds] = useState<number[]>([]);
  const [appliedPostIds, setAppliedPostIds] = useState<number[]>([]);
  const [reactedPostIds, setReactedPostIds] = useState<number[]>([]);
  const [remainingByPostId, setRemainingByPostId] = useState<Record<number, number>>({});
  const [reactionByPostId, setReactionByPostId] = useState<Record<number, number>>({});
  
  // Interactive Nav UI States
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Mobile Bottom Sheet Navigation
  const [showMobileMore, setShowMobileMore] = useState(false);

  // Refs for closing dropdowns when clicking outside
  const searchRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!userProfile) {
      router.push("/login/student");
      return;
    }

    if (!userProfile.loggedIn) {
      router.push("/login/student");
      return;
    }

    if (userProfile.profileComplete === false) {
      router.push("/student/setup");
    }
  }, [router, userProfile]);

  // Click outside listener for dropdowns
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchFocused(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Show a temporary success toast
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const handleLogout = () => {
    localStorage.removeItem("campusconnect_user");
    router.push("/");
  };

  // Toggle Save
  const toggleSave = (id: number) => {
    setSavedPostIds((prev) => {
      const exists = prev.includes(id);
      if (exists) {
        triggerToast("Project removed from saved list");
        return prev.filter((pid) => pid !== id);
      } else {
        triggerToast("Project saved successfully!");
        return [...prev, id];
      }
    });
  };

  // Toggle Apply/Join
  const toggleApply = (id: number, type: string) => {
    if (appliedPostIds.includes(id)) return;
    setAppliedPostIds((prev) => [...prev, id]);

    setRemainingByPostId((current) => {
      const nextRemaining = current[id] ?? getBaseRemaining(id);
      if (nextRemaining <= 0) {
        return current;
      }
      return { ...current, [id]: nextRemaining - 1 };
    });

    const actionText = type === "hackathon" ? "Joined team successfully!" : "Application submitted successfully!";
    triggerToast(actionText);
  };

  // Toggle Reaction on Achievement
  const handleReact = (id: number) => {
    const isReacted = reactedPostIds.includes(id);
    if (isReacted) {
      setReactedPostIds((prev) => prev.filter((rid) => rid !== id));
      setReactionByPostId((current) => ({
        ...current,
        [id]: Math.max(0, (current[id] ?? getBaseReactions(id)) - 1),
      }));
    } else {
      setReactedPostIds((prev) => [...prev, id]);
      setReactionByPostId((current) => ({
        ...current,
        [id]: (current[id] ?? getBaseReactions(id)) + 1,
      }));
    }
  };

  const posts = useMemo(() => {
    const facultyFeedPosts = [...facultyPosts, ...MOCK_POSTS];
    return facultyFeedPosts.map((post) => {
      const remaining = remainingByPostId[post.id];
      const reactions = reactionByPostId[post.id];
      return {
        ...post,
        remaining: remaining !== undefined ? remaining : post.remaining,
        reactions: reactions !== undefined ? reactions : post.reactions,
      };
    });
  }, [facultyPosts, remainingByPostId, reactionByPostId]);

  // Filter logic
  const filteredPosts = posts.filter((post) => {
    if (activeTab === "All") return true;
    if (activeTab === "Projects") return post.type === "project";
    if (activeTab === "Hackathons") return post.type === "hackathon";
    if (activeTab === "Research") return post.type === "research";
    if (activeTab === "Achievements") return post.type === "achievement";
    return true;
  }).filter((post) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    const titleMatch = post.title.toLowerCase().includes(query);
    const descMatch = post.description?.toLowerCase().includes(query) || false;
    const facultyMatch = post.faculty?.toLowerCase().includes(query) || false;
    const skillMatch = post.skills?.some((s) => s.toLowerCase().includes(query)) || false;
    const authorMatch = post.studentName?.toLowerCase().includes(query) || false;
    return titleMatch || descMatch || facultyMatch || skillMatch || authorMatch;
  });

  if (!userProfile) {
    return (
      <div className="w-full min-h-screen bg-[#f5f3ec] flex flex-col items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-full border-4 border-[#8690a2] border-t-transparent animate-spin" />
          <p className="text-sm font-semibold tracking-wider text-[#8690a2] font-inter">Securing feed connection...</p>
        </div>
      </div>
    );
  }

  // Get Initials helper
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  const currentUserName = userProfile?.fullName || "John Doe";
  const currentUserDept = userProfile?.department || "CSE";
  const currentUserYear = userProfile?.currentYear || "3rd Year";

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen w-full bg-[#f5f3ec] text-[#3a3a3a] select-none flex flex-col relative"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 bg-[#8690a2] text-white px-5 py-3 rounded-xl shadow-lg border border-[#bdd1d3]/40 flex items-center gap-2 font-semibold text-sm max-w-sm text-center"
          >
            <CheckCircle className="w-4 h-4 text-[#bdd1d3]" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* NAVBAR */}
      <header className="fixed top-0 left-0 right-0 h-[56px] bg-[#e0decd] border-b border-[#ab9b8e]/30 z-50 px-4 md:px-6 flex items-center justify-between">
        {/* Left Section: Logo */}
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push("/student/feed")}>
          <span 
            className="text-xl md:text-2xl font-extrabold text-[#8690a2] tracking-tight"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            CampusConnect
          </span>
        </div>

        {/* Center Section: Search Bar */}
        <div className="relative hidden md:block" ref={searchRef}>
          <div className="relative w-[320px]">
            <input
              type="text"
              placeholder="Search projects, faculty, skills..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              className="w-full h-9 pl-9 pr-4 rounded-full bg-[#f5f3ec] border border-[#bdd1d3] text-sm text-[#3a3a3a] placeholder-[#ab9b8e] focus:outline-none focus:border-[#8690a2] transition-colors"
            />
            <SearchIcon className="w-4 h-4 text-[#ab9b8e] absolute left-3 top-1/2 -translate-y-1/2" />
            
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery("")} 
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#ab9b8e] hover:text-[#3a3a3a]"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Search Dropdown Panel */}
          <AnimatePresence>
            {isSearchFocused && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.15 }}
                className="absolute top-[44px] left-0 w-[320px] bg-[#e0decd] rounded-2xl border border-[#ab9b8e]/40 shadow-xl p-4 z-50 flex flex-col gap-4 text-xs"
              >
                <div>
                  <span className="font-bold text-[#8690a2] block mb-2 uppercase tracking-wider text-[10px]">Recommended for you</span>
                  <div className="flex flex-wrap gap-1.5">
                    {["AI & ML", "Blockchain", "Healthcare NLP"].map((tag) => (
                      <button
                        key={tag}
                        onClick={() => { setSearchQuery(tag); setIsSearchFocused(false); }}
                        className="px-2.5 py-1 rounded-full bg-[#f5f3ec] hover:bg-[#bdd1d3]/40 border border-[#bdd1d3] text-[#5a5a5a] cursor-pointer transition-colors"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="font-bold text-[#8690a2] block mb-2 uppercase tracking-wider text-[10px]">Based on your skills</span>
                  <div className="flex flex-wrap gap-1.5">
                    {["React Web", "PyTorch Training", "Node.js API"].map((tag) => (
                      <button
                        key={tag}
                        onClick={() => { setSearchQuery(tag); setIsSearchFocused(false); }}
                        className="px-2.5 py-1 rounded-full bg-[#f5f3ec] hover:bg-[#bdd1d3]/40 border border-[#bdd1d3] text-[#5a5a5a] cursor-pointer transition-colors"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="font-bold text-[#8690a2] block mb-2 uppercase tracking-wider text-[10px]">Recently posted</span>
                  <div className="flex flex-col gap-1.5">
                    {[
                      { title: "Smart India Hackathon 2025", type: "Hackathon" },
                      { title: "AI-based Traffic Optimization", type: "Project" }
                    ].map((item, idx) => (
                      <div
                        key={idx}
                        onClick={() => { setSearchQuery(item.title); setIsSearchFocused(false); }}
                        className="p-2 rounded-lg bg-[#f5f3ec] hover:bg-[#bdd1d3]/20 cursor-pointer flex items-center justify-between transition-colors border border-transparent hover:border-[#bdd1d3]"
                      >
                        <span className="font-semibold text-[#3a3a3a] truncate">{item.title}</span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#8690a2]/15 text-[#8690a2] font-bold">{item.type}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Section: Icons & Profile */}
        <div className="flex items-center gap-3">
          {/* Notifications bell */}
          <div className="relative" ref={notificationRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-1.5 rounded-full hover:bg-[#bdd1d3]/30 transition-colors text-[#8690a2] cursor-pointer relative"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#d2c296] rounded-full animate-pulse" />
            </button>

            {/* Notification Dropdown */}
            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 top-[40px] w-72 bg-[#e0decd] rounded-2xl border border-[#ab9b8e]/40 shadow-xl z-50 py-2 text-xs"
                >
                  <div className="px-4 py-2 border-b border-[#ab9b8e]/20 flex justify-between items-center">
                    <span className="font-bold text-[#8690a2] uppercase tracking-wider text-[10px]">Notifications</span>
                    <button className="text-[10px] text-[#d2c296] hover:underline">Mark read</button>
                  </div>
                  <div className="flex flex-col max-h-[300px] overflow-y-auto">
                    {[
                      { text: "Dr. Godfrey approved your application for Traffic Optimization.", time: "1h ago", unread: true },
                      { text: "Priya Sharma invited you to join team for Smart India Hackathon.", time: "3h ago", unread: true },
                      { text: "Dr. Baskar M. verified your achievement 'AWS Practitioner'.", time: "1d ago", unread: false }
                    ].map((n, idx) => (
                      <div
                        key={idx}
                        className={`p-3 border-b border-[#ab9b8e]/10 flex flex-col gap-1 hover:bg-[#bdd1d3]/15 transition-colors cursor-pointer ${n.unread ? "bg-[#bdd1d3]/10" : ""}`}
                      >
                        <p className="text-[#3a3a3a] leading-tight">{n.text}</p>
                        <span className="text-[9px] text-[#ab9b8e] font-medium">{n.time}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Invitations mail icon */}
          <button
            onClick={() => router.push("/student/invitations")}
            className="p-1.5 rounded-full hover:bg-[#bdd1d3]/30 transition-colors text-[#8690a2] cursor-pointer relative"
          >
            <Mail className="w-5 h-5" />
            <span className="absolute -top-0.5 -right-0.5 bg-[#d2c296] text-[#3a3a3a] font-bold text-[9px] w-4 h-4 rounded-full flex items-center justify-center">
              2
            </span>
          </button>

          {/* Profile Avatar circle */}
          <div className="relative" ref={profileMenuRef}>
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="w-8 h-8 rounded-full bg-[#8690a2] text-white flex items-center justify-center font-bold text-sm border border-[#bdd1d3] shadow-sm hover:scale-105 transition-transform cursor-pointer"
            >
              JS
            </button>

            {/* Profile Dropdown */}
            <AnimatePresence>
              {showProfileMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-[40px] w-48 bg-[#e0decd] rounded-xl border border-[#ab9b8e]/40 shadow-xl z-50 py-1.5 text-xs text-[#5a5a5a]"
                >
                  <div className="px-4 py-2 border-b border-[#ab9b8e]/20 flex flex-col gap-0.5">
                    <span className="font-bold text-[#3a3a3a]">{currentUserName}</span>
                    <span className="text-[10px] text-[#ab9b8e]">{currentUserDept} · {currentUserYear}</span>
                  </div>
                  
                  <button
                    onClick={() => { router.push("/student/profile"); setShowProfileMenu(false); }}
                    className="w-full text-left px-4 py-2 hover:bg-[#bdd1d3]/30 hover:text-[#3a3a3a] flex items-center gap-2 cursor-pointer transition-colors"
                  >
                    <User className="w-3.5 h-3.5" />
                    <span>My Profile</span>
                  </button>

                  <button
                    onClick={() => { router.push("/student/setup"); setShowProfileMenu(false); }}
                    className="w-full text-left px-4 py-2 hover:bg-[#bdd1d3]/30 hover:text-[#3a3a3a] flex items-center gap-2 cursor-pointer transition-colors"
                  >
                    <Settings className="w-3.5 h-3.5" />
                    <span>Settings</span>
                  </button>

                  <div className="border-t border-[#ab9b8e]/20 my-1" />

                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 hover:bg-red-500/10 text-red-600 hover:text-red-700 font-semibold flex items-center gap-2 cursor-pointer transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Logout</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      {/* THREE COLUMN LAYOUT CONTAINER */}
      <div className="flex-1 flex w-full pt-[56px]">

        {/* LEFT SIDEBAR */}
        <aside className="hidden md:flex flex-col w-[220px] fixed left-0 top-[56px] h-[calc(100vh-56px)] bg-[#e0decd] border-r border-[#ab9b8e]/25 z-30 justify-between py-4 px-3">
          <div className="flex flex-col gap-6">
            {/* Top profile mini card */}
            <div className="bg-[#f5f3ec]/65 p-3 rounded-xl border border-[#ab9b8e]/20 flex flex-col gap-2">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-[#8690a2] text-white flex items-center justify-center font-bold text-sm">
                  {getInitials(currentUserName)}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="font-bold text-xs text-[#3a3a3a] truncate">{currentUserName}</span>
                  <span className="text-[10px] text-[#5a5a5a] font-medium truncate">{currentUserDept} · {currentUserYear}</span>
                </div>
              </div>
              <button
                onClick={() => router.push("/student/profile")}
                className="text-[10px] font-bold text-[#d2c296] hover:text-[#d2c296]/80 text-left cursor-pointer transition-colors mt-0.5"
              >
                View Profile →
              </button>
            </div>

            {/* Navigation links */}
            <nav className="flex flex-col gap-1">
              {[
                { label: "Home Feed", route: "/student/feed", icon: Home, active: true },
                { label: "Browse Projects", route: "/student/browse", icon: SearchIcon },
                { label: "My Applications", route: "/student/applications", icon: FileText },
                { label: "My Profile", route: "/student/profile", icon: User },
                { label: "Faculty Directory", route: "/student/faculty", icon: GraduationCap },
                { label: "Leaderboard", route: "/student/leaderboard", icon: Trophy },
                { label: "Saved Projects", route: "/student/saved", icon: Bookmark },
                { label: "Invitations", route: "/student/invitations", icon: Mail }
              ].map((item, idx) => {
                const Icon = item.icon;
                return (
                  <button
                    key={idx}
                    onClick={() => router.push(item.route)}
                    className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-semibold rounded-[10px] transition-all cursor-pointer ${
                      item.active
                        ? "bg-[#8690a2] text-white shadow-sm"
                        : "text-[#5a5a5a] hover:bg-[#bdd1d3]/30 hover:text-[#3a3a3a]"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="text-center">
            <span className="text-[10px] text-[#ab9b8e] font-semibold">CampusConnect v1.0</span>
          </div>
        </aside>

        {/* MAIN FEED (CENTER) */}
        <main className="flex-1 flex flex-col md:ml-[220px] lg:mr-[240px] px-4 py-6 bg-[#f5f3ec] min-h-[calc(100vh-56px)]">
          <div className="w-full max-w-[680px] mx-auto flex flex-col gap-4">
            
            {/* STICKY FILTER TABS */}
            <div className="sticky top-[56px] z-20 bg-[#f5f3ec] py-3 border-b border-[#ab9b8e]/15 flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth">
              {["All", "Projects", "Hackathons", "Research", "Achievements"].map((tab) => {
                const isActive = activeTab === tab;
                return (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-1.5 text-xs font-semibold rounded-[20px] border transition-all cursor-pointer whitespace-nowrap ${
                      isActive
                        ? "bg-[#8690a2] border-[#8690a2] text-white shadow-sm"
                        : "border-[#bdd1d3] text-[#8690a2] hover:bg-[#bdd1d3]/20"
                    }`}
                  >
                    {tab}
                  </button>
                );
              })}
            </div>

            {/* FEED CARDS SECTION */}
            <div className="flex flex-col gap-5 mt-2 pb-16">
              <AnimatePresence mode="wait">
                {filteredPosts.length > 0 ? (
                  <motion.div
                    key={activeTab + searchQuery}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col gap-5"
                  >
                    {filteredPosts.map((post, index) => {
                      const isSaved = savedPostIds.includes(post.id);
                      const isApplied = appliedPostIds.includes(post.id);
                      const isReacted = reactedPostIds.includes(post.id);

                      // Project Card
                      if (post.type === "project") {
                        return (
                          <motion.div
                            key={post.id}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: index * 0.08 }}
                            className="bg-[#e0decd]/80 border border-[#ab9b8e]/25 rounded-[16px] p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden"
                          >
                            {/* Card Header */}
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2.5">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#8690a2] to-[#bdd1d3] text-white flex items-center justify-center font-bold text-sm shadow-inner">
                                  {post.faculty ? getInitials(post.faculty) : "FC"}
                                </div>
                                <div className="flex flex-col">
                                  <span className="font-bold text-xs text-[#3a3a3a]">{post.faculty} · {post.dept} Dept</span>
                                  <span className="text-[10px] text-[#5a5a5a] font-medium">{post.time}</span>
                                </div>
                              </div>
                            </div>

                            <hr className="border-[#ab9b8e]/25 my-3" />

                            {/* Tags */}
                            <div className="flex items-center gap-2 mb-3">
                              <span className="bg-[#8690a2] text-white px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wider uppercase flex items-center gap-1">
                                🚀 PROJECT
                              </span>
                              {post.domain && (
                                <span className="bg-[#d2c296]/20 border border-[#d2c296] text-[#8690a2] px-2 py-0.5 rounded-full text-[9px] font-bold">
                                  {post.domain}
                                </span>
                              )}
                            </div>

                            {/* Title & Description */}
                            <h2 
                              className="text-base md:text-lg font-bold text-[#8690a2] mb-1.5 leading-snug"
                              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                            >
                              &ldquo;{post.title}&rdquo;
                            </h2>
                            <p className="text-xs text-[#5a5a5a] mb-4 leading-relaxed">{post.description}</p>

                            {/* Project details list */}
                            <div className="flex flex-col gap-2 bg-[#f5f3ec]/40 p-3 rounded-lg border border-[#ab9b8e]/15 mb-4 text-xs text-[#5a5a5a]">
                              {post.skills && (
                                <div className="flex items-center flex-wrap gap-1.5">
                                  <span className="font-bold text-[#3a3a3a] mr-1">Skills needed:</span>
                                  {post.skills.map((skill) => (
                                    <span key={skill} className="px-2 py-0.5 bg-[#f5f3ec] border border-[#bdd1d3] text-[#5a5a5a] rounded text-[10px] font-semibold">
                                      {skill}
                                    </span>
                                  ))}
                                </div>
                              )}
                              
                              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-1.5 pt-1.5 border-t border-[#ab9b8e]/10">
                                <div>
                                  <span className="font-bold text-[#3a3a3a]">Duration: </span>{post.duration}
                                </div>
                                <div>
                                  <span className="font-bold text-[#3a3a3a]">Students: </span>{post.slots} ({post.remaining} left)
                                </div>
                                <div className="col-span-2 md:col-span-1">
                                  <span className="font-bold text-[#3a3a3a]">Deadline: </span>{post.deadline}
                                </div>
                              </div>
                            </div>

                            <hr className="border-[#ab9b8e]/25 my-3" />

                            {/* Actions / Compatibility */}
                            <div className="flex items-center justify-between mt-2">
                              {post.compatibility && (
                                <span className="bg-[#d2c296] text-[#3a3a3a] font-bold text-[10px] px-2.5 py-1 rounded-full shadow-sm">
                                  ⚡ {post.compatibility}% match
                                </span>
                              )}
                              
                              <div className="flex items-center gap-2">
                                <motion.button
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => toggleSave(post.id)}
                                  className={`px-3 py-1.5 rounded-lg border border-[#ab9b8e] text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                                    isSaved 
                                      ? "bg-[#d2c296] border-[#d2c296] text-[#3a3a3a]" 
                                      : "text-[#8690a2] hover:bg-[#e0decd]"
                                  }`}
                                >
                                  <Bookmark className={`w-3.5 h-3.5 ${isSaved ? "fill-[#3a3a3a]" : ""}`} />
                                  <span>{isSaved ? "Saved" : "Save"}</span>
                                </motion.button>

                                <motion.button
                                  whileTap={{ scale: 0.96 }}
                                  onClick={() => toggleApply(post.id, "project")}
                                  disabled={isApplied}
                                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                                    isApplied
                                      ? "bg-[#ab9b8e] text-white cursor-not-allowed"
                                      : "bg-[#8690a2] text-white hover:bg-[#bdd1d3] hover:text-[#3a3a3a] shadow-sm"
                                  }`}
                                >
                                  <span>{isApplied ? "Applied ✓" : "Apply →"}</span>
                                </motion.button>
                              </div>
                            </div>
                          </motion.div>
                        );
                      }

                      // Hackathon Card
                      if (post.type === "hackathon") {
                        return (
                          <motion.div
                            key={post.id}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: index * 0.08 }}
                            className="bg-[#e0decd]/80 border border-[#ab9b8e]/25 rounded-[16px] p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden"
                          >
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2.5">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#8690a2] to-[#bdd1d3] text-white flex items-center justify-center font-bold text-sm shadow-inner">
                                  {post.faculty ? getInitials(post.faculty) : "HK"}
                                </div>
                                <div className="flex flex-col">
                                  <span className="font-bold text-xs text-[#3a3a3a]">{post.faculty} · {post.dept}</span>
                                  <span className="text-[10px] text-[#5a5a5a] font-medium">{post.time}</span>
                                </div>
                              </div>
                            </div>

                            <hr className="border-[#ab9b8e]/25 my-3" />

                            <div className="flex items-center gap-2 mb-3">
                              <span className="bg-[#d2c296] text-[#3a3a3a] px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wider uppercase flex items-center gap-1">
                                🏆 HACKATHON
                              </span>
                            </div>

                            <h2 
                              className="text-base md:text-lg font-bold text-[#8690a2] mb-1.5 leading-snug"
                              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                            >
                              &ldquo;{post.title}&rdquo;
                            </h2>
                            <p className="text-xs text-[#5a5a5a] mb-4 leading-relaxed">{post.description}</p>

                            <div className="flex flex-col gap-2 bg-[#f5f3ec]/40 p-3 rounded-lg border border-[#ab9b8e]/15 mb-4 text-xs text-[#5a5a5a]">
                              <div>
                                <span className="font-bold text-[#3a3a3a]">Need: </span>
                                <span className="text-[#8690a2] font-semibold">{post.rolesNeeded}</span>
                              </div>
                              <div className="grid grid-cols-2 gap-2 mt-1.5 pt-1.5 border-t border-[#ab9b8e]/10">
                                <div>
                                  <span className="font-bold text-[#3a3a3a]">Team Slots: </span>{post.teamSlots}
                                </div>
                                <div>
                                  <span className="font-bold text-[#3a3a3a]">Deadline: </span>{post.deadline}
                                </div>
                              </div>
                            </div>

                            <hr className="border-[#ab9b8e]/25 my-3" />

                            <div className="flex items-center justify-between mt-2">
                              {post.compatibility && (
                                <span className="bg-[#d2c296] text-[#3a3a3a] font-bold text-[10px] px-2.5 py-1 rounded-full shadow-sm">
                                  ⚡ {post.compatibility}% match
                                </span>
                              )}
                              
                              <div className="flex items-center gap-2">
                                <motion.button
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => toggleSave(post.id)}
                                  className={`px-3 py-1.5 rounded-lg border border-[#ab9b8e] text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                                    isSaved 
                                      ? "bg-[#d2c296] border-[#d2c296] text-[#3a3a3a]" 
                                      : "text-[#8690a2] hover:bg-[#e0decd]"
                                  }`}
                                >
                                  <Bookmark className={`w-3.5 h-3.5 ${isSaved ? "fill-[#3a3a3a]" : ""}`} />
                                  <span>{isSaved ? "Saved" : "Save"}</span>
                                </motion.button>

                                <motion.button
                                  whileTap={{ scale: 0.96 }}
                                  onClick={() => toggleApply(post.id, "hackathon")}
                                  disabled={isApplied}
                                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                                    isApplied
                                      ? "bg-[#ab9b8e] text-white cursor-not-allowed"
                                      : "bg-[#8690a2] text-white hover:bg-[#bdd1d3] hover:text-[#3a3a3a] shadow-sm"
                                  }`}
                                >
                                  <span>{isApplied ? "Joined Team ✓" : "Join Team →"}</span>
                                </motion.button>
                              </div>
                            </div>
                          </motion.div>
                        );
                      }

                      // Achievement Card
                      if (post.type === "achievement") {
                        return (
                          <motion.div
                            key={post.id}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: index * 0.08 }}
                            className="bg-[#e0decd]/80 border border-[#ab9b8e]/25 rounded-[16px] p-4 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-[#bdd1d3] text-[#3a3a3a] flex items-center justify-center font-bold text-xs">
                                  {post.studentName ? getInitials(post.studentName) : "ST"}
                                </div>
                                <div className="flex flex-col">
                                  <span className="font-bold text-xs text-[#3a3a3a]">{post.studentName}</span>
                                  <span className="text-[9px] text-[#5a5a5a] font-medium">{post.time}</span>
                                </div>
                              </div>
                              <span className="bg-[#bdd1d3] text-[#3a3a3a] px-2.5 py-0.5 rounded-full text-[9px] font-bold tracking-wider uppercase">
                                🏅 ACHIEVEMENT
                              </span>
                            </div>

                            <div className="mt-2.5 pl-1">
                              <h2 
                                className="text-sm md:text-base font-bold text-[#8690a2] mb-1 leading-snug"
                                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                              >
                                {post.title}
                              </h2>
                              
                              {post.verifiedBy && (
                                <p className="text-[10px] text-[#8690a2] font-semibold flex items-center gap-1 mt-1">
                                  <span>✅</span> {post.verifiedBy}
                                </p>
                              )}
                            </div>

                            <hr className="border-[#ab9b8e]/20 my-3" />

                            <div className="flex items-center justify-between pl-1">
                              <span className="text-[10px] text-[#5a5a5a] font-semibold">
                                👏 {post.reactions} {post.reactions === 1 ? "person reacted" : "people reacted"}
                              </span>

                              <motion.button
                                whileTap={{ scale: 0.9 }}
                                onClick={() => handleReact(post.id)}
                                className={`px-3 py-1 rounded-full border text-[10px] font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
                                  isReacted
                                    ? "bg-[#8690a2] border-[#8690a2] text-white"
                                    : "border-[#ab9b8e] text-[#8690a2] hover:bg-[#bdd1d3]/30"
                                }`}
                              >
                                <motion.span
                                  animate={isReacted ? { y: [0, -10, 0], scale: [1, 1.3, 1] } : {}}
                                  transition={{ duration: 0.3 }}
                                  className="inline-block"
                                >
                                  👏
                                </motion.span>
                                <span>{isReacted ? "Reacted" : "React"}</span>
                              </motion.button>
                            </div>
                          </motion.div>
                        );
                      }

                      // Faculty Research Card
                      if (post.type === "research") {
                        return (
                          <motion.div
                            key={post.id}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: index * 0.08 }}
                            className="bg-[#e0decd]/80 border border-[#ab9b8e]/25 rounded-[16px] p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden"
                          >
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2.5">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#8690a2] to-[#ab9b8e] text-white flex items-center justify-center font-bold text-sm shadow-inner">
                                  {post.faculty ? getInitials(post.faculty) : "FC"}
                                </div>
                                <div className="flex flex-col">
                                  <span className="font-bold text-xs text-[#3a3a3a]">{post.faculty}</span>
                                  <span className="text-[10px] text-[#5a5a5a] font-medium">{post.designation} · {post.dept}</span>
                                </div>
                              </div>
                              <span className="text-[10px] text-[#ab9b8e] font-semibold">{post.time}</span>
                            </div>

                            <hr className="border-[#ab9b8e]/25 my-3" />

                            <div className="flex items-center gap-2 mb-3">
                              <span className="bg-[#ab9b8e] text-white px-2.5 py-0.5 rounded-full text-[9px] font-bold tracking-wider uppercase">
                                🔬 RESEARCH
                              </span>
                            </div>

                            <h2 
                              className="text-base md:text-lg font-bold text-[#8690a2] mb-1.5 leading-snug"
                              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                            >
                              &ldquo;{post.title}&rdquo;
                            </h2>
                            <p className="text-xs text-[#5a5a5a] mb-3.5 leading-relaxed">{post.description}</p>
                            
                            <p className="text-xs text-[#8690a2] font-bold italic mb-4">
                              &ldquo;Looking for research assistants with background in {post.domain || "relevant areas"}.&rdquo;
                            </p>

                            <hr className="border-[#ab9b8e]/25 my-3" />

                            <div className="flex items-center justify-between mt-2">
                              {post.compatibility && (
                                <span className="bg-[#d2c296] text-[#3a3a3a] font-bold text-[10px] px-2.5 py-1 rounded-full shadow-sm">
                                  ⚡ {post.compatibility}% match
                                </span>
                              )}
                              
                              <div className="flex items-center gap-2">
                                <motion.button
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => toggleSave(post.id)}
                                  className={`px-3 py-1.5 rounded-lg border border-[#ab9b8e] text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                                    isSaved 
                                      ? "bg-[#d2c296] border-[#d2c296] text-[#3a3a3a]" 
                                      : "text-[#8690a2] hover:bg-[#e0decd]"
                                  }`}
                                >
                                  <Bookmark className={`w-3.5 h-3.5 ${isSaved ? "fill-[#3a3a3a]" : ""}`} />
                                  <span>{isSaved ? "Saved" : "Save"}</span>
                                </motion.button>

                                <motion.button
                                  whileTap={{ scale: 0.96 }}
                                  onClick={() => toggleApply(post.id, "research")}
                                  disabled={isApplied}
                                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                                    isApplied
                                      ? "bg-[#ab9b8e] text-white cursor-not-allowed"
                                      : "bg-[#8690a2] text-white hover:bg-[#bdd1d3] hover:text-[#3a3a3a] shadow-sm"
                                  }`}
                                >
                                  <span>{isApplied ? "Applied ✓" : "Apply →"}</span>
                                </motion.button>
                              </div>
                            </div>
                          </motion.div>
                        );
                      }

                      return null;
                    })}
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="p-8 text-center bg-[#e0decd]/40 border border-[#bdd1d3] rounded-2xl flex flex-col items-center gap-2.5"
                  >
                    <Sparkles className="w-8 h-8 text-[#ab9b8e]" />
                    <p className="font-bold text-sm text-[#8690a2]">No matching posts found</p>
                    <p className="text-xs text-[#5a5a5a]">Try clearing search filters or queries.</p>
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery("")}
                        className="px-3.5 py-1.5 rounded-lg bg-[#8690a2] text-white text-xs font-bold hover:bg-[#bdd1d3] hover:text-[#3a3a3a] mt-2 transition-colors cursor-pointer"
                      >
                        Reset Search
                      </button>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

          </div>
        </main>

        {/* RIGHT SIDEBAR */}
        <aside className="hidden lg:flex flex-col w-[240px] fixed right-0 top-[56px] h-[calc(100vh-56px)] bg-[#e0decd] border-l border-[#ab9b8e]/25 z-30 overflow-y-auto py-5 px-4 gap-6 scrollbar-thin">
          
          {/* SECTION 1: Recommended For You */}
          <div className="flex flex-col gap-3">
            <span 
              className="text-[#8690a2] text-[10px] font-extrabold uppercase tracking-widest block"
            >
              Recommended for you
            </span>
            <div className="flex flex-col gap-2.5">
              {[
                { title: "AI Traffic Optimization", faculty: "Dr. Godfrey", compatibility: 87 },
                { title: "Blockchain Certificate Verification", faculty: "Dr. Baskar M.", compatibility: 91 },
                { title: "NLP Research Assistant", faculty: "Dr. Godfrey", compatibility: 91 }
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="bg-[#f5f3ec] border border-[#bdd1d3] rounded-[10px] p-3 flex flex-col gap-1.5 shadow-sm hover:border-[#8690a2] transition-colors cursor-pointer"
                  onClick={() => setSearchQuery(item.title)}
                >
                  <div className="flex flex-col">
                    <span className="font-bold text-xs text-[#3a3a3a] truncate">{item.title}</span>
                    <span className="text-[9px] text-[#5a5a5a]">{item.faculty}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between items-center text-[9px] font-bold text-[#8690a2]">
                      <span>Match Compatibility</span>
                      <span>{item.compatibility}%</span>
                    </div>
                    <div className="w-full h-1 bg-[#bdd1d3]/40 rounded-full overflow-hidden">
                      <div className="h-full bg-[#d2c296]" style={{ width: `${item.compatibility}%` }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <hr className="border-[#ab9b8e]/20" />

          {/* SECTION 2: Campus Talent Board (Top 3) */}
          <div className="flex flex-col gap-3">
            <span 
              className="text-[#8690a2] text-[10px] font-extrabold uppercase tracking-widest block"
            >
              This Week&apos;s Leaders
            </span>
            <div className="flex flex-col gap-2.5">
              {[
                { rank: "🥇", name: "Priya Sharma", pts: 1800, track: "AI/ML", avatarColor: "bg-red-200" },
                { rank: "🥈", name: "Karan Mehta", pts: 1620, track: "Web Dev", avatarColor: "bg-green-200" },
                { rank: "🥉", name: "Ananya K.", pts: 1540, track: "Research", avatarColor: "bg-blue-200" }
              ].map((student, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2 rounded-lg bg-[#f5f3ec]/60 border border-[#ab9b8e]/10 shadow-sm"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-sm font-semibold">{student.rank}</span>
                    <div className="w-7 h-7 rounded-full bg-[#8690a2]/30 flex items-center justify-center font-bold text-[10px] text-[#3a3a3a]">
                      {getInitials(student.name)}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="font-bold text-xs text-[#3a3a3a] truncate">{student.name}</span>
                      <span className="text-[9px] text-[#5a5a5a] truncate font-medium">{student.track}</span>
                    </div>
                  </div>
                  <span className="bg-[#d2c296] text-[#3a3a3a] text-[9px] font-extrabold px-1.5 py-0.5 rounded-full whitespace-nowrap">
                    {student.pts} pts
                  </span>
                </div>
              ))}
            </div>
          </div>

          <hr className="border-[#ab9b8e]/20" />

          {/* SECTION 3: Faculty Active Now */}
          <div className="flex flex-col gap-3">
            <span 
              className="text-[#8690a2] text-[10px] font-extrabold uppercase tracking-widest block"
            >
              Faculty Accepting Teams
            </span>
            <div className="flex flex-col gap-2.5">
              {[
                { name: "Dr. Godfrey", dept: "CSE Department", slots: 2 },
                { name: "Dr. Baskar M.", dept: "CSE Department", slots: 1 },
                { name: "Dr. Priya R.", dept: "ECE Department", slots: 2 }
              ].map((faculty, idx) => (
                <div
                  key={idx}
                  className="bg-[#f5f3ec]/60 border border-[#ab9b8e]/15 rounded-lg p-2.5 flex flex-col gap-1 shadow-sm"
                >
                  <div className="flex flex-col">
                    <span className="font-bold text-xs text-[#3a3a3a]">{faculty.name}</span>
                    <span className="text-[9px] text-[#5a5a5a]">{faculty.dept}</span>
                  </div>
                  <div className="flex items-center justify-between mt-1 pt-1 border-t border-[#ab9b8e]/10">
                    <span className="text-[9px] text-[#d2c296] font-bold uppercase tracking-wider">{faculty.slots} slots open</span>
                    <button
                      onClick={() => { router.push("/student/faculty"); }}
                      className="text-[9px] font-extrabold text-[#8690a2] hover:underline cursor-pointer"
                    >
                      View Profile →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>

      </div>

      {/* MOBILE BOTTOM NAVIGATION BAR */}
      <div className="fixed bottom-0 left-0 right-0 h-[56px] bg-[#e0decd] border-t border-[#ab9b8e]/30 z-40 md:hidden flex items-center justify-around px-2 shadow-lg">
        {[
          { label: "Home", icon: Home, active: true, action: () => { router.push("/student/feed"); } },
          { label: "Search", icon: SearchIcon, action: () => { setIsSearchFocused(true); } },
          { label: "Applications", icon: FileText, action: () => { router.push("/student/applications"); } },
          { label: "Profile", icon: User, action: () => { router.push("/student/profile"); } },
          { label: "More", icon: MoreHorizontal, action: () => { setShowMobileMore(true); } }
        ].map((item, idx) => {
          const Icon = item.icon;
          return (
            <button
              key={idx}
              onClick={item.action}
              className="flex flex-col items-center justify-center py-1 flex-1 cursor-pointer transition-colors"
            >
              <Icon className={`w-5 h-5 ${item.active ? "text-[#8690a2]" : "text-[#ab9b8e]"}`} />
              <span className={`text-[9px] font-bold mt-0.5 ${item.active ? "text-[#8690a2]" : "text-[#ab9b8e]"}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* MOBILE MORE SHEET / DRAWER */}
      <AnimatePresence>
        {showMobileMore && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMobileMore(false)}
              className="fixed inset-0 bg-black z-40 md:hidden"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="fixed bottom-0 left-0 right-0 bg-[#e0decd] border-t border-[#ab9b8e]/40 rounded-t-[20px] p-5 z-50 md:hidden flex flex-col gap-4"
            >
              <div className="flex justify-between items-center border-b border-[#ab9b8e]/20 pb-2">
                <span className="font-bold text-[#8690a2] text-sm uppercase tracking-wider">More Campus Options</span>
                <button
                  onClick={() => setShowMobileMore(false)}
                  className="p-1 rounded-full bg-[#f5f3ec] text-[#ab9b8e] hover:text-[#3a3a3a]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3 py-2">
                {[
                  { label: "Faculty Directory", route: "/student/faculty", icon: GraduationCap },
                  { label: "Leaderboard", route: "/student/leaderboard", icon: Trophy },
                  { label: "Saved Projects", route: "/student/saved", icon: Bookmark },
                  { label: "Invitations", route: "/student/invitations", icon: Mail },
                  { label: "Setup Profile", route: "/student/setup", icon: Settings }
                ].map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={idx}
                      onClick={() => { router.push(item.route); setShowMobileMore(false); }}
                      className="flex items-center gap-2.5 p-3 rounded-xl bg-[#f5f3ec] hover:bg-[#bdd1d3]/30 border border-[#ab9b8e]/20 transition-all cursor-pointer text-left"
                    >
                      <Icon className="w-4 h-4 text-[#8690a2]" />
                      <span className="text-xs font-semibold text-[#3a3a3a]">{item.label}</span>
                    </button>
                  );
                })}
              </div>
              <button
                onClick={handleLogout}
                className="w-full py-3 bg-red-500/10 hover:bg-red-500/20 text-red-600 hover:text-red-700 font-bold rounded-xl text-center text-xs flex items-center justify-center gap-2 border border-red-500/20 cursor-pointer mt-1"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout Session</span>
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* MOBILE SEARCH PANEL EXPANSION */}
      <AnimatePresence>
        {isSearchFocused && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[#f5f3ec] z-50 p-4 md:hidden flex flex-col gap-4 overflow-y-auto"
          >
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Search projects, faculty, skills..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                  className="w-full h-10 pl-10 pr-4 rounded-full bg-[#e0decd] border border-[#bdd1d3] text-sm text-[#3a3a3a] placeholder-[#ab9b8e] focus:outline-none"
                />
                <SearchIcon className="w-4 h-4 text-[#ab9b8e] absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
              <button
                onClick={() => { setIsSearchFocused(false); }}
                className="px-3 py-2 text-xs font-bold text-[#8690a2] bg-[#e0decd] border border-[#bdd1d3] rounded-full"
              >
                Cancel
              </button>
            </div>

            <div className="flex flex-col gap-4 mt-2">
              <div>
                <span className="font-bold text-[#8690a2] block mb-2 uppercase tracking-wider text-[10px]">Recommended for you</span>
                <div className="flex flex-wrap gap-2">
                  {["AI & ML", "Blockchain", "Healthcare NLP"].map((tag) => (
                    <button
                      key={tag}
                      onClick={() => { setSearchQuery(tag); setIsSearchFocused(false); }}
                      className="px-3 py-1.5 rounded-full bg-[#e0decd] hover:bg-[#bdd1d3] text-[#3a3a3a] border border-[#ab9b8e]/25 text-xs font-semibold cursor-pointer"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <span className="font-bold text-[#8690a2] block mb-2 uppercase tracking-wider text-[10px]">Based on your skills</span>
                <div className="flex flex-wrap gap-2">
                  {["React Web", "PyTorch Training", "Node.js API"].map((tag) => (
                    <button
                      key={tag}
                      onClick={() => { setSearchQuery(tag); setIsSearchFocused(false); }}
                      className="px-3 py-1.5 rounded-full bg-[#e0decd] hover:bg-[#bdd1d3] text-[#3a3a3a] border border-[#ab9b8e]/25 text-xs font-semibold cursor-pointer"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <span className="font-bold text-[#8690a2] block mb-2 uppercase tracking-wider text-[10px]">Recently posted</span>
                <div className="flex flex-col gap-2">
                  {[
                    { title: "Smart India Hackathon 2025", type: "Hackathon" },
                    { title: "AI-based Traffic Optimization System", type: "Project" }
                  ].map((item, idx) => (
                    <div
                      key={idx}
                      onClick={() => { setSearchQuery(item.title); setIsSearchFocused(false); }}
                      className="p-3 rounded-xl bg-[#e0decd]/75 hover:bg-[#bdd1d3]/35 cursor-pointer flex items-center justify-between transition-colors border border-[#ab9b8e]/20"
                    >
                      <span className="font-bold text-xs text-[#3a3a3a] truncate">{item.title}</span>
                      <span className="text-[9px] px-2 py-0.5 rounded bg-[#8690a2] text-white font-bold">{item.type}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function subscribeToStorage(callback: () => void) {
  if (typeof window === "undefined") {
    return () => undefined;
  }

  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

function readStudentProfileSnapshot() {
  if (typeof window === "undefined") {
    return null;
  }

  const data = window.localStorage.getItem("campusconnect_user");
  if (!data) {
    return null;
  }

  return safeParseJson<CampusConnectUser | null>(data, null);
}

function readFacultyPostsSnapshot() {
  if (typeof window === "undefined") {
    return [] as Post[];
  }

  return readFacultyPosts() as Post[];
}

function getBaseRemaining(id: number) {
  const post = MOCK_POSTS.find((item) => item.id === id);
  return post?.remaining ?? 0;
}

function getBaseReactions(id: number) {
  const post = MOCK_POSTS.find((item) => item.id === id);
  return post?.reactions ?? 0;
}
