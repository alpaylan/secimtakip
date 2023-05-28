import React from 'react';
import Map from './components/Map';
import initialVoteData from './data/votedata.json';
import { Switch } from '@mui/material';
import { VoteData } from './utils/types';


function App() {
  const [useBallotBoxes, setUseBallotBoxes] = React.useState<boolean>(false);
  const [usePercentage, setUsePercentage] = React.useState<boolean>(false);
  // const [voteData, setVoteData] = React.useState<VoteData>(initialVoteData);

  return (
    <div className="App">
      <Switch  defaultChecked />
      <Switch  defaultChecked color="secondary" />
      <Map mode="monochrome" monoChromeScheme='greyScale' splitScheme='separate' />
    </div>
  );
}

export default App;
