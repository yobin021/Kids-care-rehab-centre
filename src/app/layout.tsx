import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Kids Care Rehab Centre - Admin Dashboard",
  description: "Pediatric Rehabilitation Management System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-slate-50/50 text-slate-800 font-sans">
        {children}
      </body>
    </html>
  );
}

