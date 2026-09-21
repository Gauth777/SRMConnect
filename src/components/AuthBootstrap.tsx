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
    let active = true;

    const validateCurrentUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        localStorage.removeItem("campusconnect_user");
        return;
      }

      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (!active) return;

      if (error || !user) {
        localStorage.removeItem("campusconnect_user");
        await supabase.auth.signOut({ scope: "local" });
      }
    };

    void validateCurrentUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT" || !session) {
        localStorage.removeItem("campusconnect_user");
      }
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  return null;
}
