import React, { useEffect, useState } from "react";

import { InstallStatus } from "models/InstallStatus";
import { SWConfig, SWRegistrationStatus } from "models/SWConfig";
import { useStoreDispatch, useStoreState } from "reducer/store";
import { StoreConstants } from "reducer/storeReducer";
import { register } from "serviceWorkerRegistration";
import { appendTheme } from "utils/utilities";

function UpdateMessage(): JSX.Element {
  const state = useStoreState();
  const dispatch = useStoreDispatch();

  const [swUpdateReady, setSWUpdateReady] = useState(false);
  const [swRegistration, setSWRegistration] =
    useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    // Handle various service worker events
    const onSWEvent: SWConfig = (
      status: SWRegistrationStatus,
      registration?: ServiceWorkerRegistration
    ) => {
      if (registration !== undefined) {
        setSWRegistration(registration);
      } else {
        setSWRegistration(null);
      }

      switch (status) {
        case SWRegistrationStatus.REGISTERED:
          dispatch({
            type: StoreConstants.SET_INSTALL_STATUS,
            status: InstallStatus.INSTALLING,
          });
          break;
        case SWRegistrationStatus.SUCCESS:
          dispatch({
            type: StoreConstants.SET_INSTALL_STATUS,
            status: InstallStatus.INSTALLED,
          });
          break;
        case SWRegistrationStatus.UPDATE_FOUND:
          setSWUpdateReady(true);
          break;
        case SWRegistrationStatus.NOT_SUPPORTED:
          dispatch({
            type: StoreConstants.SET_INSTALL_STATUS,
            status: InstallStatus.NOT_SUPPORTED,
          });
          break;
        case SWRegistrationStatus.ERROR:
          dispatch({
            type: StoreConstants.SET_INSTALL_STATUS,
            status: InstallStatus.ERROR,
          });
          break;
      }
    };

    // Register SW for PWA support
    register(onSWEvent);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Poll for updates every hour
  useEffect(() => {
    let pollForUpdates: NodeJS.Timeout;
    if (swRegistration && swRegistration.active) {
      dispatch({
        type: StoreConstants.SET_INSTALL_STATUS,
        status: InstallStatus.INSTALLED,
      });

      pollForUpdates = setInterval(() => {
        swRegistration.update();
      }, 3600000);
    }

    return () => {
      clearInterval(pollForUpdates);
    };
  }, [dispatch, swRegistration]);

  function handleReload() {
    setSWUpdateReady(false);
    window.location.reload();
  }

  return (
    <>
      {swUpdateReady === true && (
        <div
          className={`d-flex update-alert ${appendTheme(
            "update-alert",
            state.appSettings.isDark
          )} slide-down-appear`}
        >
          An update for Dota Hero Hunt is available!{" "}
          <div
            className={`update-alert-refresh ${appendTheme(
              "update-alert-refresh",
              state.appSettings.isDark
            )}`}
            onClick={handleReload}
          >
            {/* Whitespace has to go after "reload now" instead of before the
            next line, otherwise Chrome won't render it properly :( */}
            Reload now{" "}
          </div>
          to get it.
        </div>
      )}
    </>
  );
}

export default UpdateMessage;
