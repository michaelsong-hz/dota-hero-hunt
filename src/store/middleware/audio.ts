import { Middleware, MiddlewareAPI, PayloadAction } from "@reduxjs/toolkit";
import { Howl } from "howler";
import { AnyAction, Dispatch } from "redux";

import { selectVolume } from "store/application/applicationSlice";
import { clientIconUpdateAction } from "store/client/clientActions";
import { CLIENT_ICON_UPDATE } from "store/client/clientConstants";
import { addSelectedIconAction } from "store/host/hostActions";
import { HOST_SELECT_ICON } from "store/host/hostConstants";
import { AppDispatch, RootState } from "store/rootStore";
import { soundEffectList, SoundEffects } from "utils/SoundEffectList";
import { prependCDN } from "utils/utilities";

const soundEffects = {
  0: new Howl({ src: prependCDN(soundEffectList[0].url), volume: 0.5 }),
  1: new Howl({ src: prependCDN(soundEffectList[1].url), volume: 0.5 }),
  2: new Howl({ src: prependCDN(soundEffectList[2].url), volume: 0.5 }),
  3: new Howl({ src: prependCDN(soundEffectList[3].url), volume: 0.5 }),
};

function createAudioMiddleware(): Middleware {
  return ({ getState }: MiddlewareAPI<Dispatch<AnyAction>, RootState>) =>
    (next: AppDispatch) =>
    (action: PayloadAction<AppDispatch>) => {
      function playAudio(soundEffect: SoundEffects) {
        // Only plays media if the game isn't muted
        // Prevents music from stopping on mobile devices
        const volume = selectVolume(getState());
        if (volume > 0) {
          // Stops audio if it's currently playing, and plays it
          const soundEffectFile = soundEffects[soundEffect];
          soundEffectFile.stop();
          soundEffectFile.play();
        }
      }

      if (action.type) {
        switch (action.type) {
          case HOST_SELECT_ICON:
            if (
              addSelectedIconAction.match(action) &&
              action.payload &&
              action.payload.soundEffect !== undefined
            ) {
              playAudio(action.payload.soundEffect);
            }
            break;
          case CLIENT_ICON_UPDATE:
            if (
              clientIconUpdateAction.match(action) &&
              action.payload &&
              action.payload.soundEffect !== undefined
            ) {
              playAudio(action.payload.soundEffect);
            }
            break;
        }
      }

      return next(action);
    };
}

export const audioMiddleware = createAudioMiddleware();
