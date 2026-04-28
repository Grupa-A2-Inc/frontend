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

    function handleSessionExpired() {
      dispatch(logout());
      router.push("/login");
    }

    window.addEventListener(SESSION_EXPIRED_EVENT, handleSessionExpired);
    return () => window.removeEventListener(SESSION_EXPIRED_EVENT, handleSessionExpired);
  }, []);

  return null;
}
