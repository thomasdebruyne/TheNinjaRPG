"use client";

import { useEffect, useState } from "react";

export default function PWAManager() {
  const [isSupported, setIsSupported] = useState(false);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(
    null,
  );

  console.log(`PWAManager state: ${isSupported} - ${registration?.active?.state}`);

  useEffect(() => {
    // Check if service workers are supported
    if ("serviceWorker" in navigator) {
      setIsSupported(true);

      // Register service worker
      void registerServiceWorker();
    }
  }, []);

  const registerServiceWorker = async () => {
    try {
      const reg = await navigator.serviceWorker.register("/sw.js", {
        scope: "/",
      });

      setRegistration(reg);

      console.log("Service Worker registered successfully:", reg);

      // Listen for updates
      reg.addEventListener("updatefound", () => {
        const newWorker = reg.installing;
        if (newWorker) {
          newWorker.addEventListener("statechange", () => {
            if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
              // New update available
              console.log("New version available! Please refresh.");
            }
          });
        }
      });
    } catch (error) {
      console.error("Service Worker registration failed:", error);
    }
  };

  // This component doesn't render anything, it just manages PWA functionality
  return null;
}
