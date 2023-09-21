import logo  from './logo.svg';
import './fonts/Lato/Lato-Regular.ttf';
import "bootstrap/scss/bootstrap.scss";
import './App.scss';

import Bar from "./components/Bar";
import Main from "./components/Main";
import { useState } from 'react';

import SQLSim from 'sqlsim';

function App() {
  let [code, setCode] = useState("");
  let [results, setResults] = useState<ReturnType<typeof SQLSim.run>|null>(null);

  function runCode() {
    let output = SQLSim.run(code);
    console.log(output);

    setResults(output);
  }  

  return (
    <div className="App">
      <Bar onRun={runCode}/>
      <Main onChange={setCode} results={results}/>
    </div>
  );
}

export default App;
