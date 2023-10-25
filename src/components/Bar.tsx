import React from "react";

import Container from "react-bootstrap/Container";
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { Button } from "react-bootstrap";

import LoadingButton from "./LoadingButton";

import { ClipboardData } from "react-bootstrap-icons";
import { CodeSlash } from "react-bootstrap-icons";
import { Fire } from "react-bootstrap-icons";


type BarProps = {
  loading: boolean,
  onRun:() => void
  onStats:() => void
}

function Bar({loading, onRun, onStats}:BarProps) {
  return (
    <Container fluid className='bar'>
      <Row>
        <Col className="left">
          MySQL <CodeSlash/>
        </Col>
        <Col>
          <h1>SQLSim</h1>
        </Col>
        <Col className="right">
          <LoadingButton loading={loading} size="sm"/>

          <Button variant="light" size="sm" onClick={onStats}>
            <span className="text">STATS</span>
            <ClipboardData />
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
