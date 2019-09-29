import { Component } from "react";

import { getRoomData, createAnswer } from "../utils/apis";

class GameController extends Component {
  static async getInitialProps({ query }) {
    const { nickName, roomCode } = query;
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
      console.log("[GameController][getInitialProps] An error occured");
      console.log(e);
    }

    return {
      nickName,
      roomCode,
      roomData
    };
  }

  state = {
    answer: "",
    message: "",
    roomDataState: this.props.roomData,
    subscribe: false,
    subscribed: false,
    submitted: false
  };

  subscribe = () => {
    if (this.state.subscribe && !this.state.subscribed) {
      // connect to WS server and listen event
      this.props.socket.on("game.updateState", this.handleUpdateState);
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
    this.props.socket.off("game.updateState", this.handleUpdateState);
  }

  // add messages from server to the state
  handleUpdateState = updateState => {
    this.setState({ roomDataState: updateState });
  };

  handleChange = event => {
    this.setState({ answer: event.target.value });
  };

  handleSubmit = async e => {
    console.log(this.state);
    const { questionIdx } = this.state.roomDataState;

    const { data } = await createAnswer({
      value: this.state.answer,
      questionIdx,
      roomCode: this.props.roomCode,
      nickName: this.props.nickName
    });

    const nextAnswers = { ...this.state.roomDataState.answers };
    const numOfAnswer = Object.keys(nextAnswers[questionIdx]).length;
    nextAnswers[questionIdx][numOfAnswer] = {
      owner: this.props.nickName,
      value: this.state.answer,
      voter: []
    };
    const nextRoomDataState = {
      ...this.state.roomDataState,
      answers: nextAnswers
    };

    console.log("nextAnswers, ", nextAnswers);

    if (data.success) {
      const socketPayload = {
        nickName: this.props.nickName,
        roomCode: this.props.roomCode,
        questionIdx
      };
      this.props.socket.emit("game.submitAnswer", socketPayload);
      this.setState({
        message: data.message,
        submitted: true,
        answer: "",
        roomDataState: nextRoomDataState
      });
    }
  };

  render() {
    return (
      <div>
        <pre>{JSON.stringify(this.state.roomDataState, null, 2)}</pre>
        initial props check dulu game id-nya registered gak ..., kalau enggak
        display input message lagi buat join room
        <button>Template answer 1</button>
        <button>Template answer 2</button>
        <button>Template answer 3</button>
        <br />
        <hr />
        {this.state.message}
        <br />
        <hr />
        {/* <form onSubmit={e => this.handleSubmit(e)}> */}
        {!this.state.submitted && (
          <>
            <input
              onChange={this.handleChange}
              type="text"
              placeholder="Your custom answer"
              value={this.state.answer}
            />
            <button onClick={this.handleSubmit}>Send</button>
          </>
        )}
        {/* </form> */}
        <br />
        <hr />
        // voting session :<button>Vote answer 1</button>
        <button>Vote answer 2</button>
        <button>Vote answer 3</button>
      </div>
    );
  }
}

export default GameController;
