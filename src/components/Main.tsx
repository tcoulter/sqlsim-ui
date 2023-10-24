import React, { ReactElement, useEffect, useState } from "react";

import Container from "react-bootstrap/Container";
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import Editor, {useMonaco} from "@monaco-editor/react";

import SQLSim from "sqlsim";

type MainProps = {
  code:string,
  onChange:(code:string) => void,
  results:ReturnType<typeof SQLSim.run>|null,
  error: Error|string|undefined
}

function Main({code, onChange, results, error}:MainProps) {
  let monaco:ReturnType<typeof useMonaco>;
  monaco = useMonaco();

  const [isThemeLoaded, setIsThemeLoaded] = useState(false);
  const [output, setOutput] = useState<ReactElement|Array<ReactElement>>();

  useEffect(() => {
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
    }
  }, [monaco]);

  useEffect(() => {
    if (typeof error != "undefined") {
      setOutput(
        <table className="result-table">
          <tbody>
            <tr>
              <td style={{whiteSpace: "pre-wrap"}}>
                {typeof error != "string" ? error.message + "\n" + (error.stack || "") : error }
              </td>
            </tr>
          </tbody>
        </table>
      );
      return;
    }

    if (results != null) {
      let tableElements:Array<ReactElement> = [];

      results.results.forEach((value, resultIndex) => {
        if (Array.isArray(value)) {
          tableElements.push(
            <table key={"result" + resultIndex} className="result-table">
              <tbody>
                {value.map((row, rowIndex) => {
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

      setOutput(tableElements);
    }
  }, [results, error])

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
          {output}
        </Col>
      </Row>
    </Container>
  );
  
}

export default Main;
