import { Component } from "react";
import Router from "next/router";

import { NUM_OF_ROUND, GAME_STATE } from "../constants";
import {
  getRoomData,
  nextRound,
  deleteRoom,
  getPlayersData
} from "../utils/apis";
import { createSelector } from "../utils/selector";
import Timer from "../components/Timer";

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
      roomCode,
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

  handleClickNextRound = async e => {
    const selector = createSelector(this.state.roomDataState);
    const players = selector.getPlayers();
    const sortedVotingScore = selector.getSortedVotingScore();
    const playerAnswers = sortedVotingScore.slice(0, -1);
    const systemAnswer = sortedVotingScore[sortedVotingScore.length - 1];

    let scoreMapping = {};
    // init score mapping
    players.forEach(player => {
      scoreMapping[player] = 0;
    });

    // Add base for those who correctly guess the answer
    systemAnswer.voter.forEach(v => {
      scoreMapping[v] = 2000;
    });

    // Add Those who succes to trick other
    playerAnswers.forEach(answer => {
      const numOfVictim = answer.voter.length;
      scoreMapping[answer.owner] =
        scoreMapping[answer.owner] + 500 * numOfVictim;
    });

    const { roomCode } = this.props;

    const { data } = await nextRound({ roomCode, scoreMapping });
  };

  handleClickReset = async e => {
    const { roomCode } = this.props;
    await deleteRoom({ roomCode });
    Router.push("/");
  };

  handleShowScore = async e => {
    const { roomCode } = this.props;
    const { data } = await getPlayersData({ roomCode });
    const { players } = data;
    const sortedPlayers = players.sort((p1, p2) => p2.score - p1.score);
    this.setState({ scores: sortedPlayers });
  };

  render() {
    const { questions } = this.props;
    const { questionIdx, gameState } = this.state.roomDataState;

    const selector = createSelector(this.state.roomDataState);
    const submittedAnswer = selector.getWhoAlreadySubmitAnswer();
    const votedAnswer = selector.getWhoAlreadyVoted();
    const question = selector.getQuestion();
    const sortedVotingScore = selector.getSortedVotingScore();
    const answerList = selector.getAnswerList();
    const playerAnswers = sortedVotingScore.slice(0, -1);
    const systemAnswer = sortedVotingScore[sortedVotingScore.length - 1];

    return (
      <div>
        {gameState === GAME_STATE.LYING && (
          <>
            <Timer />
            <h2>Question: {question}</h2>
            <h4>Player who already submit his answer</h4>
            <ul>
              {submittedAnswer
                .filter(a => a !== "SYSTEM")
                .map(player => (
                  <li>{player}</li>
                ))}
            </ul>
          </>
        )}
        {gameState === GAME_STATE.ANSWER && (
          <>
            <Timer />
            <h2>Question: {question}</h2>
            <h4>Choose the answer on your phone !</h4>
            <ol>
              {answerList.map(a => (
                <li>{a}</li>
              ))}
            </ol>
          </>
        )}
        {gameState === GAME_STATE.EXPLAIN && (
          <>
            <h3>Scoring ... </h3>
            <ol>
              {playerAnswers.map((answer, idx) => (
                <li key={idx}>
                  <h5>Answer : {answer.value}</h5>
                  <p> successfully tricks : </p>
                  <ul>
                    {answer.voter.map(u => (
                      <li>{u}</li>
                    ))}
                  </ul>
                  <h4>
                    <b>IS FAKE ANSWER !!!</b>
                  </h4>
                  <p>it was created by : {answer.owner} </p>
                  <p>so he get : {answer.voter.length * 500} points</p>
                </li>
              ))}
              <li>
                <h5>Answer : {systemAnswer.value}</h5>
                <p>is chosen by : </p>
                <ul>
                  {systemAnswer.voter.map(u => (
                    <li>{u}</li>
                  ))}
                </ul>
                {systemAnswer.voter.length === 0 && <b>NO ONE..</b>}
                <h4>
                  <b>IS THE TRUTH !!!</b>
                </h4>
                {systemAnswer.voter.length > 0 && (
                  <p>so each of them get : 2000 points</p>
                )}
              </li>
            </ol>
            <br />
            <button onClick={this.handleClickNextRound}>
              Continue to next round !
            </button>
            <br />
          </>
        )}
        {gameState === GAME_STATE.END && (
          <>
            <h2>End of game !</h2>
            <p>
              Sorry that I am running out of time so you may found a glitch here
              and there, it also comes without animation / styling
            </p>
            <p>
              I also don't have enough content / data to fill the set of
              questions
            </p>
            <p>
              I hope you understand the general gameplay / interaction used in
              this game
            </p>
            <button onClick={this.handleShowScore}>Show Score !</button>
            <ol>
              {(this.state.scores || []).map(p => (
                <li>
                  {p.nickName} - {p.score}
                </li>
              ))}
            </ol>
            <br />
            <hr />
            <button onClick={this.handleClickReset}>
              Reset This Room State & Back to homescreen
            </button>
          </>
        )}
      </div>
    );
  }
}

export default GameScreen;
