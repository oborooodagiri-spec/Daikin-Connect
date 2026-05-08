"use client";

import { useEffect } from "react";

/**
 * SessionGuardian Component
 * Detects browser/tab close and sends a "Beacon" signal to the server.
 * This allows for highly accurate session duration tracking even without explicit logout.
 */
export default function SessionGuardian() {
  useEffect(() => {
    const handleExit = () => {
      // Use Beacon API for non-blocking end-of-life request
      // This is the standard way to signal tab closure
      if (typeof navigator !== "undefined" && navigator.sendBeacon) {
        navigator.sendBeacon("/api/v1/security/beacon", JSON.stringify({ event: 'exit' }));
      }
    };

    // Also handle visibility change (mobile browsers, etc.)
    const handleVisibility = () => {
      if (document.visibilityState === 'hidden') {
        // Option to send a minor "Pause" signal if needed
      }
    };

    window.addEventListener("beforeunload", handleExit);
    window.addEventListener("visibilitychange", handleVisibility);

    return () => {
      window.removeEventListener("beforeunload", handleExit);
      window.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  return null; // Invisible protector
}
