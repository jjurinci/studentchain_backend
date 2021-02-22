require('dotenv').config()

const mongo = require("mongodb")
const connection_string = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.4sohy.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`
let client = new mongo.MongoClient(connection_string, {useNewUrlParser: true,useUnifiedTopology: true})

let db = null

const connect = () => {
    return new Promise((resolve, reject) => {
        if (db && client.isConnected()) resolve(db)
        else {
            client.connect(err => {
                if (err) reject("Connection failed:" + err)
                else {
                    console.log("Database connected successfully!");
                    db = client.db(process.env.DB_NAME);
                    resolve(db);
                }
            });
        }
    });
}

module.exports = {connect}