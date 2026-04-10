"use client";

import { useEffect } from "react";
import { useAppDispatch } from "@/store/hooks";
import { loadUserFromStorage } from "@/store/slices/authSlice";

export default function AutoLogin() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(loadUserFromStorage());
  }, []);

  return null;
}