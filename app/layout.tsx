import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CMC Corporate Outreach Dashboard",
  description: "Mentor-facing monitoring dashboard for CMC corporate outreach, backed by Google Sheets.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="font-sans">{children}</body>
    </html>
  );
}
