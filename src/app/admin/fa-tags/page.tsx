"use client";

import AdminShell from "@/components/admin/AdminShell";
import LoadingScreen from "@/components/admin/LoadingScreen";
import { useAdminLive } from "@/lib/admin-live";

export default function AdminFaTagsPage() {
  const { mounted, admin, data, loading, error } = useAdminLive();
  if (!mounted || loading || !admin) return <LoadingScreen />;

  return <AdminShell adminName={admin.name} adminEmail={admin.email}>
    <div className="space-y-5">
      <div><h1 className="font-['Playfair_Display'] text-3xl font-bold text-[#2C3830]">Faculty Advisor Tags</h1><p className="text-sm text-[#7D9185]">Live from faculty.advisor_role.</p></div>
      {error || !data ? <ErrorCard message={error || "Live faculty data unavailable."}/> :
        <div className="overflow-x-auto rounded-2xl border border-[#C7CAB6] bg-white">
          <table className="w-full min-w-[720px] text-left text-sm"><thead className="bg-[#EEF0E9]"><tr>{["Faculty","Employee ID","Department","Designation","Advisor Role","Verification","Projects"].map((h)=><th key={h} className="px-4 py-3">{h}</th>)}</tr></thead><tbody>
            {data.faculty.map((f)=><tr key={f.id} className="border-t border-[#E6E5DC]"><td className="px-4 py-3 font-semibold">{f.fullName || f.email}</td><td className="px-4 py-3">{f.employeeId}</td><td className="px-4 py-3">{f.department || "—"}</td><td className="px-4 py-3">{f.designation || "—"}</td><td className="px-4 py-3 font-bold text-[#63807B]">{f.advisorRole || "NEITHER"}</td><td className="px-4 py-3">{f.verificationStatus}</td><td className="px-4 py-3">{f.projectCount}</td></tr>)}
            {!data.faculty.length && <tr><td colSpan={7} className="px-4 py-10 text-center text-[#7D9185]">No faculty accounts exist yet. Once faculty register, they will appear here automatically.</td></tr>}
          </tbody></table>
        </div>}
    </div>
  </AdminShell>;
}
function ErrorCard({message}:{message:string}) { return <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{message}</div>; }
