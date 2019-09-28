import { Component } from "react";

class GameController extends Component {
  state = {
    field: ""
  };

  handleChange = event => {
    this.setState({ field: event.target.value });
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
        <form onSubmit={e => this.handleSubmit(e)}>
          <input
            onChange={this.handleChange}
            type="text"
            placeholder="Your custom answer"
            value={this.state.field}
          />
          <button>Send</button>
        </form>
        // voting session :<button>Vote answer 1</button>
        <button>Vote answer 2</button>
        <button>Vote answer 3</button>
      </div>
    );
  }
}

export default GameController;
