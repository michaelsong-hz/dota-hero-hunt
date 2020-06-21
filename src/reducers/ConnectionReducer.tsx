import Peer from "peerjs";

export enum ConnectionReducerConstants {
  REGISTER_CLIENT = "REGISTER_CLIENT",
}

type IConnectionReducer = { clientConnections: Peer.DataConnection[] };

export default function connectionReducer(
  state: IConnectionReducer,
  action: {
    type: ConnectionReducerConstants.REGISTER_CLIENT;
    newConnection: Peer.DataConnection;
  }
): IConnectionReducer {
  switch (action.type) {
    case ConnectionReducerConstants.REGISTER_CLIENT: {
      // TODO: This only works if we mutate the current connections pushing
      // the new connection directly to it, need to find a way to do it "properly"
      state.clientConnections.push(action.newConnection);
      // console.log(
      //   "connection reducer",
      //   state.clientConnections,
      //   action.newConnection
      // );
      // Attempting to do it properly here but wtf THIS ISN'T WORKING AND IT'S 1AM AND I NEED TO SLEEP
      return {
        ...state,
        clientConnections: [...state.clientConnections, action.newConnection],
      };
    }
    default:
      throw new Error();
  }
}
