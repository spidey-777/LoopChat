import type { Metadata } from "next";
import "./globals.css";
import { AppProvider } from "@/context/appContext";

export const metadata: Metadata = {
  title: "LoopChat",
  description: "Generated to chat",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body><AppProvider>{children}</AppProvider></body>
    </html>
  );
}
