const app = require("express")();
const bodyParser = require("body-parser");
const server = require("http").Server(app);
const io = require("socket.io")(server);
const next = require("next");

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

  app.get("/messages/:chat", (req, res) => {
    res.json(messages[req.params.chat]);
  });

  app.post("/createRoom", (req, res) => {
    console.log(req.body);
    res.json({ echo: JSON.stringify(req.body) });
  });

  app.get("/check/:roomCode/:nickName", (req, res) => {
    const { params } = req;
    const { roomCode, nickName } = params;
    console.log(roomCode, nickName);
  });

  app.get("*", (req, res) => {
    return nextHandler(req, res);
  });

  server.listen(port, err => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${port}`);
  });
});
