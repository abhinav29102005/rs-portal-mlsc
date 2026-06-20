import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TIET Research & Mentor Portal",
  description:
    "Connect with faculty for research, mentorship, and collaborative projects at Thapar Institute of Engineering and Technology, Patiala.",
  keywords: [
    "TIET",
    "Thapar",
    "research",
    "mentorship",
    "faculty",
    "student",
    "portal",
    "collaboration",
  ],
};

import { ThemeProvider } from "@/components/ThemeProvider";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
