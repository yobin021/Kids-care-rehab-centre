import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-plus-jakarta",
  display: "swap"
});

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
    <html lang="en" className={plusJakarta.variable}>
      <body className="antialiased bg-slate-50/50 text-slate-800 font-sans">
        {children}
      </body>
    </html>
  );
}
