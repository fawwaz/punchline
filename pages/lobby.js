import { Component } from "react";
import Link from "next/link";

import { generateRoomCode } from "../utils/generator";
import { createRoom, getPlayersInRoom } from "../utils/apis";

class LobbyScreen extends Component {
  static async getInitialProps({ query, ...rest }) {
    // console.log('getinitialprops is called', query);
    let { roomCode } = query;
    let players = [];
    if (!roomCode) {
      roomCode = generateRoomCode();
      try {
        await createRoom({ roomCode });
      } catch (e) {
        console.log("Exception : ");
        console.log(e);
      }
    }

    console.log("before data");
    const { data } = await getPlayersInRoom({ roomCode });
    console.log("data");
    players = data.players;
    console.log("players :", data.players);

    return {
      roomCode,
      players
    };
  }

  state = {
    subscribe: false,
    subscribed: false,
    nickName: "",
    roomCode: "",
    players: this.props.players
  };

  subscribe = () => {
    if (this.state.subscribe && !this.state.subscribed) {
      // connect to WS server and listen event
      this.props.socket.on("join.players", this.handleJoinEvent);

      this.setState({ subscribed: true });
    }
  };
  componentDidMount() {
    this.subscribe();
  }

  componentDidUpdate() {
    this.subscribe();
  }

  static getDerivedStateFromProps(props, state) {
    if (props.socket && !state.subscribe) return { subscribe: true };
    return null;
  }

  // close socket connection
  componentWillUnmount() {
    this.props.socket.off("join", this.handleJoinEvent);
  }

  handleJoinEvent = players => {
    this.setState({ players });
  };

  render() {
    const { roomCode, message } = this.props;
    const { players } = this.state;

    return (
      <div>
        Message from server: {message}
        Room Code is : {roomCode} <br />
        Players are:
        <ul>
          {players.map(player => (
            <li key={player}>{player}</li>
          ))}
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
