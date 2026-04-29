"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch } from "@/store/hooks";
import { loadUserFromStorage, logout } from "@/store/slices/authSlice";
import { SESSION_EXPIRED_EVENT } from "@/lib/fetchWithAuth";

export default function AutoLogin() {
  const dispatch = useAppDispatch();
  const router   = useRouter();

  useEffect(() => {
    dispatch(loadUserFromStorage());

    async function handleSessionExpired() {
      const token = localStorage.getItem("accessToken") ?? "";
      await dispatch(logout(token));
      router.push("/login");
    }

    window.addEventListener(SESSION_EXPIRED_EVENT, handleSessionExpired);
    return () => window.removeEventListener(SESSION_EXPIRED_EVENT, handleSessionExpired);
  }, []);

  return null;
}
