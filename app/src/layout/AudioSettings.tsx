"use client";

import { useEffect, useState, createContext, useContext, type ReactNode } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { UncontrolledSliderField } from "@/layout/SliderField";
import { useAudio } from "@/hooks/useAudio";
import { useIframeMute } from "@/hooks/useIframeMute";
import { api } from "@/app/_trpc/client";
import { showMutationToast } from "@/libs/toast";
import {
  MUSIC_SHADOW_OF_THE_BLADE,
  MUSIC_WELCOME_TO_SEICHI,
  MUSIC_SHINE_THEME,
  MUSIC_TSUKIMORI_THEME,
  MUSIC_CURRENT_THEME,
  MUSIC_SYNDICATE_THEME,
} from "@/drizzle/constants";
import { useAbVariant } from "@/hooks/useAbVariant";
import type { UserWithRelations } from "@/routers/profile";

interface AudioSettingsProps {
  userData?: UserWithRelations | null;
  updateUser?: (data: Partial<UserWithRelations>) => Promise<void>;
}

/**
 * Audio context value containing the singleton audio controls
 */
interface AudioContextValue {
  audioEnabled: boolean;
  setAudioEnabled: (enabled: boolean) => Promise<void>;
  requiresInteraction: boolean;
}

/**
 * Global context for sharing audio instance across all components
 */
const AudioContext = createContext<AudioContextValue | null>(null);

/**
 * Provider that creates and manages the singleton audio instance
 */
export const GlobalAudioProvider: React.FC<{
  children: ReactNode;
  userData?: UserWithRelations | null;
}> = ({ children, userData }) => {
  // Mount flag to keep SSR/CSR output in sync
  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Get initial audio preference from user data or localStorage
  const getInitialMusicState = (): boolean => {
    if (userData) return userData.musicOn;
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("musicOn");
      if (saved !== null) return JSON.parse(saved) as boolean;
    }
    return true;
  };

  // AB-testing for music source
  const { variant: musicVariant } = useAbVariant("ab_music_welcome_to_seichi");
  let musicSrc = MUSIC_SHADOW_OF_THE_BLADE;
  if (musicVariant === "treatment") {
    if (userData?.village?.name === "Tsukimori") {
      musicSrc = MUSIC_TSUKIMORI_THEME;
    } else if (userData?.village?.name === "Shine") {
      musicSrc = MUSIC_SHINE_THEME;
    } else if (userData?.village?.name === "Current") {
      musicSrc = MUSIC_CURRENT_THEME;
    } else if (userData?.village?.name === "Syndicate") {
      musicSrc = MUSIC_SYNDICATE_THEME;
    } else {
      musicSrc = MUSIC_WELCOME_TO_SEICHI;
    }
  }

  // Initialize the single audio instance
  const {
    requiresInteraction,
    enabled: audioEnabled,
    setEnabled: setAudioEnabled,
  } = useAudio({
    src: musicSrc,
    loop: true,
    volume: 0.5,
    preload: "metadata",
    enabled: isClient ? getInitialMusicState() : false,
    autoPlay: isClient,
  });

  // Sync with user data changes
  useEffect(() => {
    if (!isClient) return;
    if (userData) {
      void setAudioEnabled(!!userData.musicOn);
    } else {
      void setAudioEnabled(getInitialMusicState());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isClient, userData]);

  const contextValue: AudioContextValue = {
    audioEnabled,
    setAudioEnabled,
    requiresInteraction,
  };

  return <AudioContext.Provider value={contextValue}>{children}</AudioContext.Provider>;
};

/**
 * Hook to access the global audio instance
 */
const useGlobalAudio = () => {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error("useGlobalAudio must be used within GlobalAudioProvider");
  }
  return context;
};

/**
 * Hook to manage all audio-related state and logic
 * Now uses the global audio instance instead of creating its own
 */
const useAudioSettings = (userData?: UserWithRelations | null) => {
  // Use the global audio instance
  const { audioEnabled, setAudioEnabled, requiresInteraction } = useGlobalAudio();

  // Mount flag to keep SSR/CSR output in sync
  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);

  // SFX preference state
  const getInitialSfxState = (): boolean => {
    if (userData && typeof userData.sfxOn === "boolean") return userData.sfxOn;
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("sfxOn");
      if (saved !== null) return JSON.parse(saved) as boolean;
    }
    return true;
  };
  const [sfxOn, setSfxOn] = useState<boolean>(() =>
    isClient ? getInitialSfxState() : true,
  );

  // SFX volume state
  const getInitialSfxVolumeState = (): number => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("sfxVolume");
      if (saved !== null) return JSON.parse(saved) as number;
    }
    return 0.8;
  };
  const [sfxVolume, setSfxVolume] = useState<number>(() =>
    isClient ? getInitialSfxVolumeState() : 0.8,
  );

  // Embedded iframe mute state
  const { isIframesMuted, setIframesMuted } = useIframeMute();

  // Sync SFX with user data changes
  useEffect(() => {
    if (!isClient) return;
    if (userData) {
      setSfxOn(!!userData.sfxOn);
    } else {
      setSfxOn(getInitialSfxState());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isClient, userData]);

  // Update preferences mutation
  const { mutate: updatePreferences } = api.profile.updatePreferences.useMutation({
    onSuccess: async (result) => {
      if (!result.success) {
        showMutationToast(result);
      }
    },
  });

  return {
    audioEnabled,
    setAudioEnabled,
    sfxOn,
    setSfxOn,
    sfxVolume,
    setSfxVolume,
    isIframesMuted,
    setIframesMuted,
    requiresInteraction,
    updatePreferences,
  };
};

/**
 * Audio settings panel component (for use in tabs, settings pages, etc.)
 */
export const AudioSettingsPanel: React.FC<AudioSettingsProps> = ({
  userData,
  updateUser,
}) => {
  const {
    audioEnabled,
    setAudioEnabled,
    sfxOn,
    setSfxOn,
    sfxVolume,
    setSfxVolume,
    isIframesMuted,
    setIframesMuted,
    requiresInteraction,
    updatePreferences,
  } = useAudioSettings(userData);

  return (
    <div className="space-y-4 p-4">
      <div>
        <p className="font-medium mb-3">Music</p>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm">Background soundtrack</p>
            <p className="text-xs text-muted-foreground">
              {audioEnabled ? "Playing" : "Paused"}
            </p>
          </div>
          <Switch
            checked={!!audioEnabled}
            onCheckedChange={async (checked) => {
              await setAudioEnabled(checked);
              if (userData) {
                updatePreferences({
                  preferredStat: userData.preferredStat ?? null,
                  preferredGeneral1: userData.preferredGeneral1 ?? null,
                  preferredGeneral2: userData.preferredGeneral2 ?? null,
                  musicOn: checked,
                });
                if (updateUser) {
                  await updateUser({ musicOn: checked });
                }
              } else if (typeof window !== "undefined") {
                localStorage.setItem("musicOn", JSON.stringify(checked));
              }
            }}
            aria-label="Toggle music"
          />
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <p className="text-sm">Nindo Audio</p>
            <p className="text-xs text-muted-foreground">
              Embedded iframe audio control
            </p>
          </div>
          <Switch
            checked={!isIframesMuted}
            onCheckedChange={(checked) => {
              setIframesMuted(!checked);
            }}
            aria-label="Toggle embedded iframe audio"
          />
        </div>
      </div>

      <div>
        <p className="font-medium mb-3">Sound effects</p>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm">Combat SFX</p>
            <p className="text-xs text-muted-foreground">
              {sfxOn ? "Enabled" : "Disabled"}
            </p>
          </div>
          <Switch
            checked={!!sfxOn}
            onCheckedChange={(checked) => {
              setSfxOn(checked);
              if (userData) {
                updatePreferences({
                  preferredStat: userData.preferredStat ?? null,
                  preferredGeneral1: userData.preferredGeneral1 ?? null,
                  preferredGeneral2: userData.preferredGeneral2 ?? null,
                  sfxOn: checked,
                });
                if (updateUser) {
                  void updateUser({ sfxOn: checked });
                }
              } else if (typeof window !== "undefined") {
                localStorage.setItem("sfxOn", JSON.stringify(checked));
              }
            }}
            aria-label="Toggle sound effects"
          />
        </div>
      </div>

      {sfxOn && (
        <div className="space-y-2">
          <div>
            <p className="text-sm">SFX Volume</p>
            <p className="text-xs text-muted-foreground">
              Current volume: {Math.round(sfxVolume * 100)}%
            </p>
          </div>
          <UncontrolledSliderField
            id="sfxVolume"
            label=""
            value={Math.round(sfxVolume * 100)}
            min={0}
            max={100}
            setValue={(nextValue: React.SetStateAction<number>) => {
              let percent: number;
              if (typeof nextValue === "function") {
                percent = nextValue(Math.round(sfxVolume * 100));
              } else {
                percent = nextValue;
              }
              const safePercent = Math.min(100, Math.max(0, percent));
              const newVolume = safePercent / 100;
              setSfxVolume(newVolume);
              if (typeof window !== "undefined") {
                localStorage.setItem("sfxVolume", JSON.stringify(newVolume));
              }
            }}
          />
        </div>
      )}

      {requiresInteraction && audioEnabled && (
        <p className="text-xs text-muted-foreground italic">
          Audio requires interaction on this browser; click anywhere to start
        </p>
      )}
    </div>
  );
};

/**
 * Audio settings popover button (for use in navbar/header)
 */
export const AudioSettingsPopover: React.FC<AudioSettingsProps> = ({
  userData,
  updateUser,
}) => {
  const {
    audioEnabled,
    setAudioEnabled,
    sfxOn,
    setSfxOn,
    sfxVolume,
    setSfxVolume,
    isIframesMuted,
    setIframesMuted,
    requiresInteraction,
    updatePreferences,
  } = useAudioSettings(userData);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          aria-label="Audio settings"
          className="rounded-full mx-1 hover:text-black hover:bg-blue-300 text-slate-700 bg-blue-100 bg-opacity-80"
        >
          {audioEnabled ? (
            <Volume2 className="h-6 w-6 xl:h-7 xl:w-7 p-1" suppressHydrationWarning />
          ) : (
            <VolumeX className="h-6 w-6 xl:h-7 xl:w-7 p-1" suppressHydrationWarning />
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-72" sideOffset={8}>
        <div className="space-y-3">
          <p className="font-medium">Music</p>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Background soundtrack</p>
            </div>
            <Switch
              checked={!!audioEnabled}
              onCheckedChange={async (checked) => {
                await setAudioEnabled(checked);
                if (userData) {
                  updatePreferences({
                    preferredStat: userData.preferredStat ?? null,
                    preferredGeneral1: userData.preferredGeneral1 ?? null,
                    preferredGeneral2: userData.preferredGeneral2 ?? null,
                    musicOn: checked,
                  });
                  if (updateUser) {
                    await updateUser({ musicOn: checked });
                  }
                } else if (typeof window !== "undefined") {
                  localStorage.setItem("musicOn", JSON.stringify(checked));
                }
              }}
              aria-label="Toggle music"
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <p className="text-xs text-muted-foreground">Nindo Audio</p>
            </div>
            <Switch
              checked={!isIframesMuted}
              onCheckedChange={(checked) => {
                setIframesMuted(!checked);
              }}
              aria-label="Toggle embedded iframe audio"
            />
          </div>
          <p className="font-medium">Sound effects</p>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Combat SFX</p>
            </div>
            <Switch
              checked={!!sfxOn}
              onCheckedChange={(checked) => {
                setSfxOn(checked);
                if (userData) {
                  updatePreferences({
                    preferredStat: userData.preferredStat ?? null,
                    preferredGeneral1: userData.preferredGeneral1 ?? null,
                    preferredGeneral2: userData.preferredGeneral2 ?? null,
                    sfxOn: checked,
                  });
                  if (updateUser) {
                    void updateUser({ sfxOn: checked });
                  }
                } else if (typeof window !== "undefined") {
                  localStorage.setItem("sfxOn", JSON.stringify(checked));
                }
              }}
              aria-label="Toggle sound effects"
            />
          </div>
          {sfxOn && (
            <div className="space-y-2">
              <div>
                <p className="text-xs text-muted-foreground">
                  SFX Volume ({Math.round(sfxVolume * 100)}%)
                </p>
              </div>
              <UncontrolledSliderField
                id="sfxVolume"
                label=""
                value={Math.round(sfxVolume * 100)}
                min={0}
                max={100}
                setValue={(nextValue: React.SetStateAction<number>) => {
                  let percent: number;
                  if (typeof nextValue === "function") {
                    percent = nextValue(Math.round(sfxVolume * 100));
                  } else {
                    percent = nextValue;
                  }
                  const safePercent = Math.min(100, Math.max(0, percent));
                  const newVolume = safePercent / 100;
                  setSfxVolume(newVolume);
                  if (typeof window !== "undefined") {
                    localStorage.setItem("sfxVolume", JSON.stringify(newVolume));
                  }
                }}
              />
            </div>
          )}
          {requiresInteraction && audioEnabled && (
            <p className="text-[10px] text-muted-foreground">
              Audio requires interaction on this browser; click anywhere to start
            </p>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};
