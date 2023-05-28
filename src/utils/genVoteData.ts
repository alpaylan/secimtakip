
import { CityVoteData } from './types';

const generateVoteData : (cityName: string) => CityVoteData = (cityName: string) => {
    const totalNumberOfVotes = 1000;
    const countedVotes = Math.floor(Math.random() * totalNumberOfVotes);
    const votesForKK = Math.floor(Math.random() * countedVotes);
    const votesForRTE = Math.floor(Math.random() * (countedVotes - votesForKK));
    const invalidVotes = countedVotes - votesForKK - votesForRTE;
    const votesForKKPercentage = (votesForKK / (votesForKK + votesForRTE)) * 100;
    const votesForRTEPercentage = (votesForRTE / (votesForKK + votesForRTE)) * 100;
    const invalidVotesPercentage = (invalidVotes / (votesForKK + votesForRTE)) * 100;
    const totalNumberOfBallotBoxes = 50;
    const numberOfOpenedBallotBoxes = Math.floor(Math.random() * totalNumberOfBallotBoxes);

    return {
        cityName,
        totalNumberOfVotes,
        countedVotes,
        votesForKK,
        votesForRTE,
        invalidVotes,
        votesForKKPercentage,
        votesForRTEPercentage,
        invalidVotesPercentage,
        totalNumberOfBallotBoxes,
        numberOfOpenedBallotBoxes
    };
}

export default generateVoteData;