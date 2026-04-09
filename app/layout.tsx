import type { Metadata } from "next";
import "./globals.css";

// Importăm StoreProvider-ul creat anterior.
// Acesta este un component client care învelește aplicația în Redux Provider.
import { StoreProvider } from "@/store/StoreProvider";

export const metadata: Metadata = {
  title: "My App",
  description: "Authentication system with Redux Toolkit"
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {/* StoreProvider activează Redux în întreaga aplicație */}
        <StoreProvider>
          {children}
        </StoreProvider>
      </body>
    </html>
  );
}