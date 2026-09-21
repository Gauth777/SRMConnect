"use client";

import AdminShell from "@/components/admin/AdminShell";
import LoadingScreen from "@/components/admin/LoadingScreen";
import { useAdminLive } from "@/lib/admin-live";

export default function AdminReportsPage() {
  const { mounted, admin, data, loading, error } = useAdminLive();
  if (!mounted || loading || !admin) return <LoadingScreen />;
  return <AdminShell adminName={admin.name} adminEmail={admin.email}>
    <div className="space-y-5">
      <div><h1 className="font-['Playfair_Display'] text-3xl font-bold text-[#2C3830]">Reports & Disputes</h1><p className="text-sm text-[#7D9185]">Live state only.</p></div>
      {error || !data ? <ErrorCard message={error || "Live admin data unavailable."}/> :
        <div className="rounded-2xl border border-[#C7CAB6] bg-white p-8">
          <div className="text-4xl font-extrabold text-[#63807B]">0</div>
          <div className="mt-1 font-semibold text-[#2C3830]">Reports recorded</div>
          <p className="mt-3 max-w-2xl text-sm text-[#7D9185]">There is currently no reports/disputes table in the SRM Connect database schema. The previous entries on this screen were mock data and have been removed. When a reporting model is added, this panel should read that table directly.</p>
        </div>}
    </div>
  </AdminShell>;
}
function ErrorCard({message}:{message:string}) { return <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{message}</div>; }
