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
      db.aggregate({
        _count: {
          slug: true
        },
        where: {
          slug: slug
        }
      }),
      // All runs in the database
      db.aggregate({
        _count: {
          slug: true
        }
      }),
      // Get all slugs created
      db.groupBy({
        by: ['slug']
      }),
      // Total number of successful runs
      db.count({
        where: {
          result: {
            not: null
          }
        }
      }),
      // Total number of unsuccessful runs
      db.count({
        where: {
          error: {
            not: null
          }
        }
      }),
      // Unlike Mongo, to get all the table names, we have to do the processing locally
      // Which, honestly, is much easier to process mentally, but requires ALL the data
      // in the database to be passed to the app. That's generally a bad decision.  
      db.query({}).then((runs) => {
        let tableNames = runs.map((run) => {
          let matches = Array.from(run.code.matchAll(/CREATE\s+TABLE\s+([a-zA-Z\d]+)/gm))

          return matches.map((match) => {
            if (match.length >= 2) {
              return match[1];
            }
          })
        })
        return Array.from(new Set(tableNames.flat()).values());
      })
      
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
              <span className="title">Total runs for this playground ({slug}):</span> {results[0]._count.slug}
            </div>
            <div>
              <span className="title">Total runs for all playgrounds:</span> {results[1]._count.slug}
            </div>
            <div>
              <span className="title">Total successful runs for all playgrounds:</span> {results[3]}
            </div>
            <div>
              <span className="title">Total unsuccessful runs (errors) for all playgrounds:</span> {results[4]}
            </div>
            <div>
              <span className="title">All slugs:</span> {results[2].map((item:{slug: string}) => item.slug).sort().map((name:string) => {
                return <span key={name + "_span"}><a key={name + "_link"} href={"/" + name} target="_blank">{name}</a>,&nbsp;</span>
              })}
            </div>
            <div>
              <span className="title">All tables created:</span> {results[5].join(", ")}
            </div>
          </>
        }
       
      </Modal.Body>
    </Modal>
  );
}

export default StatsModal;