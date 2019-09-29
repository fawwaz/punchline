import { Component } from "react";
import Router from "next/router";
import values from "lodash/values";

import { NUM_OF_ROUND } from "../constants";
import { getRoomData } from "../utils/apis";

class GameScreen extends Component {
  static async getInitialProps({ query, res }) {
    const { roomCode } = query;
    let questions = [],
      questionIdx = 0,
      roomData;

    // Protect from empty room code
    if (!roomCode) {
      if (res) {
        res.writeHead(302, {
          Location: "/"
        });
        res.end();
      } else {
        Router.push("/");
      }
    }

    try {
      const { data } = await getRoomData({ roomCode });
      roomData = data.roomData;
    } catch (e) {
      console.log("[GameScreen][getInitialProps] An error occured");
      console.log(e);
    }

    return {
      roomData
    };
  }

  state = {
    roomDataState: this.props.roomData,
    remainingTime: 120,
    subscribe: false,
    subscribed: false,
    answers: {}
  };

  currInterval = null;

  subscribe = () => {
    if (this.state.subscribe && !this.state.subscribed) {
      // connect to WS server and listen event
      this.props.socket.on("game.updateState", this.handleUpdateState);
      this.setState({ subscribed: true });
    }
  };
  componentDidMount() {
    this.subscribe();
    this.setTimer();
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
    this.props.socket.off("game.updateState", this.handleUpdateState);
  }

  // add messages from server to the state
  handleUpdateState = updateState => {
    this.setState({ roomDataState: updateState });
  };

  setTimer() {
    setTimeout(() => {
      this.currInterval = setInterval(() => {
        this.setState(prevState => {
          if (prevState.remainingTime === 0) {
            clearInterval(this.currInterval);
            return {};
          } else {
            return { remainingTime: prevState.remainingTime - 1 };
          }
        });
      }, 1000);
    }, 2500);
  }

  render() {
    const { questions } = this.props;
    const { questionIdx } = this.state.roomDataState;

    return (
      <div>
        <h2>Time to answer: {this.state.remainingTime} </h2>
        <pre>{JSON.stringify(this.state.roomDataState, null, 2)}</pre>
        Timer progress bar ...
        {/* <h1>{question.question}</h1> */}
        Submitted answer
        <ul>
          <li>otong</li>
        </ul>
        Scoring + load next question
      </div>
    );
  }
}

export default GameScreen;
