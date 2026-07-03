import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SyncManager } from "@/components/SyncManager";
import UpdatePrompt from "@/components/dashboard/UpdatePrompt";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: "#00a1e4",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: "DSSI Connect - Layanan Chiller Daikin Indonesia",
  description: "Platform resmi operasional dan pelayanan Daikin Chiller Indonesia. Kami menyediakan layanan maintenance chiller, perbaikan, instalasi, dan value engineering terbaik untuk sistem tata udara (HVAC) skala industri dan komersial.",
  keywords: ["Daikin Indonesia", "Daikin Chiller", "Service Chiller", "Maintenance Chiller", "Value Engineering Services", "DSSI Connect", "HVAC Indonesia"],
  authors: [{ name: "Daikin Applied Solutions Indonesia" }],
  openGraph: {
    title: "DSSI Connect - Layanan Chiller Daikin Indonesia",
    description: "Platform resmi pelayanan operasional dan pemeliharaan chiller dari Daikin Applied Solutions Indonesia.",
    url: "https://dconnect.id",
    siteName: "DSSI Connect",
    images: [
      {
        url: "https://dconnect.id/favicon.png",
        width: 800,
        height: 600,
      },
    ],
    locale: "id_ID",
    type: "website",
  },
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.png",
    apple: "/favicon.png",
  },
  formatDetection: {
    telephone: false,
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "D2 Connect",
  },
  verification: {
    google: "rg5f8uFSdDy7-X29_ZCn8Vs1sLfKEeCo4UuBjBmOqgE",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "HVACBusiness",
              "name": "Daikin Applied Solutions Indonesia (DSSI)",
              "url": "https://dconnect.id",
              "logo": "https://dconnect.id/favicon.png",
              "image": "https://dconnect.id/favicon.png",
              "description": "Layanan operasional, perawatan (maintenance), dan perbaikan Chiller komersial maupun industri dari Daikin Indonesia.",
              "telephone": "+62-21-29337000",
              "address": {
                "@type": "PostalAddress",
                "addressLocality": "Jakarta",
                "addressCountry": "ID"
              },
              "areaServed": "Indonesia",
              "makesOffer": [
                {
                  "@type": "Offer",
                  "itemOffered": {
                    "@type": "Service",
                    "name": "Service Chiller"
                  }
                },
                {
                  "@type": "Offer",
                  "itemOffered": {
                    "@type": "Service",
                    "name": "Maintenance Chiller"
                  }
                }
              ]
            })
          }}
        />
        {children}
        <SyncManager />
        <UpdatePrompt />
        
      </body>
    </html>
  );
}
