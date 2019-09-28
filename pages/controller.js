import { Component } from "react";

import { getRoomData } from "../utils/apis";

class GameController extends Component {
  static async getInitialProps({ query }) {
    const { nickName, roomCode } = query;

    try {
      const { data } = await getRoomData({ roomCode });
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
    subscribe: false,
    subscribed: false
  };

  handleChange = event => {
    this.setState({ answer: event.target.value });
  };

  handleSubmit = e => {
    console.log("submitting .. custom answer");
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
        <form onSubmit={e => this.handleSubmit(e)}>
          <input
            onChange={this.handleChange}
            type="text"
            placeholder="Your custom answer"
            value={this.state.answer}
          />
          <button>Send</button>
        </form>
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
