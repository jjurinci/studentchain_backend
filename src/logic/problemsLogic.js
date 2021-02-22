/*
    @TODO:
    Implement "getMarketplaceProblems" function that returns
    all problems with "status" == "unsolved" and "created_at_date" + "due_days"
    <= Date.now().
 */
const mongo = require('mongodb')
const dbConnection = require('../database/db.js')  

const getAllProblems = async (req, res) => {
    const db = await dbConnection.connect()

    // Triple join for population of foreign keys
    const cursor = await db.collection("problems").aggregate([
        { $addFields: { "buyer_id":    { "$toObjectId": "$buyer_id" }}},
        { $addFields: { "category_id": { "$toObjectId": "$category_id" }}},
        { $addFields: { "current_solver_id":   { "$toObjectId": "$current_solver_id" }}},
        {
            $lookup: {
                from: 'users',
                localField: 'buyer_id',
                foreignField: '_id',
                as: 'buyer'
            },
        },
        { $unwind: {path: "$buyer", preserveNullAndEmptyArrays: true}},
        {
            $lookup: {
                from: 'users',
                localField: 'current_solver_id',
                foreignField: '_id',
                as: 'current_solver'
            },
        },
        { $unwind: {path: "$current_solver", preserveNullAndEmptyArrays: true}},
        {
            $lookup: {
                from: 'categories',
                localField: 'category_id',
                foreignField: '_id',
                as: 'category'
            }
        },
        { $unwind: {path: "$category", preserveNullAndEmptyArrays: true }},
    ])
    const results = await cursor.toArray()

    return res.status(200).json(results)
}

const getProblemById = async (req, res) => {
    const db = await dbConnection.connect()
    
    if(!mongo.ObjectId.isValid(req.params.id))
        return res.status(400).json({data: null})
    
    const id = mongo.ObjectId(req.params.id)

    const cursor = await db.collection("problems").aggregate([
        { $match: {_id: id} },
        { $addFields: { "buyer_id":    { "$toObjectId": "$buyer_id" }}},
        { $addFields: { "category_id": { "$toObjectId": "$category_id" }}},
        { $addFields: { "current_solver_id":   { "$toObjectId": "$current_solver_id" }}},
        {
            $lookup: {
                from: 'users',
                localField: 'buyer_id',
                foreignField: '_id',
                as: 'buyer'
            },
        },
        { $unwind: {path: "$buyer", preserveNullAndEmptyArrays: true}},
        {
            $lookup: {
                from: 'users',
                localField: 'current_solver_id',
                foreignField: '_id',
                as: 'current_solver'
            },
        },
        { $unwind: {path: "$current_solver", preserveNullAndEmptyArrays: true}},
        {
            $lookup: {
                from: 'categories',
                localField: 'category_id',
                foreignField: '_id',
                as: 'category'
            }
        },
        { $unwind: {path: "$category", preserveNullAndEmptyArrays: true }},
    ])

    let results = await cursor.toArray()

    if(results.length > 0){
        results = {data: results[0]}
        return res.status(200).json(results)
    }
    else return res.status(200).json({data: null})

}

const getProblemsByBuyerId = async (req, res) => {
    const db = await dbConnection.connect()
    
    const received_buyer_id = req.params.buyer_id

    const cursor = await db.collection("problems").aggregate([
        { $match: {buyer_id: received_buyer_id} },

        { $addFields: { "buyer_id":    { "$toObjectId": "$buyer_id" }}},
        { $addFields: { "category_id": { "$toObjectId": "$category_id" }}},
        { $addFields: { "current_solver_id":   { "$toObjectId": "$current_solver_id" }}},
        {
            $lookup: {
                from: 'users',
                localField: 'buyer_id',
                foreignField: '_id',
                as: 'buyer'
            },
        },
        { $unwind: {path: "$buyer", preserveNullAndEmptyArrays: true}},
        {
            $lookup: {
                from: 'users',
                localField: 'current_solver_id',
                foreignField: '_id',
                as: 'current_solver'
            },
        },
        { $unwind: {path: "$current_solver", preserveNullAndEmptyArrays: true}},
        {
            $lookup: {
                from: 'categories',
                localField: 'category_id',
                foreignField: '_id',
                as: 'category'
            }
        },
        { $unwind: {path: "$category", preserveNullAndEmptyArrays: true }},
    ])

    let results = await cursor.toArray()
    
    return res.status(200).json(results)
}

const getProblemsByCurrentSolverId = async (req, res) => {
    const db = await dbConnection.connect()

    const received_current_solver_id = req.params.current_solver_id

    const cursor = await db.collection("problems").aggregate([
        { $match: {current_solver_id: received_current_solver_id} },

        { $addFields: { "buyer_id":    { "$toObjectId": "$buyer_id" }}},
        { $addFields: { "category_id": { "$toObjectId": "$category_id" }}},
        { $addFields: { "current_solver_id":   { "$toObjectId": "$current_solver_id" }}},
        {
            $lookup: {
                from: 'users',
                localField: 'buyer_id',
                foreignField: '_id',
                as: 'buyer'
            },
        },
        { $unwind: {path: "$buyer", preserveNullAndEmptyArrays: true}},
        {
            $lookup: {
                from: 'users',
                localField: 'current_solver_id',
                foreignField: '_id',
                as: 'current_solver'
            },
        },
        { $unwind: {path: "$current_solver", preserveNullAndEmptyArrays: true}},
        {
            $lookup: {
                from: 'categories',
                localField: 'category_id',
                foreignField: '_id',
                as: 'category'
            }
        },
        { $unwind: {path: "$category", preserveNullAndEmptyArrays: true }},
    ])

    let results = await cursor.toArray()
    
    return res.status(200).json(results)
}

const postProblem = async (req, res) => {
    const db = await dbConnection.connect()
    const doc = req.body.data
    const result = await db.collection("problems").insertOne(doc)

    if (result.insertedCount == 1) res.status(200).json({message: 'Successfully posted',id: result.insertedId});
    else res.status(400).json({status: 'Failed to post.'});
}

const updateProblem = async (req, res) => {
    let doc = req.body.data;
    delete doc._id;
    
    const id = mongo.ObjectId(req.params.id);
    const db = await dbConnection.connect()    
    const result = await db.collection("problems").replaceOne({_id: id}, doc)

    if (result.modifiedCount == 1) 
        res.status(200).json({message: 'Successfully edited problem.', id: result.InsertedId});
    else 
        res.status(400).json({message: 'Failed to edit problem.'});
}

const deleteProblem = async (req, res) => {
    if(!mongo.ObjectId.isValid(req.params.id))
        return res.status(400).json({message: 'Failed to delete problem.'})

    const id = mongo.ObjectId(req.params.id)

    const db = await dbConnection.connect()
    const result = await db.collection("problems").deleteOne({_id : id})

    if (result.deletedCount == 1)
        res.status(200).json({message: 'Successfully deleted problem.', id: result.InsertedId});
    else 
        res.status(400).json({message: 'Failed to delete problem.'});
}

module.exports = {getAllProblems, getProblemById, getProblemsByBuyerId, getProblemsByCurrentSolverId,
                  postProblem, updateProblem, deleteProblem}