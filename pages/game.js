import { Component } from "react";
import Router from "next/router";
import values from "lodash/values";

import { NUM_OF_ROUND } from "../constants";
import { getRoomData } from "../utils/apis";

class GameScreen extends Component {
  static async getInitialProps({ query, res }) {
    const { roomCode } = query;
    let questions = [],
      questionIdx = 0;

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
      const { roomData } = data;
      questions = roomData.questions;
      questionIdx = roomData.questionIdx;
    } catch (e) {
      console.log("[GameScreen][getInitialProps] An error occured");
      console.log(e);
    }

    return {
      questions,
      questionIdx
    };
  }

  state = {
    questionIdx: this.props.questionIdx,
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
    console.log("updatedState: ", updateState);
    // this.setState(state => ({ messages: state.messages.concat(message) }));
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

  // componentWillUnmount() {
  //   clearInterval(this.currInterval);
  // }

  render() {
    const { questions } = this.props;
    const { questionIdx } = this.state;
    // const question = questions[questionIdx];
    // console.log(question);
    return (
      <div>
        <h2>Time to answer: {this.state.remainingTime} </h2>
        {/* <pre>{JSON.stringify(this.props.questions, null, 2)}</pre> */}
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
