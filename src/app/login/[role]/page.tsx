"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { AuthLoginScreen } from "@/components/AuthLoginScreen";
import type { Role } from "@/components/RoleSelectionScreen";

interface PageProps {
  params: Promise<{ role: string }>;
}

const ROLES: Role[] = ["student", "faculty", "admin"];

export default function LoginPage({ params }: PageProps) {
  const router = useRouter();
  const { role: rawRole } = use(params);
  const role = ROLES.includes(rawRole as Role) ? (rawRole as Role) : "student";

  return <AuthLoginScreen role={role} onBack={() => router.push("/role-select?back=true")} />;
}
