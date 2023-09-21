import React, { ReactElement, useEffect, useState } from "react";

import Container from "react-bootstrap/Container";
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import Editor, {useMonaco} from "@monaco-editor/react";

import SQLSim from "sqlsim";

const code = `-- create
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

type MainProps = {
  onChange:(code:string) => void,
  results:ReturnType<typeof SQLSim.run>|null
}

function Main({onChange, results}:MainProps) {
  let monaco:ReturnType<typeof useMonaco>;
  monaco = useMonaco();

  const [isThemeLoaded, setIsThemeLoaded] = useState(false);
  const [tables, setTables] = useState<Array<ReactElement>>();

  useEffect(() => {
    console.log(monaco)
    if (monaco && monaco) {
      monaco.editor.defineTheme('HitItLikeOneCompiler', {
        base: 'vs-dark',
        inherit: true,
        rules: [],
        colors: {
          'editor.background': '#121212',
        },
      });
      setIsThemeLoaded(true);

      // While we're here doing only one thing once, let's pass the
      // default code to onChange so that listeners have it on load.
      onChange(code);
    }
  }, [monaco]);

  useEffect(() => {
    if (results != null) {
      let tableElements:Array<ReactElement> = [];

      results.results.forEach((value, resultIndex) => {
        if (Array.isArray(value)) {
          tableElements.push(
            <table key={"result" + resultIndex} className="result-table">
              <tbody>
                {value.map((row, rowIndex) => {
                  console.log(row)
                  return <tr key={"result" + resultIndex + ":row" + rowIndex}>
                    {row.map((cell, cellIndex) => {
                      return <td key={"result" + resultIndex + ":row" + rowIndex + ":cell" + cellIndex}>
                        {cell}
                      </td>
                    })}
                  </tr>
                })}
              </tbody>
            </table>
          )
        }
      });

      setTables(tableElements);
    }
  }, [results])

  return (
    <Container fluid className='main'>
      <Row>
        <Col className="left">
          <Editor
            height="100%"
            language="sql"
            theme={isThemeLoaded ? "HitItLikeOneCompiler" : "vs-dark"}
            value={code}
            options={{
              overviewRulerLanes: 0,
              inlineSuggest: {
                enabled: true
              },
              minimap: {
                enabled: false
              }
              //wordWrap: "on"
            }}
            onChange={onChange}
          />
        </Col>
        <Col className="right">
          <h6>Output:</h6>
          {tables}
        </Col>
      </Row>
    </Container>
  );
  
}

export default Main;
