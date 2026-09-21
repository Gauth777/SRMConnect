"use client";

import { useMemo } from "react";
import AdminShell from "@/components/admin/AdminShell";
import LoadingScreen from "@/components/admin/LoadingScreen";
import { useAdminLive } from "@/lib/admin-live";

export default function AdminAnalyticsPage() {
  const { mounted, admin, data, loading, error } = useAdminLive();
  const departments = useMemo(()=>{
    const map = new Map<string,number>();
    data?.students.forEach((s)=>map.set(s.department || "Unspecified",(map.get(s.department || "Unspecified")||0)+1));
    data?.faculty.forEach((f)=>map.set(f.department || "Unspecified",(map.get(f.department || "Unspecified")||0)+1));
    return [...map.entries()].sort((a,b)=>b[1]-a[1]);
  },[data]);

  if (!mounted || loading || !admin) return <LoadingScreen />;
  return <AdminShell adminName={admin.name} adminEmail={admin.email}>
    <div className="space-y-6">
      <div><h1 className="font-['Playfair_Display'] text-3xl font-bold text-[#2C3830]">Analytics</h1><p className="text-sm text-[#7D9185]">Derived from current Supabase records.</p></div>
      {error || !data ? <ErrorCard message={error || "Live analytics unavailable."}/> : <>
        <div className="grid gap-4 md:grid-cols-3">
          <Stat label="Profiles" value={data.summary.totalProfiles}/><Stat label="Projects" value={data.summary.totalProjects}/><Stat label="Applications" value={data.summary.totalApplications}/>
          <Stat label="Students" value={data.summary.totalStudents}/><Stat label="Faculty" value={data.summary.totalFaculty}/><Stat label="Completed Profiles" value={data.summary.completedProfiles}/>
        </div>
        <div className="grid gap-5 lg:grid-cols-2">
          <Panel title="Project Status">
            {["OPEN","DRAFT","CLOSED","ARCHIVED"].map((status)=><Bar key={status} label={status} value={data.projects.filter((p)=>p.status===status).length} total={Math.max(1,data.projects.length)}/>)}
          </Panel>
          <Panel title="Application Status">
            {["PENDING","ACCEPTED","REJECTED","WITHDRAWN"].map((status)=><Bar key={status} label={status} value={data.applications.filter((a)=>a.status===status).length} total={Math.max(1,data.applications.length)}/>)}
          </Panel>
          <Panel title="Department Distribution">
            {departments.length ? departments.map(([name,count])=><Bar key={name} label={name} value={count} total={Math.max(1,data.summary.totalStudents+data.summary.totalFaculty)}/>) : <p className="text-sm text-[#7D9185]">No department data yet.</p>}
          </Panel>
          <Panel title="Recent Growth">
            <div className="space-y-2 text-sm"><Row label="New joins, last 7 days" value={data.summary.newJoinsThisWeek}/><Row label="Posts, last 7 days" value={data.summary.postsThisWeek}/><Row label="Applications today" value={data.summary.applicationsToday}/></div>
          </Panel>
        </div>
      </>}
    </div>
  </AdminShell>;
}
function Stat({label,value}:{label:string;value:number}){return <div className="rounded-2xl border border-[#C7CAB6] bg-white p-5"><div className="text-xs text-[#7D9185]">{label}</div><div className="mt-1 text-3xl font-extrabold text-[#63807B]">{value}</div></div>}
function Panel({title,children}:{title:string;children:React.ReactNode}){return <div className="rounded-2xl border border-[#C7CAB6] bg-white p-5"><h2 className="mb-4 font-['Playfair_Display'] text-xl font-bold text-[#2C3830]">{title}</h2>{children}</div>}
function Bar({label,value,total}:{label:string;value:number;total:number}){return <div className="mb-3"><div className="mb-1 flex justify-between text-xs"><span>{label}</span><b>{value}</b></div><div className="h-2 rounded-full bg-[#EEF0E9]"><div className="h-2 rounded-full bg-[#63807B]" style={{width:`${Math.min(100,(value/total)*100)}%`}}/></div></div>}
function Row({label,value}:{label:string;value:number}){return <div className="flex justify-between"><span className="text-[#4A5E58]">{label}</span><b>{value}</b></div>}
function ErrorCard({message}:{message:string}) { return <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{message}</div>; }
