import type { Metadata, Viewport } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-inter",
  display: "swap"
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-poppins",
  display: "swap"
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#2563EB",
};

export const metadata: Metadata = {
  title: "KIDS CARE 360 — Neurodiversity Clinical System",
  description: "A comprehensive clinical management platform for neurodiverse children. Assess • Plan • Intervene • Track • Progress",
  keywords: ["kids care", "neurodiversity", "IEP", "therapy", "clinical", "rehab"],
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
    <html lang="en" className={`${inter.variable} ${poppins.variable}`}>
      <body className="antialiased" style={{ fontFamily: "var(--font-inter, 'Inter', system-ui, sans-serif)" }}>
        {children}
      </body>
    </html>
  );
}
