import logo  from './logo.svg';
import * as n2b64 from "number-to-base64";
import './fonts/Lato/Lato-Regular.ttf';
import "bootstrap/scss/bootstrap.scss";
import './App.scss';

import Bar from "./components/Bar";
import Main from "./components/Main";
import StatsModal from "./components/StatsModal";
import { useEffect, useState } from 'react';

import SQLSim from 'sqlsim';

import * as db from "./db";
import { Runs } from "./db";

const DEFAULT_CODE = `-- create
CREATE TABLE Employees (
    id INTEGER,
    mgr_id INTEGER,
    name TEXT NOT NULL,
    dept TEXT NOT NULL,
    salary INTEGER
);

-- insert
INSERT INTO Employees VALUES (0001, NULL, 'Ava', 'Sales', 300000);        -- Chief Sales Officer
INSERT INTO Employees VALUES (0002, NULL, 'Dave', 'Accounting', 270000);  -- Chief Financial Officer
INSERT INTO Employees VALUES (0003, 0001, 'Clark', 'Sales', 160000);      -- Middle manager
INSERT INTO Employees VALUES (0004, 0002, 'Bob', 'Accounting', 165000);   -- Middle manager
INSERT INTO Employees VALUES (0005, 0003, 'Derek', 'Sales', 20000);       -- Intern
INSERT INTO Employees VALUES (0006, 0004, 'Julie', 'Accounting', 72000);  -- Individual contributor

-- correlated subquery
SELECT name, dept, salary
FROM Employees AS e
WHERE salary >= (
    SELECT AVG(salary)
    FROM Employees
    WHERE dept = e.dept
)
ORDER BY name;`;

function createSlug() {
  return (n2b64.ntob(new Date().getTime()) as string).replace(/\//g, "_");
}

function App() {
  let [slug, setSlug] = useState<string|undefined>(); 
  let [code, setCode] = useState<string|undefined>();
  let [results, setResults] = useState<ReturnType<typeof SQLSim.run>|null>(null);
  let [error, setError] = useState<Error|string|undefined>();
  let [loading, setLoading] = useState(false);
  let [showStatsModal, setShowStatsModal] = useState(false);

  function startRequest() {
    setLoading(true);
  }

  function endRequest() {
    setLoading(false);
  }
  
  // Initial kickoff 
  useEffect(() => {
    // Get the slug
    const {
      pathname
    } = window.location
  
    let givenSlug = pathname.replace(/\//g, "");

    if (givenSlug != "") {
      setSlug(givenSlug);
    } else {
      setSlug(createSlug());
    }
  }, []);

  useEffect(() => {
    // Don't move forward until we have both items.
    if (typeof slug == "undefined") {
      return;
    }

    window.history.replaceState(null, slug, "/" + slug);

    // Now that the slug has been set, let's kick off data loading. 
    if (typeof slug != "undefined") {
      startRequest();
      db.query({
        where: {
          slug: slug
        },
        orderBy: {
          updated_at: "desc"
        },
        take: 1
      }).then((runs:Runs[]) => {
        endRequest();

        let run = runs[0] || null;

        // If we got no result (e.g., this is a new instance)
        // then lets just use the default code
        if (run == null) {
          setCode(DEFAULT_CODE);
        } else {
          setCode(run.code)
        }
      }).catch((e) => {
        endRequest();
        throw e;
      });
    }
  }, [slug])

  function runCode() {
    let error:Error|undefined;
    let output:ReturnType<typeof SQLSim.run>|undefined;

    try {
      output = SQLSim.run(code);
    } catch (e) {
      error = e;
    }

    setResults(output);
    setError(error);

    // We'll save data asynchronously, 
    // but perfrom the requests 
    startRequest();
    Promise.all([
      db.save({
        slug, 
        code,
        result: typeof output != "undefined" ? output.results : undefined,
        error: error instanceof Error ? JSON.parse(JSON.stringify(error.toString())) : error
      })
    ]).then(() => {
      endRequest();
    }).catch((e) => {
      endRequest();
      throw e;
    });
  }  

  return (
    <div className="App">
      <Bar loading={loading} onRun={runCode} onStats={() => {setShowStatsModal(true)}}/>
      <Main code={code} onChange={setCode} error={error} results={results}/>
      <StatsModal show={showStatsModal} slug={slug} onClose={() => {setShowStatsModal(false)}}/>
    </div>
  );
}

export default App;
