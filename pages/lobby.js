import { Component } from "react";
import Router from "next/router";

import { NUM_OF_ROUND } from "../constants";
import { generateRoomCode } from "../utils/generator";
import { createRoom, getPlayersInRoom, initGame } from "../utils/apis";

class LobbyScreen extends Component {
  static async getInitialProps({ query }) {
    let { roomCode } = query;
    let players = [];
    if (!roomCode) {
      roomCode = generateRoomCode();
    }

    try {
      await createRoom({ roomCode });
    } catch (e) {
      console.log("Exception : ");
      console.log(e);
    }

    const { data } = await getPlayersInRoom({ roomCode });
    players = data.players;

    // Todo : redirect to game?roomcode if the room already have set of question

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

  handleClickStartGame = async e => {
    e.preventDefault();
    const { roomCode } = this.props;
    const { data } = await initGame({ roomCode, limit: NUM_OF_ROUND });
    if (data.success) {
      Router.push({
        pathname: "/game",
        query: {
          roomCode
        }
      });
    }
  };

  render() {
    const { roomCode, message } = this.props;
    const { players } = this.state;

    return (
      <div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "100vh",
            width: "100%"
          }}
        >
          <div style={{ width: "300px" }}>
            Room Code is : {roomCode} <br />
            <hr />
            {message}
            Connected Players:
            <ul>
              {players.map(player => (
                <li key={player}>{player}</li>
              ))}
            </ul>
            <br />
            <hr />
            <button
              onClick={this.handleClickStartGame}
              disabled={players.length < 1}
            >
              Start The Game !
            </button>
            <br />
            At least 4 people required to play the game.
          </div>
        </div>
      </div>
    );
  }
}

export default LobbyScreen;
