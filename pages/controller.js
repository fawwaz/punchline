import { Component } from "react";

import { getRoomData, createAnswer } from "../utils/apis";

class GameController extends Component {
  static async getInitialProps({ query }) {
    const { nickName, roomCode } = query;
    let questions = [],
      questionIdx = 0;

    try {
      const { data } = await getRoomData({ roomCode });
      console.log("data", data);
      const { roomData } = data;
      questions = roomData.questions;
      questionIdx = roomData.questionIdx;
    } catch (e) {
      console.log("[GameController][getInitialProps] An error occured");
      console.log(e);
    }

    return {
      nickName,
      roomCode,
      questions,
      questionIdx
    };
  }

  state = {
    answer: "",
    message: "",
    subscribe: false,
    subscribed: false,
    submitted: false
  };

  handleChange = event => {
    this.setState({ answer: event.target.value });
  };

  handleSubmit = async e => {
    const { data } = await createAnswer({
      value: this.state.answer,
      questionIdx: this.props.questionIdx,
      roomCode: this.props.roomCode,
      nickName: this.props.nickName
    });

    if (data.success) {
      const socketPayload = {
        nickName: this.props.nickName,
        roomCode: this.props.roomCode,
        questionIdx: this.props.questionIdx
      };
      this.props.socket.emit("game.submitAnswer", socketPayload);
      this.setState({ message: data.message, submitted: true, answer: "" });
    }
  };

  render() {
    return (
      <div>
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
