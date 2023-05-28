
export type CityVoteData = {
    // city
    cityName: string;
    // votes
    totalNumberOfVotes: number;
    countedVotes: number;
    votesForKK: number;
    votesForRTE: number;
    invalidVotes: number;
    // ballot boxes
    totalNumberOfBallotBoxes: number;
    numberOfOpenedBallotBoxes: number;
    votesForKKPercentage: number;
    votesForRTEPercentage: number;
    invalidVotesPercentage: number;
};

export type VoteData = {
    name: string;
    data: CityVoteData;
}[];