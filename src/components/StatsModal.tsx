import React, { useEffect, useState } from "react";
import Modal from 'react-bootstrap/Modal';
import { ClipboardData } from "react-bootstrap-icons";
import LoadingButton from "./LoadingButton";

import * as db from "../db";
import { Runs } from "../db";

type StatsModalProps = {
  slug: string,
  show: boolean
  onClose: () => void
}

function StatsModal({slug, show, onClose}:StatsModalProps) {
  let [loading, setLoading] = useState(show);
  let [results, setResults] = useState<Array<any>|undefined>();

  // Refresh data on show
  useEffect(() => {
    // No need to do anything when the modal changed to hidden
    if (show == false) {
      return;
    }

    setLoading(true);
    Promise.all([
      // All runs for the current slug
      db.query<Runs>("runs").count({
        slug: slug
      }),
      // All runs in the database
      db.query<Runs>("runs").count({}),
      // Number of distinct slugs created
      db.query<Runs>("runs").aggregate([
        { $group : { _id : "$slug" } }
      ]),

      // Total number of successful runs and total number of unsuccessful runs
      // (grouping by expression)
      db.query<Runs>("runs").aggregate([
        { 
          $group: {
           _id: {$not: {$eq: ["$error", null]}},
           count: {$count: {} },
          }
        }
      ]),
      // Distinct table names from all runs, building an aggregation pipeline
      // that searches for CREATE TABLE statements (case insensitive)
      // and then parses the names of the tables, all within the pipeline.
      db.query<Runs>("runs").aggregate([
        {
          $project:{
            code: 1,
            start: {$indexOfCP: [{$toUpper: "$code"}, "CREATE TABLE"]}
          }
        },
        {
          $project:{
            code: 1,
            start: {$indexOfCP: ["$code", " ", {$add: ["$start", 12]}]}
          }
        },
        {
          $project:{
            code: 1,
            start: 1,
            end: {$indexOfCP: ["$code", "(", "$start"]}
          }
        },
        {
          $project:{
            tableName: {
              $trim: {input: {$substr: ["$code", "$start", {$subtract: ["$end", "$start"]}]}}
            }
          }
        },
        {
          $group: {
            _id: "$tableName"
          }
        }
      ])
    ]).then((results) => {
      setLoading(false);
      setResults(results);
    }).catch((e) => {
      setLoading(false);
      throw e;
    })
  }, [show])

  return (
    <Modal
      size="lg"
      show={show}
      onHide={() => onClose()}
      aria-labelledby="stats-modal"
      className="stats-modal"
    >
      <Modal.Header closeButton>
        <Modal.Title id="stats-modal">
          <ClipboardData/>
          <span>Database Statistics</span>&nbsp;
          <LoadingButton loading={loading} size="sm"/>
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="body">
        {results && 
          <>
            <div>
              <span className="title">Total runs for this playground ({slug}):</span> {results[0]}
            </div>
            <div>
              <span className="title">Total runs for all playgrounds:</span> {results[1]}
            </div>
            <div>
              <span className="title">Total successful runs for all playgrounds:</span> {results[3][0].count}
            </div>
            <div>
              <span className="title">Total unsuccessful runs (errors) for all playgrounds:</span> {results[3][1].count}
            </div>
            <div>
              <span className="title">All slugs:</span> {results[2].map((item) => item._id).sort().map((name) => {
                return <span key={name + "_span"}><a key={name + "_link"} href={"/" + name} target="_blank">{name}</a>,&nbsp;</span>
              })}
            </div>
            <div>
              <span className="title">All tables created:</span> {results[4].map((item) => item._id).sort().join(", ")}
            </div>
          </>
           
        }
       
      </Modal.Body>
    </Modal>
  );
}

export default StatsModal;