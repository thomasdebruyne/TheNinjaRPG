"use client";

import { Button } from "@/components/ui/button";
import { X, Download, Smartphone } from "lucide-react";
import { useTutorialStep } from "@/hooks/tutorial";
import { useInstallPrompt } from "@/hooks/useInstallPrompt";
import { useUserData } from "@/utils/UserContext";

export default function InstallPrompt() {
  const {
    isVisible,
    hidePrompt,
    dismissPromptLongTerm,
    deferredPrompt,
    isInstalled,
    isIOS,
    isMobile,
    isStandalone,
  } = useInstallPrompt();

  const { data: userData } = useUserData();

  // Tutorial mode
  const { currentStep } = useTutorialStep();

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    try {
      await deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;

      if (choiceResult.outcome === "accepted") {
        console.log("User accepted the install prompt");
      } else {
        console.log("User dismissed the install prompt");
      }

      hidePrompt();
    } catch (error) {
      console.error("Install prompt failed:", error);
    }
  };

  // Don't show if already installed, if user recently dismissed, or if not on mobile
  if (isStandalone || isInstalled || !isMobile) {
    return null;
  }

  if (typeof window !== "undefined" && localStorage && !isVisible) {
    // Check for long-term dismissal (60 days)
    const dismissedLongTime = localStorage.getItem("pwa-install-dismissed-long");
    if (
      dismissedLongTime &&
      Date.now() - parseInt(dismissedLongTime) < 60 * 24 * 60 * 60 * 1000
    ) {
      return null; // Don't show for 60 days after long-term dismissal
    }

    // Check for short-term dismissal (7 days)
    const dismissedTime = localStorage.getItem("pwa-install-dismissed");
    if (
      dismissedTime &&
      Date.now() - parseInt(dismissedTime) < 7 * 24 * 60 * 60 * 1000
    ) {
      return null; // Don't show for 7 days after dismissal
    }
  }

  if (!isVisible) return null;

  if (currentStep && userData) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-sm">
      <div className="rounded-lg bg-white p-4 shadow-lg border border-gray-200 dark:bg-gray-800 dark:border-gray-700">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center mb-2">
              <div className="text-2xl mr-2">🥷</div>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Install TheNinja-RPG
              </h3>
            </div>

            {isIOS ? (
              <div className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                <p className="mb-2">To install this app on your iOS device:</p>
                <ol className="list-decimal list-inside space-y-1 text-xs">
                  <li>
                    Tap the Share button <span className="font-mono">⬆️</span>
                  </li>
                  <li>Scroll down and tap &quot;Add to Home Screen&quot;</li>
                  <li>Tap &quot;Add&quot; to install</li>
                </ol>
              </div>
            ) : (
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                Install TheNinja-RPG on your device for a better gaming experience.
              </p>
            )}

            <div className="flex flex-col gap-2">
              {!isIOS && deferredPrompt && (
                <Button
                  onClick={handleInstallClick}
                  size="sm"
                  className="bg-orange-600 hover:bg-orange-700 text-white"
                >
                  <Download className="w-4 h-4 mr-1" />
                  Install App
                </Button>
              )}

              <div className="grid grid-cols-2 gap-2">
                <Button onClick={hidePrompt} variant="outline" size="sm">
                  Maybe Later
                </Button>
                <Button onClick={dismissPromptLongTerm} variant="ghost" size="sm">
                  No Thanks
                </Button>
              </div>
            </div>
          </div>

          <Button onClick={hidePrompt} variant="ghost" size="sm" className="p-1 h-auto">
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex items-center justify-center gap-4 mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
          <div className="flex items-center text-xs text-gray-500">
            <Smartphone className="w-3 h-3 mr-1" />
            Mobile Optimized
          </div>
        </div>
      </div>
    </div>
  );
}
