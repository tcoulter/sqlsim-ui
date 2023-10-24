import { MongoClient } from "mongodb";
const uri = "mongodb+srv://tim:wVMeL85jKioy8AQE@cluster0.cuesaye.mongodb.net/?retryWrites=true&w=majority";

const client = new MongoClient(uri);
import { CellData } from "sqlsim/storage/cell";

export type Instance = {
  slug: string;
  code: string;
}

export type Result = {
  error: undefined | string,
  data: undefined | Array<Array<CellData>>
}

export type Run = {
  runID: string,
  code: string,
  result: Result
}

export async function save<T>(collection_name:string, object:any, update_filter?:any) {
  const database = client.db("sqlsim-ui");
  const collection = database.collection<T>(collection_name);

  if (typeof update_filter == "undefined") {
    return collection.insertOne(object);
  } else {
    return collection.updateOne(update_filter, {
      $set: object
    })
  }
}

export async function load<T>(collection_name:string, find_filter:any, ) {
  const database = client.db("sqlsim-ui");
  const collection = database.collection<T>(collection_name);

  return collection.findOne(
    find_filter
    // {
    //   sort: { rating: -1 },
    //   projection: { _id: 0, title: 1, imdb: 1 },
    // }
  );
}