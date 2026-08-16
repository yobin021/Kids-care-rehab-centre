import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "KIDS CARE 360",
  description: "Assess • Plan • Intervene • Track • Progress",
  icons: {
    icon: "/kids_care_rehab_center_logo.jpg",
    shortcut: "/kids_care_rehab_center_logo.jpg",
    apple: "/kids_care_rehab_center_logo.jpg"
  }
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

