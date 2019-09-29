const shuffle = require("lodash/shuffle");

const createDbConnection = fireStore => {
  const RoomsCollection = fireStore.collection("rooms");
  const FactsCollection = fireStore.collection("facts");
  const PlayersCollection = fireStore.collection("players");

  return {
    createNewRoom: async ({ roomCode }) => {
      const doc = await RoomsCollection.doc(roomCode).get();
      if (!doc.exists) {
        const initialRoomData = {
          players: [],
          questions: {},
          answers: {},
          votes: {},
          questionIdx: 0,
          gameState: "IDDLE"
        };
        return RoomsCollection.doc(roomCode).set(initialRoomData);
      }
    },
    registerUserToRoom: async ({ roomCode, nickName }) => {
      const roomRef = RoomsCollection.doc(roomCode);
      const roomData = (await roomRef.get()).data();
      const { players } = roomData;

      if (players.includes(nickName)) {
        return Promise.resolve({
          success: false,
          message: "User already exist, try different nickname"
        });
      }

      const playerRef = PlayersCollection.doc(nickName);
      return fireStore
        .runTransaction(t => {
          return t
            .get(roomRef)
            .then(roomDoc => {
              const currRoomData = roomDoc.data();
              const newPlayers = [...currRoomData.players, nickName];
              t.update(roomRef, { players: newPlayers });
              return newPlayers.length;
            })
            .then(idx_in_room => {
              t.set(playerRef, {
                nickName: nickName,
                idx_in_room: idx_in_room
              });
            });
        })
        .then(result => {
          return Promise.resolve({
            success: true,
            message: `Success registering user ${nickName} to room ${roomCode}`
          });
        })
        .catch(err => {
          console.log("err in transaction", err);
          return Promise.resolve({
            success: false,
            message: `Failed registering user,`
          });
        });
    },
    getAllUserInRoom: async ({ roomCode }) => {
      const doc = await RoomsCollection.doc(roomCode).get();
      const roomData = doc.data();
      const { players } = roomData;
      return players;
    },
    initGameForRoom: async ({ limit, roomCode }) => {
      let updatedRoomData = {};
      const allFacts = [];
      const factDocs = await FactsCollection.get();
      factDocs.forEach(doc => allFacts.push(doc.data()));
      const facts = shuffle(allFacts).slice(0, limit);

      const roomRef = RoomsCollection.doc(roomCode);
      const roomDocs = await roomRef.get();
      const currRoomData = roomDocs.data();
      const nextQuestions = {};
      const nextAnswers = {};
      const nextVotes = {};
      facts.forEach((fact, idx) => {
        nextQuestions[idx] = {
          ...fact,
          answers: []
        };
        nextAnswers[idx] = [
          {
            owner: "SYSTEM",
            value: fact.answer,
            voter: []
          }
        ];
        nextVotes[idx] = [];
      });
      // avoid duplication
      if (Object.keys(currRoomData.questions).length === 0) {
        try {
          await roomRef.update({
            questions: nextQuestions,
            answers: nextAnswers,
            votes: nextVotes,
            gameState: "LYING"
          });

          // Get updated  room data & dispatch
          const doc = await RoomsCollection.doc(roomCode).get();
          updatedRoomData = doc.data();
        } catch (e) {
          console.log("error pas update ", e);
        }
      }

      return updatedRoomData;
    },
    getRoomData: async ({ roomCode }) => {
      const doc = await RoomsCollection.doc(roomCode).get();
      const roomData = doc.data();
      return roomData;
    },
    setRoomData: async ({ roomCode, key, value }) => {
      const roomRef = RoomsCollection.doc(roomCode);
      const roomData = await roomRef.update({ [key]: value });
      return roomData;
    },
    createAnswer: async ({ roomCode, nickName, value, questionIdx }) => {
      const roomRef = RoomsCollection.doc(roomCode);
      return fireStore
        .runTransaction(t => {
          return t.get(roomRef).then(roomDoc => {
            const currRoomData = roomDoc.data();
            // must refactor questions first
            const newAnswers = { ...currRoomData.answers };
            newAnswers[questionIdx] = [
              ...currRoomData.answers[questionIdx],
              {
                owner: nickName,
                value: value,
                voter: []
              }
            ];

            t.update(roomRef, { answers: newAnswers });
          });
        })
        .then(result => {
          return Promise.resolve({
            success: true,
            message: `Success submitting answer`
          });
        })
        .catch(err => {
          console.log("err in transaction", err);
          return Promise.resolve({
            success: false,
            message: `Failed submitting answer,`
          });
        });
    },
    chooseAnswer: async ({ answerIdx, questionIdx, roomCode, nickName }) => {
      const roomRef = RoomsCollection.doc(roomCode);
      return fireStore
        .runTransaction(t => {
          return t.get(roomRef).then(roomDoc => {
            const currRoomData = roomDoc.data();

            const newVoters = [
              ...currRoomData.answers[questionIdx][answerIdx].voter,
              nickName
            ];

            const newAnswers = { ...currRoomData.answers };

            newAnswers[questionIdx][answerIdx].voter = newVoters;

            const newVotes = { ...currRoomData.votes };
            newVotes[questionIdx] = [...newVotes[questionIdx], nickName];

            t.update(roomRef, { answers: newAnswers, votes: newVotes });
          });
        })
        .then(result => {
          return Promise.resolve({
            success: true,
            message: `Success submitting answer`
          });
        })
        .catch(err => {
          console.log("err in transaction", err);
          return Promise.resolve({
            success: false,
            message: `Failed submitting answer,`
          });
        });
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
