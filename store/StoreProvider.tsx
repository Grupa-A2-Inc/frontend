"use client";

import { useRef } from "react";
import { Provider } from "react-redux";
import { store } from "@/store/index";

// Expune Redux Store catre intreaga aplicatie
export default function StoreProvider({ children }: { children: React.ReactNode }) {
  const storeRef = useRef(store);

  return <Provider store={storeRef.current}>{children}</Provider>;
}
