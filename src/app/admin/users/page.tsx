"use client";

import { useMemo, useState } from "react";
import AdminShell from "@/components/admin/AdminShell";
import LoadingScreen from "@/components/admin/LoadingScreen";
import { useAdminLive } from "@/lib/admin-live";

export default function AdminUsersPage() {
  const { mounted, admin, data, loading, error } = useAdminLive();
  const [tab, setTab] = useState<"students"|"faculty">("students");
  const [query, setQuery] = useState("");

  const rows = useMemo(() => {
    if (!data) return [];
    const q = query.trim().toLowerCase();
    const source = tab === "students" ? data.students : data.faculty;
    if (!q) return source;
    return source.filter((row: any) =>
      [row.fullName,row.email,row.registrationNo,row.employeeId,row.department,row.designation]
        .filter(Boolean).some((value)=>String(value).toLowerCase().includes(q))
    );
  }, [data, tab, query]);

  if (!mounted || loading || !admin) return <LoadingScreen />;

  return <AdminShell adminName={admin.name} adminEmail={admin.email}>
    <div className="space-y-5">
      <div>
        <h1 className="font-['Playfair_Display'] text-3xl font-bold text-[#2C3830]">User Management</h1>
        <p className="text-sm text-[#7D9185]">Live records from Supabase. No mock users are shown.</p>
      </div>
      {error || !data ? <ErrorCard message={error || "Live user data unavailable."}/> : <>
        <div className="flex flex-wrap gap-3">
          <button onClick={()=>setTab("students")} className={tab==="students"?"rounded-lg bg-[#63807B] px-4 py-2 text-sm font-bold text-white":"rounded-lg border border-[#63807B] px-4 py-2 text-sm text-[#63807B]"}>Students ({data.students.length})</button>
          <button onClick={()=>setTab("faculty")} className={tab==="faculty"?"rounded-lg bg-[#63807B] px-4 py-2 text-sm font-bold text-white":"rounded-lg border border-[#63807B] px-4 py-2 text-sm text-[#63807B]"}>Faculty ({data.faculty.length})</button>
          <input value={query} onChange={(e)=>setQuery(e.target.value)} placeholder="Search live records…" className="min-w-[240px] flex-1 rounded-lg border border-[#C7CAB6] bg-white px-3 py-2 text-sm"/>
        </div>
        <div className="overflow-x-auto rounded-2xl border border-[#C7CAB6] bg-white">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-[#EEF0E9] text-[#4A5E58]">
              <tr>{tab==="students" ? ["Name","Email","Registration No.","Department","Year","Applications","Status"] : ["Name","Email","Employee ID","Department","Designation","Advisor Role","Projects","Verification"].map((x)=><th key={x} className="px-4 py-3">{x}</th>)}</tr>
            </thead>
            <tbody>
              {rows.map((row:any)=><tr key={row.id} className="border-t border-[#E6E5DC]">
                <td className="px-4 py-3 font-semibold text-[#2C3830]">{row.fullName || "—"}</td>
                <td className="px-4 py-3">{row.email}</td>
                {tab==="students" ? <>
                  <td className="px-4 py-3">{row.registrationNo}</td><td className="px-4 py-3">{row.department || "—"}</td><td className="px-4 py-3">{row.currentYear || "—"}</td><td className="px-4 py-3">{row.applicationCount}</td><td className="px-4 py-3">{row.status}</td>
                </> : <>
                  <td className="px-4 py-3">{row.employeeId}</td><td className="px-4 py-3">{row.department || "—"}</td><td className="px-4 py-3">{row.designation || "—"}</td><td className="px-4 py-3">{row.advisorRole || "NEITHER"}</td><td className="px-4 py-3">{row.projectCount}</td><td className="px-4 py-3">{row.verificationStatus}</td>
                </>}
              </tr>)}
              {!rows.length && <tr><td colSpan={8} className="px-4 py-10 text-center text-[#7D9185]">No live {tab} records found.</td></tr>}
            </tbody>
          </table>
        </div>
      </>}
    </div>
  </AdminShell>;
}
function ErrorCard({message}:{message:string}) { return <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{message}</div>; }
