import shuffle from "lodash/shuffle";

export const createSelector = roomDataState => {
  const {
    answers,
    votes,
    questions,
    players,
    gameState,
    questionIdx
  } = roomDataState;

  return {
    getSortedVotingScore: () => {
      const currAnswer = answers[questionIdx];
      const playerAnswers = currAnswer.filter(a => a.owner !== "SYSTEM");
      const systemAnswer = currAnswer.find(a => a.owner === "SYSTEM");
      const sortedPlayerAnswers = playerAnswers
        .filter(a => a.voter.length > 0)
        .sort((a1, a2) => a1.voter.length > a2.voter.length);
      return [...sortedPlayerAnswers, systemAnswer];
    },
    getWhoAlreadySubmitAnswer: () => {
      const currAnswer = answers[questionIdx];
      const owners = (currAnswer || []).map(a => a.owner);
      return [...new Set(owners)];
    },
    getWhoAlreadyVoted: () => {
      const voters = votes[questionIdx] || [];
      return [...new Set(voters)];
    },
    getQuestion: () => {
      return questions[questionIdx].question;
    },
    getAnswerList: () => {
      return shuffle(answers[questionIdx]).map(a => a.value);
    }
  };
};
