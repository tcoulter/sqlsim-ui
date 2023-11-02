import * as Realm from "realm-web";
import SQLSim from "sqlsim";
import { Prisma } from "@prisma/client";

// Description of the full MongoDB object.
// Includes an _id (added by MongoDB), and an updated_at timestamp (added by us)
export type Document = {
  id: number,
  updated_at: Date
}

export interface Runs extends Document {
  slug: string,
  code: string,
  error: undefined | string,
  result: undefined | ReturnType<typeof SQLSim.run>["results"]
}

export type NewDocumentWithTimestamp<T extends Document> = Omit<T, "id">;
export type NewDocument<T extends Document> = Omit<NewDocumentWithTimestamp<T>, "updated_at">;


export async function initialize() {
  // Doing nothing here for prisma
}

export async function save(object:NewDocument<Runs>) {
  // We'll automatically set the timestamp. 
  let objectWithUpdatedTimestamp:NewDocumentWithTimestamp<Runs> = Object.assign({}, object, {
    updated_at: new Date()
  }) as NewDocumentWithTimestamp<Runs>;

  let response = await fetch("/db/runs/create", {
    method: "POST", 
    body: JSON.stringify(objectWithUpdatedTimestamp),
    headers: {
      "Content-Type": "application/json"
    }
  })

  return response.json();
}

export async function query(query:Prisma.RunsFindManyArgs):Promise<Array<Runs>> {
  let response = await fetch("/db/runs/query", {
    method: "POST", 
    body: JSON.stringify(query),
    headers: {
      "Content-Type": "application/json"
    }
  })

  return response.json();
}

export async function aggregate(query:Prisma.RunsAggregateArgs):Promise<Array<any>> {
  let response = await fetch("/db/runs/aggregate", {
    method: "POST", 
    body: JSON.stringify(query),
    headers: {
      "Content-Type": "application/json"
    }
  })

  return response.json();
}

export async function groupBy(query:Prisma.RunsGroupByArgs):Promise<Array<any>> {
  let response = await fetch("/db/runs/groupby", {
    method: "POST", 
    body: JSON.stringify(query),
    headers: {
      "Content-Type": "application/json"
    }
  })

  return response.json();
}

export async function count(query:Prisma.RunsCountArgs):Promise<Array<any>> {
  let response = await fetch("/db/runs/count", {
    method: "POST", 
    body: JSON.stringify(query),
    headers: {
      "Content-Type": "application/json"
    }
  })

  return response.json();
}