import logo  from './logo.svg';
import * as n2b64 from "number-to-base64";
import './fonts/Lato/Lato-Regular.ttf';
import "bootstrap/scss/bootstrap.scss";
import './App.scss';

import Bar from "./components/Bar";
import Main from "./components/Main";
import { useEffect, useState } from 'react';

import SQLSim from 'sqlsim';

import * as db from "./db";
import {Instance} from "./db";

function createSlug() {
  return (n2b64.ntob(new Date().getTime()) as string).replace(/\//g, "_");
}

function App() {
  let [code, setCode] = useState<string|undefined>();
  let [results, setResults] = useState<ReturnType<typeof SQLSim.run>|null>(null);
  let [slug, setSlug] = useState<string|undefined>(); 


  const {
    host, hostname, href, origin, pathname, port, protocol, search
  } = window.location

  let givenSlug = pathname.replace(/\//g, "");

  if (typeof slug == "undefined") {
    if (givenSlug != "") {
      setSlug(givenSlug);
    } else {
      setSlug(createSlug());
    }
  }

  useEffect(() => {
    window.history.replaceState(null, slug, "/" + slug);

    // Now that the slug has been set, let's kick off data loading. 
    if (typeof slug != "undefined") {
      db.load<Instance>("instances", {slug: slug}).then((result) => {
        console.log(result);
      }).catch((e) => {
        throw e;
      });
    }
  }, [slug])

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
