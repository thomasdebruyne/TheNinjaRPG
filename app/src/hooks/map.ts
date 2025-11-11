import { useEffect } from "react";
import type { GlobalMapData } from "@/libs/threejs/types";
import { fetchMap } from "@/libs/threejs/globe";

export const useMap = (
  setGlobe: React.Dispatch<React.SetStateAction<GlobalMapData | null>>,
) => {
  useEffect(() => {
    let cancelled = false;
    void fetchMap().then((data) => {
      if (!cancelled) setGlobe(data);
    });
    return () => {
      cancelled = true; // guard against state‑update after unmount
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
};
