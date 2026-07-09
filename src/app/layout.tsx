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
  title: "Daikin Service Indonesia - DSSI Connect | Perawatan & Perbaikan Chiller",
  description: "DSSI Connect adalah platform layanan resmi dari Daikin Applied Solutions Indonesia. Pusat Service Daikin, perbaikan chiller, pemeliharaan (maintenance), instalasi HVAC, dan Value Engineering Services terpercaya di Indonesia.",
  keywords: ["Daikin Service Indonesia", "Service Daikin", "DSSI", "Daikin Applied Solutions Indonesia", "Daikin Indonesia", "Daikin Chiller", "Service Chiller", "Maintenance Chiller", "Value Engineering Services", "DSSI Connect", "HVAC Indonesia"],
  authors: [{ name: "Daikin Applied Solutions Indonesia" }],
  alternates: {
    canonical: "https://dconnect.id",
  },
  openGraph: {
    title: "Daikin Service Indonesia - DSSI Connect | Perawatan & Perbaikan Chiller",
    description: "Platform resmi pelayanan operasional, perbaikan, dan pemeliharaan chiller dari Daikin Applied Solutions Indonesia (DSSI).",
    url: "https://dconnect.id",
    siteName: "DSSI Connect - Daikin Service Indonesia",
    images: [
      {
        url: "https://dconnect.id/favicon.png",
        width: 800,
        height: 600,
        alt: "Logo Daikin Applied Solutions Indonesia",
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
    <html lang="id">
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
              "name": "Daikin Applied Solutions Indonesia (DSSI) - Service Chiller",
              "url": "https://dconnect.id",
              "logo": "https://dconnect.id/favicon.png",
              "image": "https://dconnect.id/favicon.png",
              "description": "Pusat Layanan resmi Service Daikin Indonesia. Kami menangani operasional, perawatan (maintenance), perbaikan Chiller komersial maupun industri.",
              "telephone": "+62-21-29337000",
              "address": {
                "@type": "PostalAddress",
                "streetAddress": "Jl. Opak No.33, Darmo, Wonokromo",
                "addressLocality": "Surabaya",
                "postalCode": "60241",
                "addressCountry": "ID"
              },
              "areaServed": "Indonesia",
              "sameAs": [
                "https://www.daikinapplied.com/",
                "https://www.daikin.co.id/"
              ],
              "makesOffer": [
                {
                  "@type": "Offer",
                  "itemOffered": {
                    "@type": "Service",
                    "name": "Service Daikin Chiller"
                  }
                },
                {
                  "@type": "Offer",
                  "itemOffered": {
                    "@type": "Service",
                    "name": "Maintenance Chiller"
                  }
                },
                {
                  "@type": "Offer",
                  "itemOffered": {
                    "@type": "Service",
                    "name": "Value Engineering Services"
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
