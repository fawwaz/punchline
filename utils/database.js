const createDbConnection = fireStore => {
  const RoomsCollection = fireStore.collection("rooms");
  const TestCollection = fireStore.collection("test");

  return {
    createNewRoom: ({ roomCode }) => {
      const initialRoomData = {
        players: []
        // answer, questions, round
      };
      return RoomsCollection.doc(roomCode).set(initialRoomData);
    },
    registerUserToRoom: async ({ roomCode, nickName }) => {
      const doc = await RoomsCollection.doc(roomCode).get();
      const roomData = doc.data();
      const { players } = roomData;

      if (players.includes(nickName)) {
        return Promise.resolve({
          success: false,
          message: "User already exist, try different nickname"
        });
      }

      const newRoomData = {
        ...roomData,
        players: [...players, nickName]
      };
      const data = RoomsCollection.doc(roomCode).set(newRoomData);
      return Promise.resolve({
        success: true,
        message: `Success registering user ${nickName} to room ${roomCode}`
      });
    },
    getAllUserInRoom: async ({ roomCode }) => {
      const doc = await RoomsCollection.doc(roomCode).get();
      const roomData = doc.data();
      const { players } = roomData;
      return players;
    },
    getAllTest: () => {
      TestCollection.get()
        .then(snapshot => {
          snapshot.forEach(doc => {
            // messages.chat1.push(doc.data());
            console.log(doc.id, "=>", doc.data());
          });
        })
        .catch(err => {
          console.log("Error getting documents", err);
        });
    }
  };
};

module.exports = {
  createDbConnection
};
