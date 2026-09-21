"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2 } from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export default function VerifiedPage() {
  const router = useRouter();
  const [message, setMessage] = useState("Finishing email verification…");

  useEffect(() => {
    let cancelled = false;

    const finish = async () => {
      const supabase = getSupabaseBrowserClient();

      // Supabase may deliver the confirmed session in the URL/hash. Give the client
      // a moment to persist it, but do not require a session merely to show success.
      await supabase.auth.getSession();

      if (cancelled) return;
      setMessage("Email verified. Returning you to SRM Connect…");
      window.setTimeout(() => {
        if (!cancelled) router.replace("/role-select");
      }, 900);
    };

    void finish();
    return () => {
      cancelled = true;
    };
  }, [router]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F5F4EF] px-6">
      <div className="w-full max-w-md rounded-3xl border border-[#C7CAB6] bg-white p-8 text-center shadow-sm">
        <CheckCircle2 className="mx-auto h-12 w-12 text-[#63807B]" />
        <h1 className="mt-4 font-['Playfair_Display'] text-3xl font-bold text-[#2C3830]">
          Verification complete
        </h1>
        <div className="mt-4 flex items-center justify-center gap-2 text-sm text-[#4A5E58]">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>{message}</span>
        </div>
      </div>
    </main>
  );
}
