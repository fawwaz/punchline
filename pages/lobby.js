import { Component } from "react";
import Link from "next/link";

import { generateRoomCode } from "../utils/generator";

class LobbyScreen extends Component {
  static getInitialProps({ query }) {
    let { roomCode } = query;
    if (!roomCode) {
      roomCode = generateRoomCode();
    }

    return {
      roomCode
    };
  }

  render() {
    const { roomCode } = this.props;

    return (
      <div>
        Room Code is : {roomCode} Players:
        <ul>
          <li>John</li>
        </ul>
        <button>Delete Lobby</button>
        <Link href={{ pathname: "/game", query: { roomCode: "0123" } }}>
          <button>Start The Game !</button>
        </Link>
      </div>
    );
  }
}

export default LobbyScreen;
