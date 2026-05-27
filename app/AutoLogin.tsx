"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch } from "@/store/hooks";
import { loadUserFromStorage, logout, setAccessToken } from "@/store/slices/authSlice";
import {
  ACCESS_TOKEN_REFRESHED_EVENT,
  SESSION_EXPIRED_EVENT,
} from "@/lib/fetchWithAuth";

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

    function handleAccessTokenRefreshed(event: Event) {
      const accessToken = (event as CustomEvent<{ accessToken?: string }>).detail
        ?.accessToken;

      if (accessToken) {
        dispatch(setAccessToken(accessToken));
      }
    }

    window.addEventListener(SESSION_EXPIRED_EVENT, handleSessionExpired);
    window.addEventListener(ACCESS_TOKEN_REFRESHED_EVENT, handleAccessTokenRefreshed);
    return () => {
      window.removeEventListener(SESSION_EXPIRED_EVENT, handleSessionExpired);
      window.removeEventListener(
        ACCESS_TOKEN_REFRESHED_EVENT,
        handleAccessTokenRefreshed,
      );
    };
  }, [dispatch, router]);

  return null;
}
