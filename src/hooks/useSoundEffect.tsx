// eslint-disable-next-line @typescript-eslint/no-unused-vars
import React, { useContext, useState } from "react";

import { StoreContext } from "reducer/store";
import { SoundEffects, soundEffectList } from "utils/SoundEffectList";
import { GlobalConstants } from "utils/constants";
import { prependCDN } from "utils/utilities";

type SoundEffectsFile = Record<SoundEffects, HTMLAudioElement>;

export default function useSoundEffect(): [
  (soundEffect: SoundEffects) => void
] {
  const { state } = useContext(StoreContext);

  const [soundEffects] = useState<SoundEffectsFile>({
    0: new Audio(prependCDN(soundEffectList[0].url)),
    1: new Audio(prependCDN(soundEffectList[1].url)),
    2: new Audio(prependCDN(soundEffectList[2].url)),
  });

  const playAudio = (soundEffect: SoundEffects) => {
    const soundEffectFile = soundEffects[soundEffect];

    // Resets audio if it's currently playing, and plays it
    soundEffectFile.currentTime = 0;
    soundEffectFile.volume =
      state.appSettings.volume / GlobalConstants.VOLUME_STEP / 10;
    soundEffectFile.play();
  };

  return [playAudio];
}
