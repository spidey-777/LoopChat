import type { Metadata } from "next";
import "./globals.css";
import { AppProvider } from "@/context/appContext";
import { SocketProvider } from "@/context/socketConnection";

export const metadata: Metadata = {
  title: "LoopChat",
  description: "Generated to chat",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white text-black antialiased">
        <AppProvider><SocketProvider>{children}</SocketProvider></AppProvider>
      </body>
    </html>
  );
}
