const configureSocket = (io, db) => {
  io.on("connection", socket => {
    // socket.on("message.chat1", data => {
    //   // messages["chat1"].push(data);
    //   socket.broadcast.emit("message.chat1", data);
    // });
    // socket.on("message.chat2", data => {
    //   // messages["chat2"].push(data);
    //   socket.broadcast.emit("message.chat2", data);
    // });

    socket.on("join", async ({ roomCode }) => {
      const players = await db.getAllUserInRoom({ roomCode });
      socket.broadcast.emit("join.players", players);
    });

    socket.on("game.submitAnswer", async ({ roomCode }) => {
      const roomData = await db.getRoomData({ roomCode });
      const { players, answers, questionIdx } = roomData;
      const numOfAnswer = Object.keys(answers[questionIdx]).length;
      const numOfPlayer = players.length;
      // +1 comes from system's answer
      if (numOfAnswer >= numOfPlayer + 1) {
        await db.setRoomData({
          roomCode,
          key: "gameState",
          value: "ANSWERING"
        });

        io.emit("game.updateState", {
          ...roomData,
          gameState: "ANSWERING"
        });
      } else {
        io.emit("game.updateState", roomData);
      }
    });

    socket.on("game.chooseAnswer", async ({ roomCode }) => {
      const roomData = await db.getRoomData({ roomCode });
      const { players, votes, questionIdx } = roomData;
      const numOfVotes = Object.keys(votes[questionIdx]).length;
      console.log(numOfVotes);
      const numOfPlayer = players.length;
      // +1 comes from system's answer
      console.log("harusnya pindah ke voting state", numOfPlayer);
      if (numOfVotes >= numOfPlayer) {
        await db.setRoomData({
          roomCode,
          key: "gameState",
          value: "EXPLAINING"
        });

        io.emit("game.updateState", {
          ...roomData,
          gameState: "EXPLAINING"
        });
      } else {
        io.emit("game.updateState", roomData);
      }
    });
  });

  // socket.on("game.click")
};

module.exports = {
  configureSocket
};
