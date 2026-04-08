"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function AppViewWrapper({ children }: { children: React.ReactNode }) {
  const searchParams = useSearchParams();
  const [isApp, setIsApp] = useState(false);

  useEffect(() => {
    // Detect isApp from search params or custom header/user agent
    const appParam = searchParams.get("isApp");
    if (appParam === "true") {
      setIsApp(true);
      // Add a global class to body for CSS targeting if needed
      document.body.classList.add("is-app-mode");
    } else {
      setIsApp(false);
      document.body.classList.remove("is-app-mode");
    }
  }, [searchParams]);

  if (!isApp) return <>{children}</>;

  return (
    <div className="is-app-view w-full min-h-screen bg-white">
      <style jsx global>{`
        .is-app-mode nav, 
        .is-app-mode aside, 
        .is-app-mode header,
        .is-app-mode footer {
          display: none !important;
        }
        .is-app-mode .ml-0,
        .is-app-mode .md\\:ml-72 {
          margin-left: 0 !important;
        }
        .is-app-mode main {
          padding: 1rem !important;
          margin-top: 0 !important;
        }
      `}</style>
      {children}
    </div>
  );
}
