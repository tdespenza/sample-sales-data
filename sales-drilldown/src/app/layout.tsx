import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "@/styles/dashboard.css";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Pro Sales Dashboard" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-light">{children}</body>
    </html>
  );
}
