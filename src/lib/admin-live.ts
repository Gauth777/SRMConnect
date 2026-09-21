"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export interface AdminProfile {
  id: string;
  email: string;
  fullName: string | null;
  role: "STUDENT" | "FACULTY" | "ADMIN";
  status: "ACTIVE" | "INACTIVE" | "BLOCKED";
  profileComplete: boolean;
  createdAt: string;
}

export interface AdminStudent {
  id: string;
  email: string;
  fullName: string | null;
  status: string;
  profileComplete: boolean;
  createdAt: string;
  registrationNo: string;
  department: string | null;
  currentYear: number | null;
  program: string | null;
  cgpa: number | null;
  applicationCount: number;
}

export interface AdminFaculty {
  id: string;
  email: string;
  fullName: string | null;
  status: string;
  profileComplete: boolean;
  createdAt: string;
  employeeId: string;
  designation: string | null;
  advisorRole: "FA" | "AA" | "BOTH" | "NEITHER" | null;
  department: string | null;
  campus: string | null;
  verificationStatus: "PENDING" | "VERIFIED" | "REJECTED";
  projectCount: number;
}

export interface AdminProject {
  id: string;
  facultyId: string;
  facultyName: string | null;
  facultyEmail: string | null;
  postType: string;
  title: string;
  domain: string;
  mode: string;
  status: string;
  deadline: string;
  createdAt: string;
  applicantCount: number;
}

export interface AdminApplication {
  id: string;
  projectId: string;
  studentId: string;
  status: string;
  createdAt: string;
}

export interface AdminLiveData {
  generatedAt: string;
  profiles: AdminProfile[];
  students: AdminStudent[];
  faculty: AdminFaculty[];
  projects: AdminProject[];
  applications: AdminApplication[];
  summary: {
    totalStudents: number;
    totalFaculty: number;
    totalProfiles: number;
    activePosts: number;
    totalProjects: number;
    totalApplications: number;
    faTaggedFaculty: number;
    newJoinsThisWeek: number;
    postsThisWeek: number;
    applicationsToday: number;
    completedProfiles: number;
  };
  capabilities: {
    reports: boolean;
    moderationFlags: boolean;
    leaderboardPoints: boolean;
  };
}

export function useAdminLive() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [admin, setAdmin] = useState<{ name: string; email: string } | null>(null);
  const [data, setData] = useState<AdminLiveData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    setMounted(true);

    const raw = localStorage.getItem("campusconnect_user");
    if (!raw) {
      router.replace("/login/admin");
      return;
    }

    let parsed: any;
    try {
      parsed = JSON.parse(raw);
    } catch {
      localStorage.removeItem("campusconnect_user");
      router.replace("/login/admin");
      return;
    }

    if (parsed.role !== "admin" || !parsed.loggedIn) {
      router.replace("/login/admin");
      return;
    }

    setAdmin({ name: parsed.name || "Admin", email: parsed.email || "" });

    void fetch("/api/admin/live", { cache: "no-store" })
      .then(async (response) => {
        const payload = await response.json().catch(() => ({}));
        if (response.status === 401) {
          localStorage.removeItem("campusconnect_user");
          router.replace("/login/admin");
          return null;
        }
        if (!response.ok) {
          throw new Error(payload.message || "Could not load live admin data.");
        }
        return payload as AdminLiveData;
      })
      .then((payload) => {
        if (!cancelled && payload) setData(payload);
      })
      .catch((requestError) => {
        if (!cancelled) setError(requestError instanceof Error ? requestError.message : "Could not load live admin data.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [router]);

  return { mounted, admin, data, loading, error };
}
