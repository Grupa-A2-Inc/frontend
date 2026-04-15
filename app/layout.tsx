"use client";

import "./globals.css";
import StoreProvider from "@/store/StoreProvider";
import { ThemeProvider } from "@/components/ThemeProvider";
import AutoLogin from "./AutoLogin";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@600;700;800;900&family=Fira+Code:wght@400;500;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" rel="stylesheet" />
      </head>
      <body className="bg-brand-bg text-brand-text antialiased">
        <StoreProvider>
          <AutoLogin />
          <ThemeProvider>
            {children}
          </ThemeProvider>
        </StoreProvider>
      </body>
    </html>
  );
}