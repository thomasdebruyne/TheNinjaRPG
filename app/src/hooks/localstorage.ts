"use client";

import { useCallback, useEffect, useState } from "react";

export const useLocalStorage = <T>(
  key: string,
  initialValue: T,
  checkUrlAnchor = false,
): [T, (newValue: T) => void] => {
  // Get value from URL anchor if present and enabled
  const getAnchorValue = (): T | null => {
    if (typeof window !== "undefined" && checkUrlAnchor) {
      const hash = window.location.hash;
      if (hash) {
        // Remove the # and decode the URL component
        const decodedAnchor = decodeURIComponent(hash.substring(1));
        if (decodedAnchor) {
          return decodedAnchor as unknown as T;
        }
      }
    }
    return null;
  };

  // Get the initial value from local storage or URL anchor
  const getInitialValue = () => {
    // First check for URL anchor if enabled
    const anchorValue = getAnchorValue();
    if (anchorValue !== null) {
      return anchorValue;
    }

    // Fall back to local storage
    if (typeof window !== "undefined" && localStorage) {
      const storedValue = localStorage.getItem(key);
      if (storedValue && storedValue !== "undefined") {
        return JSON.parse(storedValue) as T;
      }
    }

    return initialValue;
  };

  // Set the initial value
  const [value, setValue] = useState<T>(getInitialValue);

  // Listen for URL anchor changes (initial value already handled by lazy initialization)
  useEffect(() => {
    if (checkUrlAnchor) {
      const handleHashChange = () => {
        const anchorValue = getAnchorValue();
        if (anchorValue !== null) {
          setValue(anchorValue);
        }
      };

      // Listen for hash changes - event handlers are fine, initial value handled by getInitialValue
      window.addEventListener("hashchange", handleHashChange);
      return () => {
        window.removeEventListener("hashchange", handleHashChange);
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checkUrlAnchor]);

  // Update the local storage when the value changes
  useEffect(() => {
    if (typeof window !== "undefined" && localStorage) {
      localStorage.setItem(key, JSON.stringify(value));
    }
  }, [key, value]);

  // When calling the setValue function, remove the URL anchor
  // Memoized to prevent unnecessary re-renders when passed as prop
  const setValueWithoutAnchor = useCallback((newValue: T) => {
    setValue(newValue);
    if (typeof window !== "undefined") {
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

  // Return the value and the setValueWithoutAnchor function
  return [value, setValueWithoutAnchor];
};
