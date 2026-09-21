import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";
import { ADMIN_SESSION_COOKIE, verifyAdminSession } from "@/lib/admin-session";

export const dynamic = "force-dynamic";

export async function GET() {
  const cookieStore = await cookies();
  if (!verifyAdminSession(cookieStore.get(ADMIN_SESSION_COOKIE)?.value)) {
    return NextResponse.json({ message: "Admin session expired." }, { status: 401 });
  }

  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secretKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !secretKey) {
    return NextResponse.json(
      { message: "Server-side Supabase admin credentials are not configured." },
      { status: 503 },
    );
  }

  const supabase = createClient(supabaseUrl, secretKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const [profilesResult, studentsResult, facultyResult, projectsResult, applicationsResult] =
    await Promise.all([
      supabase.from("profiles").select("id,email,full_name,role,status,profile_complete,created_at").order("created_at", { ascending: false }),
      supabase.from("students").select("id,registration_no,department,current_year,program,cgpa"),
      supabase.from("faculty").select("id,employee_id,designation,advisor_role,department,campus,verification_status"),
      supabase.from("projects").select("id,faculty_id,post_type,title,domain,mode,status,deadline,created_at").order("created_at", { ascending: false }),
      supabase.from("applications").select("id,project_id,student_id,status,created_at").order("created_at", { ascending: false }),
    ]);

  const firstError =
    profilesResult.error ||
    studentsResult.error ||
    facultyResult.error ||
    projectsResult.error ||
    applicationsResult.error;

  if (firstError) {
    return NextResponse.json({ message: firstError.message }, { status: 500 });
  }

  const profiles = profilesResult.data || [];
  const studentRows = studentsResult.data || [];
  const facultyRows = facultyResult.data || [];
  const projectRows = projectsResult.data || [];
  const applications = applicationsResult.data || [];

  const profileById = new Map(profiles.map((profile) => [profile.id, profile]));
  const applicationsByProject = new Map<string, number>();
  const applicationsByStudent = new Map<string, number>();
  for (const application of applications) {
    applicationsByProject.set(
      application.project_id,
      (applicationsByProject.get(application.project_id) || 0) + 1,
    );
    applicationsByStudent.set(
      application.student_id,
      (applicationsByStudent.get(application.student_id) || 0) + 1,
    );
  }

  const projectsByFaculty = new Map<string, number>();
  for (const project of projectRows) {
    projectsByFaculty.set(
      project.faculty_id,
      (projectsByFaculty.get(project.faculty_id) || 0) + 1,
    );
  }

  const students = studentRows.map((student) => {
    const profile = profileById.get(student.id);
    return {
      id: student.id,
      email: profile?.email || "",
      fullName: profile?.full_name || null,
      status: profile?.status || "ACTIVE",
      profileComplete: Boolean(profile?.profile_complete),
      createdAt: profile?.created_at || "",
      registrationNo: student.registration_no,
      department: student.department,
      currentYear: student.current_year,
      program: student.program,
      cgpa: student.cgpa,
      applicationCount: applicationsByStudent.get(student.id) || 0,
    };
  });

  const faculty = facultyRows.map((row) => {
    const profile = profileById.get(row.id);
    return {
      id: row.id,
      email: profile?.email || "",
      fullName: profile?.full_name || null,
      status: profile?.status || "ACTIVE",
      profileComplete: Boolean(profile?.profile_complete),
      createdAt: profile?.created_at || "",
      employeeId: row.employee_id,
      designation: row.designation,
      advisorRole: row.advisor_role,
      department: row.department,
      campus: row.campus,
      verificationStatus: row.verification_status,
      projectCount: projectsByFaculty.get(row.id) || 0,
    };
  });

  const projects = projectRows.map((project) => {
    const profile = profileById.get(project.faculty_id);
    return {
      id: project.id,
      facultyId: project.faculty_id,
      facultyName: profile?.full_name || null,
      facultyEmail: profile?.email || null,
      postType: project.post_type,
      title: project.title,
      domain: project.domain,
      mode: project.mode,
      status: project.status,
      deadline: project.deadline,
      createdAt: project.created_at,
      applicantCount: applicationsByProject.get(project.id) || 0,
    };
  });

  const now = Date.now();
  const weekAgo = now - 7 * 24 * 60 * 60 * 1000;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayMs = today.getTime();

  return NextResponse.json({
    generatedAt: new Date().toISOString(),
    profiles: profiles.map((profile) => ({
      id: profile.id,
      email: profile.email,
      fullName: profile.full_name,
      role: profile.role,
      status: profile.status,
      profileComplete: profile.profile_complete,
      createdAt: profile.created_at,
    })),
    students,
    faculty,
    projects,
    applications: applications.map((application) => ({
      id: application.id,
      projectId: application.project_id,
      studentId: application.student_id,
      status: application.status,
      createdAt: application.created_at,
    })),
    summary: {
      totalStudents: students.length,
      totalFaculty: faculty.length,
      totalProfiles: profiles.length,
      activePosts: projectRows.filter((project) => project.status === "OPEN").length,
      totalProjects: projectRows.length,
      totalApplications: applications.length,
      faTaggedFaculty: facultyRows.filter((row) => row.advisor_role === "FA" || row.advisor_role === "BOTH").length,
      newJoinsThisWeek: profiles.filter((profile) => new Date(profile.created_at).getTime() >= weekAgo).length,
      postsThisWeek: projectRows.filter((project) => new Date(project.created_at).getTime() >= weekAgo).length,
      applicationsToday: applications.filter((application) => new Date(application.created_at).getTime() >= todayMs).length,
      completedProfiles: profiles.filter((profile) => profile.profile_complete).length,
    },
    capabilities: {
      reports: false,
      moderationFlags: false,
      leaderboardPoints: false,
    },
  });
}
