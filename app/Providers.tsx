"use client";

import AutoLogin from "./AutoLogin";
import { ThemeProvider } from "@/components/ThemeProvider";
import StoreProvider from "@/store/StoreProvider";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <StoreProvider>
      <AutoLogin />
      <ThemeProvider>{children}</ThemeProvider>
    </StoreProvider>
  );
}
