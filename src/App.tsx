import logo  from './logo.svg';
import * as n2b64 from "number-to-base64";
import './fonts/Lato/Lato-Regular.ttf';
import "bootstrap/scss/bootstrap.scss";
import './App.scss';

import Bar from "./components/Bar";
import Main from "./components/Main";
import { useEffect, useRef, useState } from 'react';

import SQLSim from 'sqlsim';

import * as db from "./db";
import { Instance, Result} from "./db";

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
  let [user, setUser] = useState<Realm.User|undefined>();
  let [slug, setSlug] = useState<string|undefined>(); 
  let [code, setCode] = useState<string|undefined>();
  let [results, setResults] = useState<ReturnType<typeof SQLSim.run>|null>(null);
  let [error, setError] = useState<Error|string|undefined>();
  let [loading, setLoading] = useState(false);

  function startRequest() {
    setLoading(true);
  }

  function endRequest() {
    setLoading(false);
  }
  
  // Initial kickoff 
  useEffect(() => {
    // Initialize the database
    startRequest()
    db.initialize().then((user) => {
      endRequest();
      setUser(user);
    }).catch((e) => {
      endRequest();
      throw e;
    });

    // Get the slug
    const {
      host, hostname, href, origin, pathname, port, protocol, search
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
    if (typeof slug == "undefined" || typeof user == "undefined") {
      return;
    }

    window.history.replaceState(null, slug, "/" + slug);

    // Now that the slug has been set, let's kick off data loading. 
    if (typeof slug != "undefined") {
      startRequest();
      db.load<Instance>("instances", {slug: slug}).then(async (result:Array<Instance>) => {
        endRequest();
        // If we got no result (e.g., this is a new instance)
        // then lets save it with some default code
        if (result.length == 0) {
          startRequest();
          await db.save<Instance>("instances", {
            slug: slug,
            code: DEFAULT_CODE
          }).then(() => {
            endRequest();
            setCode(DEFAULT_CODE);
          }).catch((e) => {
            endRequest();
            throw e;
          })
        } else {
          let instance = result[0];
          setCode(instance.code)
        }
      }).catch((e) => {
        endRequest();
        throw e;
      });
    }
  }, [slug, user])

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
      db.save<Instance>("instances", {
        slug: slug,
        code: code
      }, {
        slug: slug
      }),
      db.save<Result>("results", {
        result: typeof output != "undefined" ? output.results : undefined,
        error: error
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
      <Bar loading={loading} onRun={runCode}/>
      <Main code={code} onChange={setCode} error={error} results={results}/>
    </div>
  );
}

export default App;
