const configureSocket = (socket, db) => {
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
    if (numOfAnswer === numOfPlayer + 1) {
      console.log("harusnya pindah ke voting state");
    } else {
      socket.broadcast.emit("game.updateState", roomData);
    }
  });
};

module.exports = {
  configureSocket
};
