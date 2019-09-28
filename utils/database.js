const createDbConnection = fireStore => {
  const RoomsCollection = fireStore.collection("rooms");
  const TestCollection = fireStore.collection("test");

  return {
    createNewRoom: () => {
      console.log("create Room here...");
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
