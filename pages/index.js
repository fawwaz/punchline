import Head from "next/head";
import { Component } from "react";
import Router from "next/router";
import Link from "next/link";

import { joinRoom } from "../utils/apis";

class ChatOne extends Component {
  // fetch old messages data from the server
  static async getInitialProps({ req }) {
    const baseUrl = req ? `${req.protocol}://${req.get("Host")}` : "";
    // const response = await fetch(`${baseUrl}/messages/chat1`);
    const { SECRET_TOKEN } = process.env;
    // const response = await fetch(`${process.env.domain}/messages/chat1`);
    // const messages = await response.json();
    // return { messages };
    return {};
  }

  static defaultProps = {
    messages: []
  };

  // init state with the prefetched messages
  state = {
    nickName: "",
    roomCode: "",
    message: "",
    separator: "----------------------------------",
    field: "",
    newMessage: 0,
    messages: this.props.messages,
    subscribe: false,
    subscribed: false
  };

  /*
  subscribe = () => {
    if (this.state.subscribe && !this.state.subscribed) {
      // connect to WS server and listen event
      this.props.socket.on("message.chat1", this.handleMessage);
      this.props.socket.on("message.chat2", this.handleOtherMessage);
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
    this.props.socket.off("message.chat1", this.handleMessage);
    this.props.socket.off("message.chat2", this.handleOtherMessage);
  }

  // add messages from server to the state
  handleMessage = message => {
    this.setState(state => ({ messages: state.messages.concat(message) }));
  };

  handleOtherMessage = () => {
    this.setState(prevState => ({ newMessage: prevState.newMessage + 1 }));
  };
  */

  handleChangeNickName = event => {
    this.setState({ nickName: event.target.value });
  };

  handleChangeRoomCode = event => {
    this.setState({ roomCode: event.target.value });
  };

  // send messages to server and add them to the state
  handleClickJoin = async event => {
    event.preventDefault();

    // // create message object
    // const message = {
    //   id: new Date().getTime(),
    //   value: this.state.field
    // }

    // // send object to WS server
    // this.props.socket.emit('message.chat1', message)

    // // add it to state and clean current input value
    // this.setState(state => ({
    //   field: '',
    //   messages: state.messages.concat(message)
    // }))

    // check udah registered belum dan nama-nya duplikat gak ?
    const { nickName, roomCode } = this.state;
    try {
      const { data } = await joinRoom({ nickName, roomCode });
      const { success, message } = data;

      if (!success) {
        this.setState({ message });
      } else {
        const joinPayload = {
          roomCode,
          nickName
        };

        this.props.socket.emit("join", joinPayload);
        Router.push({
          pathname: "/controller",
          query: joinPayload
        });
      }
    } catch (e) {
      console.log("[index][handleClickJoin] Error occured");
      console.log(e);
    }
  };

  render() {
    const { message } = this.state;

    return (
      <main>
        <Head>
          <script
            src="https://www.reactriot.com/entries/149-cokroaminoto/vote.js"
            type="text/javascript"
          ></script>
        </Head>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "100vh",
            width: "100%"
          }}
        >
          <div style={{ height: 200, width: 200 }}>
            <Link href={"/lobby"}>
              <button>Create Lobby</button>
            </Link>
            <br />
            <form onSubmit={e => this.handleClickJoin(e)}>
              <input
                onChange={this.handleChangeNickName}
                type="text"
                placeholder="Enter your nick name"
                value={this.state.nickName}
              />
              <br />
              <input
                onChange={this.handleChangeRoomCode}
                type="text"
                placeholder="Enter 4 digit Room Code!"
                value={this.state.roomCode}
              />
              <br />
              <button>Join Lobby</button>
            </form>
          </div>
        </div>
      </main>
    );
  }
}

export default ChatOne;
