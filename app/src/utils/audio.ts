/**
 * Audio utility functions for handling browser compatibility and user interactions
 */

/**
 * Detect if the current browser is Safari or iOS
 */
export const isSafariOrIOS = (): boolean => {
  if (typeof window === "undefined") return false;

  const userAgent = window.navigator.userAgent;
  const isSafari = /^((?!chrome|android).)*safari/i.test(userAgent);
  const isIOS = /iPad|iPhone|iPod/.test(userAgent);

  return isSafari || isIOS;
};

/**
 * Detect if the current browser is mobile
 */
export const isMobile = (): boolean => {
  if (typeof window === "undefined") return false;

  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    window.navigator.userAgent,
  );
};

/**
 * Test if autoplay is supported in the current browser
 */
export const testAutoplaySupport = async (): Promise<boolean> => {
  if (typeof window === "undefined") return false;

  // Create a silent test audio element
  const audio = new Audio();
  audio.volume = 0;
  audio.muted = true;

  try {
    await audio.play();
    audio.pause();
    return true;
  } catch {
    return false;
  }
};

/**
 * Check if user interaction has occurred (needed for audio playback on some browsers)
 */
export const hasUserInteracted = (): boolean => {
  if (typeof window === "undefined") return false;

  // Check if we've stored user interaction flag
  return sessionStorage.getItem("userInteracted") === "true";
};

/**
 * Mark that user interaction has occurred
 */
export const markUserInteraction = (): void => {
  if (typeof window === "undefined") return;

  sessionStorage.setItem("userInteracted", "true");
};

/**
 * Add event listeners to detect user interaction
 */
export const addUserInteractionListeners = (callback?: () => void): (() => void) => {
  if (typeof window === "undefined") return () => {};

  const events = ["click", "touchstart", "keydown"];

  const handleInteraction = () => {
    markUserInteraction();
    if (callback) callback();

    // Remove listeners after first interaction
    events.forEach((event) => {
      document.removeEventListener(event, handleInteraction);
    });
  };

  events.forEach((event) => {
    document.addEventListener(event, handleInteraction, { once: true });
  });

  // Return cleanup function
  return () => {
    events.forEach((event) => {
      document.removeEventListener(event, handleInteraction);
    });
  };
};

/**
 * Get audio-specific error messages for better user feedback
 */
export const getAudioErrorMessage = (error: unknown): string => {
  if (error instanceof DOMException) {
    switch (error.name) {
      case "NotAllowedError":
        return "Audio playback requires user interaction. Please click anywhere to enable audio.";
      case "NotSupportedError":
        return "Audio format not supported by your browser.";
      case "AbortError":
        return "Audio playback was interrupted.";
      case "NetworkError":
        return "Network error while loading audio.";
      default:
        return "An error occurred while playing audio.";
    }
  }

  if (typeof error === "string") {
    return error;
  }

  return "Unknown audio error occurred.";
};

/**
 * Create an audio context for better browser compatibility
 * This helps with iOS Safari audio issues
 */
export const createAudioContext = (): AudioContext | null => {
  if (typeof window === "undefined") return null;

  try {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    return new AudioContextClass();
  } catch (error) {
    console.warn("AudioContext not supported:", error);
    return null;
  }
};

/**
 * Resume audio context if it's suspended (common on iOS)
 */
export const resumeAudioContext = async (
  audioContext: AudioContext,
): Promise<boolean> => {
  if (!audioContext) return false;

  try {
    if (audioContext.state === "suspended") {
      await audioContext.resume();
    }
    return audioContext.state === "running";
  } catch (error) {
    console.error("Failed to resume audio context:", error);
    return false;
  }
};
