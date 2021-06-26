import React, { useEffect, useState } from "react";

import { InstallStatus } from "models/InstallStatus";
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
    // Event for the first time application data was successfully cached
    const onSWSuccess = (registration: ServiceWorkerRegistration) => {
      setSWRegistration(registration);
      dispatch({
        type: StoreConstants.SET_INSTALL_STATUS,
        status: InstallStatus.INSTALLED,
      });
    };

    // Event for when an update was found for the application
    const onSWUpdate = (registration: ServiceWorkerRegistration) => {
      setSWRegistration(registration);
      setSWUpdateReady(true);
    };

    // Event for when the SW is registered and working
    const onSWRegister = (registration: ServiceWorkerRegistration) => {
      setSWRegistration(registration);
      dispatch({
        type: StoreConstants.SET_INSTALL_STATUS,
        status: InstallStatus.INSTALLING,
      });
    };

    // Register SW for PWA
    register({
      onSuccess: onSWSuccess,
      onUpdate: onSWUpdate,
      onRegister: onSWRegister,
    });
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
          )}`}
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
