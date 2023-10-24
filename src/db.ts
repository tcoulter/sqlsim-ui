import * as Realm from "realm-web";
import SQLSim from "sqlsim";

const app = new Realm.App({ id: "application-0-nnuel" });

const DATA_SOURCE_NAME = "mongodb-atlas";
const DATABASE_NAME = "sqlsim-ui";

// For MongoDB so we can have correct typings
export type Document = {
  _id: string
}

// Our DB objects
export interface Instance extends Document {
  slug: string;
  code: string;
}

export interface Result extends Document {
  error: undefined | Error | string,
  data: undefined | ReturnType<typeof SQLSim.run>
}

export interface Run extends Document {
  runID: string,
  code: string,
  result: Result
}

export async function initialize() {
  const credentials = Realm.Credentials.anonymous();
  return app.logIn(credentials);
}

export async function save<T extends Document>(collection_name:string, object:any, update_filter?:any) {
  const mongo = app.currentUser.mongoClient(DATA_SOURCE_NAME);
  const database = mongo.db(DATABASE_NAME);

  const collection = database.collection<T>(collection_name);

  if (typeof update_filter == "undefined") {
    return collection.insertOne(object);
  } else {
    return collection.updateOne(update_filter, {
      $set: object
    })
  }
}

export async function load<T extends Document>(collection_name:string, find_filter:any, ) {
  const mongo = app.currentUser.mongoClient(DATA_SOURCE_NAME);
  const database = mongo.db(DATABASE_NAME);

  const collection = database.collection<T>(collection_name);

  return collection.find(
    find_filter
    // {
    //   sort: { rating: -1 },
    //   projection: { _id: 0, title: 1, imdb: 1 },
    // }
  );
}