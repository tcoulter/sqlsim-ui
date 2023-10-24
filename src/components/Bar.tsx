import React from "react";

import Container from "react-bootstrap/Container";
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { Button } from "react-bootstrap";

import { ChevronDown } from "react-bootstrap-icons";
import { CodeSlash } from "react-bootstrap-icons";
import { Fire } from "react-bootstrap-icons";
import { ArrowRepeat } from "react-bootstrap-icons";
import { HandThumbsUpFill } from "react-bootstrap-icons";

type BarProps = {
  loading: boolean,
  onRun:() => void
}

function Bar({loading, onRun}:BarProps) {
  return (
    <Container fluid className='bar'>
      <Row>
        <Col className="left">
          Code <CodeSlash/>
        </Col>
        <Col>
          <h1>SQLSim</h1>
        </Col>
        <Col className="right">
          <Button className={loading ? "loading" : "success"} variant={loading ? "warning" : "success"} size="sm">
            {!!loading && 
              <ArrowRepeat className="white"/>
            }
            {!loading && 
              <HandThumbsUpFill className="white"/>
            }
          </Button>

          <Button variant="light" size="sm">
            <span className="text">MYSQL</span>
            <ChevronDown className="stroke"/>
          </Button>

          <Button className="run" size="sm" onClick={onRun}>
            <span className="text">RUN</span> 
            <Fire />
          </Button>
        </Col>
      </Row>
    </Container>
  );
  
}

export default Bar;
