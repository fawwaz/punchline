const shuffle = require("lodash/shuffle");

const createDbConnection = fireStore => {
  const RoomsCollection = fireStore.collection("rooms");
  const FactsCollection = fireStore.collection("facts");

  return {
    createNewRoom: async ({ roomCode }) => {
      const doc = await RoomsCollection.doc(roomCode).get();
      if (!doc.exists) {
        const initialRoomData = {
          players: [],
          questions: []
        };
        return RoomsCollection.doc(roomCode).set(initialRoomData);
      }
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
    initGameForRoom: async ({ limit, roomCode }) => {
      const allFacts = [];
      const factDocs = await FactsCollection.get();
      factDocs.forEach(doc => allFacts.push(doc.data()));
      const facts = shuffle(allFacts).slice(0, limit);

      const roomDocs = await RoomsCollection.doc(roomCode).get();
      const currRoomData = roomDocs.data();
      const nextRoomData = {
        ...currRoomData,
        questions: facts,
        questionIdx: 0
      };
      // avoid duplication
      if (!currRoomData.questions || currRoomData.questions.length === 0) {
        await RoomsCollection.doc(roomCode).set(nextRoomData);
      }
    },
    getRoomData: async ({ roomCode }) => {
      const doc = await RoomsCollection.doc(roomCode).get();
      const roomData = doc.data();
      return roomData;
    },
    getAllTest: () => {
      // TestCollection.get()
      //   .then(snapshot => {
      //     snapshot.forEach(doc => {
      //       // messages.chat1.push(doc.data());
      //       console.log(doc.id, "=>", doc.data());
      //     });
      //   })
      //   .catch(err => {
      //     console.log("Error getting documents", err);
      //   });
    }
  };
};

module.exports = {
  createDbConnection
};
