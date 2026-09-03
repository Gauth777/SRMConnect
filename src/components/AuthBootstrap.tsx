"use client";

import { useEffect } from "react";
import {
  getSupabaseBrowserClient,
  hasSupabaseBrowserConfig,
} from "@/lib/supabase/client";

export function AuthBootstrap() {
  useEffect(() => {
    if (!hasSupabaseBrowserConfig()) return;

    const supabase = getSupabaseBrowserClient();
    void supabase.auth.getSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT" || !session) {
        localStorage.removeItem("campusconnect_user");
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return null;
}
