import * as Realm from "realm-web";
import SQLSim from "sqlsim";

const app = new Realm.App({ id: "application-0-nnuel" });

const DATA_SOURCE_NAME = "mongodb-atlas";
const DATABASE_NAME = "sqlsim-ui";

// Description of the full MongoDB object.
// Includes an _id (added by MongoDB), and an updated_at timestamp (added by us)
export type Document = {
  _id: any,
  updated_at: number
}

export interface Runs extends Document {
  slug: string,
  code: string,
  error: undefined | Error | string,
  result: undefined | ReturnType<typeof SQLSim.run>["results"]
}

export type NewDocumentWithTimestamp<T extends Document> = Omit<T, "_id">;
export type NewDocument<T extends Document> = Omit<NewDocumentWithTimestamp<T>, "updated_at">;


export async function initialize() {
  const credentials = Realm.Credentials.anonymous();
  return app.logIn(credentials);
}

export async function save<T extends Document>(collection_name:string, object:NewDocument<T>, update_filter?:any) {
  const mongo = app.currentUser.mongoClient(DATA_SOURCE_NAME);
  const database = mongo.db(DATABASE_NAME);

  const collection = database.collection<T>(collection_name);

  // We'll automatically set the timestamp. 
  let objectWithUpdatedTimestamp:NewDocumentWithTimestamp<T> = Object.assign({}, object, {
    updated_at: new Date().getTime()
  }) as NewDocumentWithTimestamp<T>;

  if (typeof update_filter == "undefined") {
    return collection.insertOne(objectWithUpdatedTimestamp);
  } else {
    return collection.updateOne(update_filter, {
      $set: objectWithUpdatedTimestamp
    })
  }
}

export function query<T extends Document>(collection_name:string) {
  const mongo = app.currentUser.mongoClient(DATA_SOURCE_NAME);
  const database = mongo.db(DATABASE_NAME);
  return database.collection<T>(collection_name);
}