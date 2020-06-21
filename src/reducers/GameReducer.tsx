import Peer from "peerjs";

export enum GameReducerConstants {
  REGISTER_CLIENT = "REGISTER_CLIENT",
}

type IGameReducer = { clientConnections: Peer.DataConnection[] };

export default function gameReducer(
  state: IGameReducer,
  action: {
    type: GameReducerConstants.REGISTER_CLIENT;
    newConnection: Peer.DataConnection;
  }
): IGameReducer {
  switch (action.type) {
    case GameReducerConstants.REGISTER_CLIENT:
      state.clientConnections.push(action.newConnection);
      return state;
    // case 'decrement':
    //   return {count: state.count - 1};
    default:
      throw new Error();
  }
}
