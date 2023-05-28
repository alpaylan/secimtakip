import React from 'react';
import Map from './components/Map';
import initialVoteData from './data/votedata.json';
import { Switch } from '@mui/material';


type CityVoteData = {
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

type VoteData = {
  data: Record<string, CityVoteData>;
};

function App() {
  const [useBallotBoxes, setUseBallotBoxes] = React.useState<boolean>(false);
  const [usePercentage, setUsePercentage] = React.useState<boolean>(false);
  const [voteData, setVoteData] = React.useState<VoteData>(initialVoteData);

  return (
    <div className="App">
      <Switch  defaultChecked />
      <Switch  defaultChecked color="secondary" />
      <Map />
    </div>
  );
}

export default App;
