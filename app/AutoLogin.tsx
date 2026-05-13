"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch } from "@/store/hooks";
import { useLogoutMutation } from "@/store/api/authApi";
import { getPersistedAuthSession } from "@/lib/auth/session";
import { setSession } from "@/store/slices/authSlice";
import { SESSION_EXPIRED_EVENT } from "@/lib/fetchWithAuth";

export default function AutoLogin() {
  const dispatch = useAppDispatch();
  const router   = useRouter();
  const [logout] = useLogoutMutation();

  useEffect(() => {
    const session = getPersistedAuthSession();
    if (session) dispatch(setSession(session));

    async function handleSessionExpired() {
      const token = localStorage.getItem("accessToken") ?? "";
      await logout(token).unwrap().catch(() => undefined);
      router.push("/login");
    }

    window.addEventListener(SESSION_EXPIRED_EVENT, handleSessionExpired);
    return () => window.removeEventListener(SESSION_EXPIRED_EVENT, handleSessionExpired);
  }, [dispatch, logout, router]);

  return null;
}
