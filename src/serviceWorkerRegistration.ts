import { SWConfig, SWRegistrationStatus } from "models/SWConfig";

const isLocalhost = Boolean(
  window.location.hostname === "localhost" ||
    // [::1] is the IPv6 localhost address.
    window.location.hostname === "[::1]" ||
    // 127.0.0.0/8 are considered localhost for IPv4.
    window.location.hostname.match(
      /^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/
    )
);

export function register(swEvent: SWConfig): void {
  if (process.env.NODE_ENV === "production" && "serviceWorker" in navigator) {
    // The URL constructor is available in all browsers that support SW.
    const publicUrl = new URL(process.env.PUBLIC_URL, window.location.href);
    if (publicUrl.origin !== window.location.origin) {
      // Our service worker won't work if PUBLIC_URL is on a different origin
      // from what our page is served on. This might happen if a CDN is used to
      // serve assets; see https://github.com/facebook/create-react-app/issues/2374
      return;
    }

    window.addEventListener("load", () => {
      const swUrl = `${process.env.PUBLIC_URL}/service-worker.js`;

      if (isLocalhost) {
        // This is running on localhost. Let's check if a service worker still exists or not.
        checkValidServiceWorker(swUrl, swEvent);

        // Add some additional logging to localhost, pointing developers to the
        // service worker/PWA documentation.
        navigator.serviceWorker.ready.then(() => {
          // eslint-disable-next-line no-console
          console.log(
            "This web app is being served cache-first by a service " +
              "worker. To learn more, visit https://cra.link/PWA"
          );
        });
      } else {
        // Is not localhost. Just register service worker
        registerValidSW(swUrl, swEvent);
      }
    });
  } else {
    swEvent(SWRegistrationStatus.NOT_SUPPORTED);
  }
}

function registerValidSW(swUrl: string, swEvent: SWConfig) {
  navigator.serviceWorker
    .register(swUrl)
    .then((registration) => {
      swEvent(SWRegistrationStatus.REGISTERED, registration);
      registration.onupdatefound = () => {
        const installingWorker = registration.installing;
        if (installingWorker == null) {
          return;
        }
        installingWorker.onstatechange = () => {
          if (installingWorker.state === "installed") {
            if (navigator.serviceWorker.controller) {
              // At this point, the updated precached content has been fetched,
              // but the previous service worker will still serve the older
              // content until all client tabs are closed.

              // Activate the new service worker immediately if new tabs
              // for dotaherohunt are opened
              registration.waiting?.postMessage({ type: "SKIP_WAITING" });

              // Let the user know that there is an update waiting
              swEvent(SWRegistrationStatus.UPDATE_FOUND, registration);
            } else {
              // At this point, everything has been precached.
              // We can let the user know that offline assets have been saved
              swEvent(SWRegistrationStatus.SUCCESS, registration);
            }
          }
        };
      };
    })
    .catch((error) => {
      // eslint-disable-next-line no-console
      console.error("Error during service worker registration:", error);
      swEvent(SWRegistrationStatus.ERROR);
    });
}

function checkValidServiceWorker(swUrl: string, swEvent: SWConfig) {
  // Check if the service worker can be found. If it can't reload the page.
  fetch(swUrl, {
    headers: { "Service-Worker": "script" },
  })
    .then((response) => {
      // Ensure service worker exists, and that we really are getting a JS file.
      const contentType = response.headers.get("content-type");
      if (
        response.status === 404 ||
        (contentType != null && contentType.indexOf("javascript") === -1)
      ) {
        // No service worker found. Probably a different app. Reload the page.
        navigator.serviceWorker.ready.then((registration) => {
          registration.unregister().then(() => {
            window.location.reload();
          });
        });
      } else {
        // Service worker found. Proceed as normal.
        registerValidSW(swUrl, swEvent);
      }
    })
    .catch(() => {
      // eslint-disable-next-line no-console
      console.log(
        "No internet connection found. App is running in offline mode."
      );
    });
}

export function unregister(): void {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.ready
      .then((registration) => {
        registration.unregister();
      })
      .catch((error) => {
        // eslint-disable-next-line no-console
        console.error(error.message);
      });
  }
}
