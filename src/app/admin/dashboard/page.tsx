"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { Users, GraduationCap, FileText, BadgeCheck, UserPlus, ClipboardList } from "lucide-react";
import AdminShell from "@/components/admin/AdminShell";
import LoadingScreen from "@/components/admin/LoadingScreen";
import { useAdminLive } from "@/lib/admin-live";

export default function AdminDashboardPage() {
  const router = useRouter();
  const { mounted, admin, data, loading, error } = useAdminLive();

  const activities = useMemo(() => {
    if (!data) return [];
    return [
      ...data.profiles.slice(0, 5).map((profile) => ({
        key: `profile-${profile.id}`,
        text: `${profile.fullName || profile.email} joined as ${profile.role.toLowerCase()}`,
        at: profile.createdAt,
      })),
      ...data.projects.slice(0, 5).map((project) => ({
        key: `project-${project.id}`,
        text: `${project.facultyName || "Faculty"} posted “${project.title}”`,
        at: project.createdAt,
      })),
    ]
      .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
      .slice(0, 6);
  }, [data]);

  if (!mounted || loading || !admin) return <LoadingScreen />;

  return (
    <AdminShell adminName={admin.name} adminEmail={admin.email}>
      {error || !data ? (
        <ErrorCard message={error || "Live admin data is unavailable."} />
      ) : (
        <div className="space-y-6">
          <div className="admin-stats-grid">
            {[
              [Users, "Total Students", data.summary.totalStudents],
              [GraduationCap, "Total Faculty", data.summary.totalFaculty],
              [FileText, "Active Posts", data.summary.activePosts],
              [ClipboardList, "Applications", data.summary.totalApplications],
              [BadgeCheck, "FA Tagged Faculty", data.summary.faTaggedFaculty],
              [UserPlus, "New Joins (7d)", data.summary.newJoinsThisWeek],
            ].map(([Icon, label, value]: any) => (
              <div key={label} className="rounded-2xl border border-[#C7CAB6] bg-white/90 p-5">
                <div className="flex items-center gap-2 text-xs text-[#4A5E58]"><Icon className="h-4 w-4" />{label}</div>
                <div className="mt-2 font-['Playfair_Display'] text-4xl font-extrabold text-[#63807B]">{value}</div>
              </div>
            ))}
          </div>

          <div className="grid gap-3 md:grid-cols-4">
            {[
              ["Faculty Advisor Tags", "/admin/fa-tags"],
              ["Live Projects", "/admin/moderation"],
              ["Reports", "/admin/reports"],
              ["Analytics", "/admin/analytics"],
            ].map(([label, route]) => (
              <button key={route} onClick={() => router.push(route)} className="rounded-xl bg-[#63807B] px-4 py-3 text-sm font-bold text-white">
                {label}
              </button>
            ))}
          </div>

          <section className="grid gap-5 lg:grid-cols-[1fr_300px]">
            <div>
              <h2 className="mb-3 font-['Playfair_Display'] text-2xl font-bold text-[#2C3830]">Recent Activity</h2>
              <div className="space-y-2">
                {activities.length ? activities.map((item) => (
                  <div key={item.key} className="rounded-xl border border-[#C7CAB6] bg-white/90 px-4 py-3">
                    <div className="text-sm font-medium text-[#2C3830]">{item.text}</div>
                    <div className="mt-1 text-xs text-[#7D9185]">{new Date(item.at).toLocaleString()}</div>
                  </div>
                )) : <Empty text="No platform activity yet." />}
              </div>
            </div>

            <div className="space-y-5">
              <Card title="Platform Health">
                <Metric label="Profiles" value={data.summary.totalProfiles} />
                <Metric label="Completed Profiles" value={data.summary.completedProfiles} />
                <Metric label="Posts This Week" value={data.summary.postsThisWeek} />
                <Metric label="Applications Today" value={data.summary.applicationsToday} />
              </Card>
              <Card title="Top Posts">
                {data.projects.length ? [...data.projects].sort((a,b)=>b.applicantCount-a.applicantCount).slice(0,3).map((post)=>(
                  <div key={post.id} className="border-b border-[#E6E5DC] py-2 last:border-0">
                    <div className="text-sm font-semibold text-[#2C3830]">{post.title}</div>
                    <div className="text-xs text-[#7D9185]">{post.applicantCount} applicants</div>
                  </div>
                )) : <Empty text="No faculty posts yet." />}
              </Card>
            </div>
          </section>
        </div>
      )}
    </AdminShell>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return <div className="rounded-2xl border border-[#C7CAB6] bg-white/90 p-5"><h3 className="mb-3 font-['Playfair_Display'] text-lg font-bold text-[#2C3830]">{title}</h3>{children}</div>;
}
function Metric({ label, value }: { label: string; value: number }) {
  return <div className="flex justify-between py-1.5 text-sm"><span className="text-[#4A5E58]">{label}</span><b className="text-[#2C3830]">{value}</b></div>;
}
function Empty({ text }: { text: string }) { return <div className="text-sm text-[#7D9185]">{text}</div>; }
function ErrorCard({ message }: { message: string }) { return <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">{message}</div>; }
