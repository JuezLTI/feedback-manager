const { MongoClient } = require('mongodb');
import 'regenerator-runtime/runtime'
//const uri = "mongodb+srv://root:root@cluster0.5l2i2.mongodb.net/myFirstDatabase?retryWrites=true&w//=majority";
const uri = 'mongodb://127.0.0.1:27017/?readPreference=primary&appname=MongoDB%20Compass&directConnection=true&ssl=false';
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
var collection
export async function db(callback) {
    // Use connect method to connect to the server
    client.connect(err => {
        collection = client.db("JUEZLTI").collection("feedback");
        console.log(collection)
        console.log('Connected successfully to server');
        callback()
    })

}
export async function insert(obj) {

    const insertResult = await collection.insert(obj);
    console.log(`Inserted `);
}

export async function insertMany(objs) {


    const insertResult = await collection.insertMany(objs);
    console.log(`Inserted documents =>  ${insertResult}`);
}

export async function findAll() {
    const findResult = await collection.find({}).toArray();
    console.log(`Found documents =>  ${findResult}`);

}
export async function findWithCriteria(obj) {
    const filteredDocs = await collection.find(obj).toArray();
    console.log(`Found documents`);
    return filteredDocs;

}

export async function update() {
    const updateResult = await collection.updateOne({ a: 3 }, { $set: { b: 1 } });
    console.log(`Updated documents => ${updateResult}`);

}
export async function remove() {
    const deleteResult = await collection.deleteMany({ a: 3 });
    console.log(`Deleted documents => ${deleteResult}`);

}
export async function removeAll() {
    const deleteResult = await collection.deleteMany({});
    console.log(`Deleted documents => ${deleteResult}`);

}

export function closeConnection() {
    client.close();

}