"use client";

import { useMemo } from "react";
import AdminShell from "@/components/admin/AdminShell";
import LoadingScreen from "@/components/admin/LoadingScreen";
import { useAdminLive } from "@/lib/admin-live";

export default function AdminLeaderboardPage() {
  const { mounted, admin, data, loading, error } = useAdminLive();
  const activity = useMemo(()=>[...(data?.students || [])].sort((a,b)=>b.applicationCount-a.applicationCount),[data]);
  if (!mounted || loading || !admin) return <LoadingScreen />;

  return <AdminShell adminName={admin.name} adminEmail={admin.email}>
    <div className="space-y-5">
      <div><h1 className="font-['Playfair_Display'] text-3xl font-bold text-[#2C3830]">Leaderboard</h1><p className="text-sm text-[#7D9185]">No fabricated points or rankings.</p></div>
      {error || !data ? <ErrorCard message={error || "Live data unavailable."}/> : <>
        <div className="rounded-2xl border border-[#E2C383] bg-[#FFF9E8] p-5 text-sm text-[#665321]">
          SRM Connect does not currently have a leaderboard/points table or scoring rules in the database. The old point values were static demo data. Below is only live application activity and is not treated as a score.
        </div>
        <div className="rounded-2xl border border-[#C7CAB6] bg-white p-5">
          <h2 className="mb-3 font-bold text-[#2C3830]">Student application activity</h2>
          {activity.length ? activity.map((student)=><div key={student.id} className="flex justify-between border-b border-[#E6E5DC] py-3 last:border-0"><div><div className="font-semibold">{student.fullName || student.email}</div><div className="text-xs text-[#7D9185]">{student.registrationNo}</div></div><b>{student.applicationCount} applications</b></div>) : <p className="text-sm text-[#7D9185]">No student records yet.</p>}
        </div>
      </>}
    </div>
  </AdminShell>;
}
function ErrorCard({message}:{message:string}) { return <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{message}</div>; }
