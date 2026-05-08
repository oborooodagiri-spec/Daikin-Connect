import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SyncManager } from "@/components/SyncManager";
import UpdatePrompt from "@/components/dashboard/UpdatePrompt";
import Script from "next/script";
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
  title: "EPL Connect - Daikin",
  description: "Daikin Connect - Value Engineering Services",
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
        {children}
        <SyncManager />
        <UpdatePrompt />
        <Script 
          src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit" 
          strategy="beforeInteractive" 
        />
        <Script id="turnstile-init" strategy="afterInteractive">
          {`
            console.log("Turnstile Init Script Running");
            window.renderTurnstile = () => {
              if (window.turnstile) {
                const elements = document.querySelectorAll('.cf-turnstile:not([data-rendered])');
                elements.forEach(el => {
                  const sitekey = el.getAttribute('data-sitekey');
                  console.log("Found turnstile element, rendering with key:", sitekey);
                  try {
                    window.turnstile.render(el, {
                      sitekey: sitekey,
                      theme: 'light',
                    });
                    el.setAttribute('data-rendered', 'true');
                  } catch(e) { console.error("Turnstile render error:", e); }
                });
              } else {
                console.warn("window.turnstile not found yet...");
              }
            };
            setInterval(window.renderTurnstile, 1000);
          `}
        </Script>
      </body>
    </html>
  );
}
