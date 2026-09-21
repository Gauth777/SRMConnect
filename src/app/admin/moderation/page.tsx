"use client";

import AdminShell from "@/components/admin/AdminShell";
import LoadingScreen from "@/components/admin/LoadingScreen";
import { useAdminLive } from "@/lib/admin-live";

export default function AdminModerationPage() {
  const { mounted, admin, data, loading, error } = useAdminLive();
  if (!mounted || loading || !admin) return <LoadingScreen />;

  return <AdminShell adminName={admin.name} adminEmail={admin.email}>
    <div className="space-y-5">
      <div>
        <h1 className="font-['Playfair_Display'] text-3xl font-bold text-[#2C3830]">Post Moderation</h1>
        <p className="text-sm text-[#7D9185]">Live faculty projects from Supabase. The current schema has no separate moderation/flag queue, so no fake pending items are shown.</p>
      </div>
      {error || !data ? <ErrorCard message={error || "Live project data unavailable."}/> :
        <div className="space-y-3">
          {data.projects.map((post)=>(
            <div key={post.id} className="rounded-2xl border border-[#C7CAB6] bg-white p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="text-xs font-bold uppercase text-[#63807B]">{post.postType} · {post.domain}</div>
                  <h2 className="mt-1 text-lg font-bold text-[#2C3830]">{post.title}</h2>
                  <div className="mt-1 text-xs text-[#7D9185]">{post.facultyName || post.facultyEmail || "Faculty"} · {post.mode} · deadline {new Date(post.deadline).toLocaleDateString()}</div>
                </div>
                <div className="rounded-full bg-[#EEF0E9] px-3 py-1 text-xs font-bold text-[#4A5E58]">{post.status}</div>
              </div>
              <div className="mt-3 text-sm text-[#4A5E58]">{post.applicantCount} applicant{post.applicantCount===1?"":"s"}</div>
            </div>
          ))}
          {!data.projects.length && <Empty text="No faculty posts exist yet. New faculty posts will appear here automatically."/>}
        </div>}
    </div>
  </AdminShell>;
}
function Empty({text}:{text:string}) { return <div className="rounded-2xl border border-[#C7CAB6] bg-white p-8 text-center text-sm text-[#7D9185]">{text}</div>; }
function ErrorCard({message}:{message:string}) { return <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{message}</div>; }
