const app = require("express")();
const bodyParser = require("body-parser");
const server = require("http").Server(app);
const io = require("socket.io")(server);
const next = require("next");
const shuffle = require("lodash/shuffle");

const port = parseInt(process.env.PORT, 10) || 3000;
const dev = process.env.NODE_ENV !== "production";
const nextApp = next({ dev });
const nextHandler = nextApp.getRequestHandler();

const { configureSocket } = require("./utils/sockets");
const { createDbConnection } = require("./utils/database");

const firebaseAdmin = require("firebase-admin");
const serviceAccountJson = JSON.parse(process.env.SERVICE_ACCOUNT_JSON);

firebaseAdmin.initializeApp({
  credential: firebaseAdmin.credential.cert(serviceAccountJson),
  databaseURL: "https://punchline-db.firebaseio.com"
});

const firestore = firebaseAdmin.firestore();

const db = createDbConnection(firestore);

io.on("connection", socket => {
  configureSocket(socket, db);
});

nextApp.prepare().then(() => {
  app.use(bodyParser.json());

  // app.get("/messages/:chat", (req, res) => {
  //   res.json(messages[req.params.chat]);
  // });

  app.post("/createRoom", async (req, res) => {
    const { roomCode } = req.body;
    if (!roomCode) {
      return res.json({
        success: false,
        message: `Missing roomCode param on request body`
      });
    }

    const ref = await db.createNewRoom({ roomCode });
    res.json({ success: true, message: `Room created` });
  });

  app.post("/joinRoom", async (req, res) => {
    const { roomCode, nickName } = req.body;
    console.log("req: ", req.body);
    if (!roomCode || !nickName) {
      return res.json({
        success: false,
        message: `Missing roomCode param or nickName param on request body`
      });
    }

    const response = await db.registerUserToRoom({ roomCode, nickName });
    res.json(response);
  });

  app.get("/list/user/:roomCode", async (req, res) => {
    const { params } = req;
    const { roomCode } = params;
    const players = await db.getAllUserInRoom({ roomCode });
    res.json({ success: true, players });
  });

  app.post("/room/initGame", async (req, res) => {
    const { roomCode, limit } = req.body;
    await db.initGameForRoom({ roomCode, limit });
    res.json({ success: true });
  });

  app.get("/room/:roomCode", async (req, res) => {
    const { params } = req;
    const { roomCode } = params;
    const roomData = await db.getRoomData({ roomCode });
    res.json({ success: true, roomData });
  });

  app.post("/room/createAnswer", async (req, res) => {
    const { roomCode, nickName, questionIdx, value } = req.body;
    const response = await db.createAnswer({
      roomCode,
      nickName,
      questionIdx,
      value
    });
    res.json(response);
  });

  app.post("/room/setRoomData", async (req, res) => {
    const { roomCode, key, value } = req.body;
    const roomData = await db.setRoomData({ roomCode, key, value });
    res.json({ success: true, roomData });
  });

  app.get("*", (req, res) => {
    return nextHandler(req, res);
  });

  server.listen(port, err => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${port}`);
  });
});
