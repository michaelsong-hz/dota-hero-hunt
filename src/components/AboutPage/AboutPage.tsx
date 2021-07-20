import React, { useEffect } from "react";
import { Container } from "react-bootstrap";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";

import { useAppDispatch, useAppSelector } from "hooks/useStore";
import HeroHuntIcon from "images/HeroHuntIcon.svg";
import { InstallStatus } from "models/InstallStatus";
import {
  selectInstallStatus,
  selectIsDark,
} from "store/application/applicationSlice";
import { visitAboutPage } from "store/host/hostThunks";
import { appendTheme, getAppVersion } from "utils/utilities";

function AboutPage(): JSX.Element {
  const installStatus = useAppSelector(selectInstallStatus);
  const isDark = useAppSelector(selectIsDark);

  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(visitAboutPage());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function getInstallStatus() {
    switch (installStatus) {
      case InstallStatus.CHECKING: {
        return "Checking";
      }
      case InstallStatus.INSTALLING: {
        return "Installing";
      }
      case InstallStatus.INSTALLED: {
        return "Installed";
      }
      case InstallStatus.NOT_SUPPORTED: {
        return "Not Supported";
      }
      case InstallStatus.ERROR: {
        return "Error";
      }
    }
  }

  function getInstallStatusText(): JSX.Element {
    switch (installStatus) {
      case InstallStatus.CHECKING: {
        return <p>Checking Dota Hero Hunt installation status...</p>;
      }
      case InstallStatus.INSTALLING: {
        return (
          <p>
            Downloading assets for Dota Hero Hunt to optimize your gameplay
            experience...
          </p>
        );
      }
      case InstallStatus.INSTALLED: {
        return (
          <p>
            Assets for Dota Hero Hunt have been saved for offline use, allowing
            you to play in single player mode without an internet connection.
            This takes up approximately 3 MB of device space. This also speeds
            up the performance of Dota Hero Hunt when loading hero icons between
            rounds.
          </p>
        );
      }
      case InstallStatus.NOT_SUPPORTED: {
        return (
          <>
            <p>
              Dota Hero Hunt would like to save some files in your browser so
              that you can play in single player mode without an internet
              connection, and to speed up the performance of Dota Hero Hunt when
              loading hero icons between rounds. This takes up approximately 3
              MB of device space.
            </p>
            <p>
              Your current browser does not support this. To take advantage of
              this feature, you could try turning off incognito or private mode,
              or try downloading the latest version of Firefox or Google Chrome.
            </p>
          </>
        );
      }
      case InstallStatus.ERROR: {
        return (
          <p>
            An error was encountered while saving assets for Dota Hero Hunt on
            this device.
          </p>
        );
      }
    }
  }

  return (
    <Container className="my-4">
      <Row>
        <Col className="about-title">
          <img
            alt="Dota Hero Hunt logo"
            width="57"
            height="57"
            src={HeroHuntIcon}
            className="mr-3"
          />
          <h1 className="mb-1">About Dota Hero Hunt</h1>
        </Col>
      </Row>
      <Row className="mt-3">
        <Col>
          <p className="mb-2">
            First seen in The International 10 Battle Pass, Dota Hero Hunt is a
            recreation of the beloved Dota minigame which you can play anywhere,
            anytime!
          </p>
          <p>
            All hero icons and sounds are from the video game{" "}
            <a
              className={appendTheme("about-license-link", isDark)}
              target="_blank"
              href="https://www.dota2.com"
              rel="noreferrer"
            >
              Dota 2
            </a>{" "}
            by{" "}
            <a
              className={appendTheme("about-license-link", isDark)}
              target="_blank"
              href="https://www.valvesoftware.com"
              rel="noreferrer"
            >
              Valve
            </a>
            .
          </p>
        </Col>
      </Row>
      <Row className="mt-3">
        <Col className="about-install mb-1">
          <h2>Installation Status:</h2>
          <h2 className="text-muted"> {`${getInstallStatus()}`}</h2>
        </Col>
      </Row>
      <Row className="mt-1">
        <Col>{getInstallStatusText()}</Col>
      </Row>
      <Row className="mt-1">
        <Col>
          <p>Version {getAppVersion()}</p>
        </Col>
      </Row>
      <Row className="mt-3">
        <Col>
          <h2>Licensing Information</h2>
        </Col>
      </Row>
      <Row className="mt-1">
        <Col>
          <p className="mb-2">
            Dota Hero Hunt is licensed under the GNU Affero General Public
            License. You can view the{" "}
            <a
              className={appendTheme("about-license-link", isDark)}
              target="_blank"
              href="https://raw.githubusercontent.com/michaelsong-hz/dota-hero-hunt/main/NOTICE"
              rel="noreferrer"
            >
              copyright notice
            </a>{" "}
            and{" "}
            <a
              className={appendTheme("about-license-link", isDark)}
              target="_blank"
              href="https://github.com/michaelsong-hz/dota-hero-hunt/blob/main/LICENSE.md"
              rel="noreferrer"
            >
              license
            </a>{" "}
            on GitHub, along with the{" "}
            <a
              className={appendTheme("about-license-link", isDark)}
              target="_blank"
              href="https://github.com/michaelsong-hz/dota-hero-hunt"
              rel="noreferrer"
            >
              source code.
            </a>
          </p>
          <p>
            Dota Hero Hunt also uses libraries made freely available to the
            community. Attributions can be viewed at{" "}
            <a
              className={appendTheme("about-license-link", isDark)}
              target="_blank"
              href="https://raw.githubusercontent.com/michaelsong-hz/dota-hero-hunt/main/attributions.txt"
              rel="noreferrer"
            >
              this link.
            </a>
          </p>
        </Col>
      </Row>
    </Container>
  );
}

export default AboutPage;
