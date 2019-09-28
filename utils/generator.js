import shuffle from "lodash/shuffle";
import { ROOM_CODE_LENGTH } from "../constants";

export const generateRoomCode = () => {
  return shuffle(Array.from(new Array(10), (x, i) => i))
    .slice(0, ROOM_CODE_LENGTH)
    .join("");
};
