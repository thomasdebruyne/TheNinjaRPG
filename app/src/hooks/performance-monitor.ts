import { useEffect, useRef } from "react";
import type Stats from "stats.js";

/**
 * Custom hook for Three.js performance monitoring using Stats.js
 * Only active in development mode
 * Shows FPS, MS, and MB panels
 *
 * @param unbounded - If true, removes vsync limitation for performance testing (dev only)
 */
export const usePerformanceMonitor = (unbounded = false) => {
  const statsRef = useRef<{
    fps: Stats | null;
    ms: Stats | null;
    mb: Stats | null;
  }>({
    fps: null,
    ms: null,
    mb: null,
  });

  useEffect(() => {
    // Only load Stats.js in development mode
    if (process.env.NODE_ENV !== "development") {
      return;
    }

    // Dynamically import Stats.js only in development
    void import("stats.js").then((module) => {
      const Stats = module.default;

      // Create FPS panel
      const statsFps = new Stats();
      statsFps.showPanel(0); // FPS
      statsFps.dom.style.cssText = "position:fixed;top:0;left:0;z-index:10000";
      document.body.appendChild(statsFps.dom);
      statsRef.current.fps = statsFps;

      // Create MS panel
      const statsMs = new Stats();
      statsMs.showPanel(1); // MS
      statsMs.dom.style.cssText = "position:fixed;top:0;left:80px;z-index:10000";
      document.body.appendChild(statsMs.dom);
      statsRef.current.ms = statsMs;

      // Create MB panel
      const statsMb = new Stats();
      statsMb.showPanel(2); // MB
      statsMb.dom.style.cssText = "position:fixed;top:0;left:160px;z-index:10000";
      document.body.appendChild(statsMb.dom);
      statsRef.current.mb = statsMb;
    });

    // Cleanup on unmount
    return () => {
      if (statsRef.current.fps && document.body.contains(statsRef.current.fps.dom)) {
        document.body.removeChild(statsRef.current.fps.dom);
      }
      if (statsRef.current.ms && document.body.contains(statsRef.current.ms.dom)) {
        document.body.removeChild(statsRef.current.ms.dom);
      }
      if (statsRef.current.mb && document.body.contains(statsRef.current.mb.dom)) {
        document.body.removeChild(statsRef.current.mb.dom);
      }
      statsRef.current = { fps: null, ms: null, mb: null };
    };
  }, []);

  // Return functions to begin and end performance measurements
  const begin = () => {
    if (process.env.NODE_ENV !== "development") return;
    statsRef.current.fps?.begin();
    statsRef.current.ms?.begin();
    statsRef.current.mb?.begin();
  };

  const end = () => {
    if (process.env.NODE_ENV !== "development") return;
    statsRef.current.fps?.end();
    statsRef.current.ms?.end();
    statsRef.current.mb?.end();
  };

  // Return custom requestAnimationFrame that can be unbounded for performance testing
  const requestFrame = (callback: FrameRequestCallback) => {
    if (process.env.NODE_ENV === "development" && unbounded) {
      // Unbounded mode: run as fast as possible without vsync
      return setTimeout(() => callback(performance.now()), 0) as unknown as number;
    }
    // Normal mode: sync with display refresh rate
    return requestAnimationFrame(callback);
  };

  const cancelFrame = (id: number) => {
    if (process.env.NODE_ENV === "development" && unbounded) {
      clearTimeout(id);
    } else {
      cancelAnimationFrame(id);
    }
  };

  return { begin, end, requestFrame, cancelFrame, isUnbounded: unbounded };
};
