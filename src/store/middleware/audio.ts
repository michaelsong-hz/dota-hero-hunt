import { Middleware, MiddlewareAPI } from "@reduxjs/toolkit";
import { Howl } from "howler";
import { AnyAction, Dispatch } from "redux";

import { selectVolume } from "store/application/applicationSlice";
import { addSelectedIconAction } from "store/host/hostActions";
import { HOST_SELECT_ICON } from "store/host/hostConstants";
import { AppDispatch, RootState } from "store/rootStore";
import { soundEffectList } from "utils/SoundEffectList";
import { prependCDN } from "utils/utilities";

const soundEffects = {
  0: new Howl({ src: prependCDN(soundEffectList[0].url), volume: 0.5 }),
  1: new Howl({ src: prependCDN(soundEffectList[1].url), volume: 0.5 }),
  2: new Howl({ src: prependCDN(soundEffectList[2].url), volume: 0.5 }),
  3: new Howl({ src: prependCDN(soundEffectList[3].url), volume: 0.5 }),
};

function createAudioMiddleware(): Middleware<Dispatch> {
  return ({ getState }: MiddlewareAPI<Dispatch<AnyAction>, RootState>) =>
    (next: Dispatch<AnyAction> | AppDispatch) =>
    (action: AnyAction) => {
      if (action.type && action.type === HOST_SELECT_ICON) {
        if (
          addSelectedIconAction.match(action) &&
          action.payload &&
          action.payload.soundEffect !== undefined
        ) {
          // Only plays media if the game isn't muted
          // Prevents music from stopping on mobile devices
          const volume = selectVolume(getState());
          if (volume > 0) {
            // Stops audio if it's currently playing, and plays it
            const soundEffectFile = soundEffects[action.payload.soundEffect];
            soundEffectFile.stop();
            soundEffectFile.play();
          }
        }
      }

      return next(action);
    };
}

export const audioMiddleware = createAudioMiddleware();
