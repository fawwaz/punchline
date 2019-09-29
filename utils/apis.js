import axios from "axios";

const request = axios.create({
  baseURL: `${process.env.domain}`,
  timeout: 10000
});

export const createRoom = ({ roomCode }) =>
  request.post("/createRoom", { roomCode });
export const joinRoom = ({ roomCode, nickName }) =>
  request.post("/joinRoom", { roomCode, nickName });
export const getPlayersInRoom = ({ roomCode }) =>
  request.get(`/list/user/${roomCode}`);

export const initGame = ({ roomCode, limit }) =>
  request.post("/room/initGame", { roomCode, limit });
export const getRoomData = ({ roomCode }) => request.get(`/room/${roomCode}`);

export const createAnswer = ({ roomCode, nickName, questionIdx, value }) =>
  request.post("/room/createAnswer", {
    roomCode,
    nickName,
    questionIdx,
    value
  });
