/// <reference lib="webworker" />
/* eslint-disable no-restricted-globals */

import { clientsClaim } from "workbox-core";
import { precacheAndRoute, createHandlerBoundToURL } from "workbox-precaching";
import { PrecacheEntry } from "workbox-precaching/_types";
import { registerRoute } from "workbox-routing";

import { heroList } from "utils/HeroList";
import { soundEffectList } from "utils/SoundEffectList";
import { getIconPath, prependCDN } from "utils/utilities";

declare const self: ServiceWorkerGlobalScope;

clientsClaim();

// Precache all of the assets generated by your build process.
// Their URLs are injected into the manifest variable below.
// This variable must be present somewhere in your service worker file,
// even if you decide not to use precaching. See https://cra.link/PWA
precacheAndRoute(self.__WB_MANIFEST);

// Set up App Shell-style routing, so that all navigation requests
// are fulfilled with your index.html shell. Learn more at
// https://developers.google.com/web/fundamentals/architecture/app-shell
const fileExtensionRegexp = new RegExp("/[^/?]+\\.[^/]+$");
registerRoute(
  // Return false to exempt requests from being fulfilled by index.html.
  ({ request, url }: { request: Request; url: URL }) => {
    // If this isn't a navigation, skip.
    if (request.mode !== "navigate") {
      return false;
    }

    // If this is a URL that starts with /_, skip.
    if (url.pathname.startsWith("/_")) {
      return false;
    }

    // If this looks like a URL for a resource, because it contains
    // a file extension, skip.
    if (url.pathname.match(fileExtensionRegexp)) {
      return false;
    }

    // Return true to signal that we want to use the handler.
    return true;
  },
  createHandlerBoundToURL(process.env.PUBLIC_URL + "/index.html")
);

// Adds static assets from the cdn to be pre-cached
const targetsToCache: Array<PrecacheEntry | string> = [];
heroList.forEach((heroIcon) => {
  targetsToCache.push({
    url: getIconPath(heroIcon.url),
    revision: "icons_1",
  });
});
soundEffectList.forEach((soundEffect) => {
  targetsToCache.push({
    url: prependCDN(soundEffect.url),
    revision: "sounds_1",
  });
});
precacheAndRoute(targetsToCache);

// This allows the web app to trigger skipWaiting via
// registration.waiting.postMessage({type: 'SKIP_WAITING'})
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

// Any other custom service worker logic can go here.
