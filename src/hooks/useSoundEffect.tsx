// eslint-disable-next-line @typescript-eslint/no-unused-vars
import React, { useEffect, useState, useRef, useCallback } from "react";

import { useStoreState } from "reducer/store";
import { SoundEffects, soundEffectList } from "utils/SoundEffectList";
import { GlobalConstants } from "utils/constants";
import { prependCDN } from "utils/utilities";

type SoundEffectsFile = Record<SoundEffects, HTMLAudioElement>;

export default function useSoundEffect(): [
  (soundEffect: SoundEffects) => void
] {
  const state = useStoreState();

  // Keeping state in ref as we can't access the store in peer js callbacks
  const stateRef = useRef(state);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  const [soundEffects] = useState<SoundEffectsFile>({
    0: new Audio(prependCDN(soundEffectList[0].url)),
    1: new Audio(prependCDN(soundEffectList[1].url)),
    2: new Audio(prependCDN(soundEffectList[2].url)),
    3: new Audio(prependCDN(soundEffectList[3].url)),
  });

  const playAudio = useCallback(
    (soundEffect: SoundEffects) => {
      const soundEffectFile = soundEffects[soundEffect];

      // Resets audio if it's currently playing, and plays it
      soundEffectFile.currentTime = 0;
      soundEffectFile.volume =
        stateRef.current.appSettings.volume / GlobalConstants.VOLUME_STEP / 10;
      soundEffectFile.play();
    },
    [soundEffects]
  );

  return [playAudio];
}