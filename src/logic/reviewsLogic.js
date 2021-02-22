const dbConnection = require('../database/db.js')
const mongo = require('mongodb')

const getReviewsBySolutionId = async (req, res) => {
    const db = await dbConnection.connect()
    const received_solution_id = req.params.solution_id

    const cursor = await db.collection("reviews").find({ solution_id: received_solution_id})
    const results = await cursor.toArray()

    return res.status(200).json(results)
}

const postReview = async (req, res) => {
    const db = await dbConnection.connect()    
    const doc = req.body.data
    const result = await db.collection("reviews").insertOne(doc)

    if (result.insertedCount == 1){
        let problem_id = mongo.ObjectId(doc.problem_id)
        let status = (doc.approved) ? "approved" : "rejected"
        await db.collection("problems").updateOne(
            {_id : problem_id},
            {$set : {status : status}}
        ) 
        res.status(200).json({message: 'Successfully posted', id: result.insertedId});
    }
    else res.status(400).json({status: 'Failed to post.'});
}

const updateReview = async (req, res) => {
    let doc = req.body.data;
    delete doc._id;
    
    const id = mongo.ObjectId(req.params.id);
    const db = await dbConnection.connect()
    const result = await db.collection("reviews").replaceOne({_id: id}, doc)

    if (result.modifiedCount == 1) 
        res.status(200).json({message: 'Successfully edited review.', id: result.InsertedId});
    else 
        res.status(400).json({message: 'Failed to edit review.'});
}

module.exports = {getReviewsBySolutionId, postReview, updateReview}