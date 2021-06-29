import { Howl } from "howler";
import React, { useEffect, useRef, useCallback, useMemo } from "react";

import { useStoreState } from "reducer/store";
import { SoundEffects, soundEffectList } from "utils/SoundEffectList";
import { prependCDN } from "utils/utilities";

export default function useSoundEffect(): [
  (soundEffect: SoundEffects) => void
] {
  const state = useStoreState();

  // Keeping state in ref as we can't access the store in peer js callbacks
  const stateRef = useRef(state);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  const soundEffects = useMemo(() => {
    return {
      0: new Howl({ src: prependCDN(soundEffectList[0].url), volume: 0.5 }),
      1: new Howl({ src: prependCDN(soundEffectList[1].url), volume: 0.5 }),
      2: new Howl({ src: prependCDN(soundEffectList[2].url), volume: 0.5 }),
      3: new Howl({ src: prependCDN(soundEffectList[3].url), volume: 0.5 }),
    };
  }, []);

  const playAudio = useCallback(
    (soundEffect: SoundEffects) => {
      const volume = stateRef.current.appSettings.volume;
      const soundEffectFile = soundEffects[soundEffect];

      // Only plays media if the game isn't muted
      // Prevents music from stopping on mobile devices
      if (volume > 0) {
        // Stops audio if it's currently playing, and plays it
        soundEffectFile.stop();
        soundEffectFile.play();
      }
    },
    [soundEffects]
  );

  return [playAudio];
}
