import Peer from "peerjs";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import React, {
  useState,
  useEffect,
  useContext,
  useRef,
  Dispatch,
} from "react";

import { ClientTypes } from "models/MessageClientTypes";
import { ClientDataConnection, HostTypes } from "models/MessageHostTypes";
import { IGameStatusReducer, IGameStatusActions } from "reducer/gameStatus";
import { getPeerConfig } from "utils/utilities";

interface UseHostPeerProps {
  GameStatusContext: React.Context<{
    state: IGameStatusReducer;
    dispatch: Dispatch<IGameStatusActions>;
  }>;
  playerName: string;
  onMessage: (data: ClientTypes) => void;
}

// Connects to (multiple) remote clients
// export default function usePeer(addRemoteStream, removeRemoteStream) {
export default function useHostPeer(
  props: UseHostPeerProps
): [string | undefined, (data: HostTypes) => void] {
  const [myPeer, setPeer] = useState<Peer>();
  const [hostID, setHostID] = useState<string>();
  // const [connectedClients, setConnectedClients] = useState<
  //   ClientDataConnection[]
  // >([]);
  // TODO: Using ref for connected clients as we can't access them in the
  // callback. Need to find a better way.
  const connectedClients = useRef<ClientDataConnection[]>([]);

  const { state } = useContext(props.GameStatusContext);

  const cleanUp = () => {
    console.log("peerjs cleanup");
    connectedClients.current = [];
    if (myPeer) {
      myPeer.disconnect();
      myPeer.destroy();
    }
  };

  useEffect(() => {
    const peer = new Peer(getPeerConfig());

    peer.on("open", () => {
      setPeer(peer);
      setHostID(peer.id);
    });

    peer.on("connection", (incomingConn) => {
      console.log("receiving connection");

      incomingConn.on("open", () => {
        console.log("opened connection");
        const prevConnectedClients = [...connectedClients.current];
        prevConnectedClients.push(incomingConn);
        connectedClients.current = prevConnectedClients;
        // setConnectedClients((prevConnectedClients) => [
        //   ...prevConnectedClients,
        //   incomingConn,
        // ]);
      });
      incomingConn.on("data", (data: ClientTypes) => {
        console.log("received data", data);
        console.log(state.players);
        props.onMessage(data);
      });
    });

    peer.on("disconnected", () => {
      console.log("Peer disconnected");
      cleanUp();
    });

    peer.on("close", () => {
      console.log("Peer closed remotely");
      cleanUp();
    });

    peer.on("error", (error) => {
      console.log("peer error", error);
      cleanUp();
    });

    setPeer(peer);

    return () => {
      cleanUp();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function sendToClients(data: HostTypes): void {
    connectedClients.current.forEach((clientConnection) => {
      clientConnection.send(data as HostTypes);
    });
  }

  return [hostID, sendToClients];
}
