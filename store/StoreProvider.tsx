"use client";

import { useRef } from "react";
import { Provider } from "react-redux";
import { store } from "@/store/index";

export default function StoreProvider({ children }: { children: React.ReactNode }) {
  // useRef ensures the store is created only once per component lifetime,
  // even in React Strict Mode (which mounts components twice in development).
  const storeRef = useRef(store);

  return <Provider store={storeRef.current}>{children}</Provider>;
}
