const dbConnection = require('../database/db.js')  

const getAllCategories = async (req, res) => {
    const db = await dbConnection.connect()
    const cursor = await db.collection("categories").find()
    const results = await cursor.toArray()

    return res.status(200).json(results)
}

module.exports = {getAllCategories}