const configureSocket = (socket, db) => {
  socket.on("message.chat1", data => {
    // messages["chat1"].push(data);
    socket.broadcast.emit("message.chat1", data);
  });
  socket.on("message.chat2", data => {
    // messages["chat2"].push(data);
    socket.broadcast.emit("message.chat2", data);
  });

  socket.on("join", async ({ roomCode }) => {
    const players = await db.getAllUserInRoom({ roomCode });
    socket.broadcast.emit("join.players", players);
  });
};

module.exports = {
  configureSocket
};
