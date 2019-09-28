import { Component } from "react";

class GameScreen extends Component {
  render() {
    return (
      <div>
        Timer progress bar ...
        <h1>Question: The most popular keyword in google is ___ ? </h1>
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
