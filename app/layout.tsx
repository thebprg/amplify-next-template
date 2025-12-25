import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./app.css";

import AuthProvider from "./components/AuthProvider";
import "@aws-amplify/ui-react/styles.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    template: '%s | Qupeg URL Shortener',
    default: 'Qupeg | Free URL Shortener & QR Code Generator',
  },
  description: "Shorten long URLs, generate QR codes, and track clicks with Qupeg. Simple, fast, and secure link management.",
  openGraph: {
    title: 'Qupeg | Free URL Shortener',
    description: 'Shorten links and generate QR codes instantly.',
    type: 'website',
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Qupeg",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport = {
  themeColor: "#0f766e",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
