import { Component } from "react";
import Link from "next/link";

class LobbyScreen extends Component {
  render() {
    return (
      <div>
        Room Code is : 01234 Players:
        <ul>
          <li>John</li>
        </ul>
        <Link href={{ pathname: "/game", query: { code: "0123" } }}>
          <button>Start The Game !</button>
        </Link>
      </div>
    );
  }
}

export default LobbyScreen;
