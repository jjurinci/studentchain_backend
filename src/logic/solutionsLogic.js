const mongo = require('mongodb')
const dbConnection = require('../database/db.js')  

const problemsLogic = require('./problemsLogic.js')
const usersLogic = require('./usersLogic.js')

const getSolutionsByProblemId = async (req, res) => {
    const db = await dbConnection.connect()
    
    
    const received_problem_id = req.params.problem_id
    
    // Triple join for population of foreign keys
    const cursor = await db.collection("solutions").aggregate([
        {$match: {problem_id: received_problem_id}},

        { $addFields: { "solver_id":    { "$toObjectId": "$solver_id" }}},
        { $addFields: { "review_id": { "$toObjectId": "$review_id" }}},
        { $addFields: { "problem_id":   { "$toObjectId": "$problem_id" }}},
        {
            $lookup: {
                from: 'users',
                localField: 'solver_id',
                foreignField: '_id',
                as: 'solvers'
            },
        },
        {
            $lookup: {
                from: 'reviews',
                localField: 'review_id',
                foreignField: '_id',
                as: 'reviews'
            },
        },
        {
            $lookup: {
                from: 'problems',
                localField: 'problem_id',
                foreignField: '_id',
                as: 'problem'
            }
        },
        { $unwind: {path: "$problem", preserveNullAndEmptyArrays: true }},
    ])

    let solutions = await cursor.toArray()
    return res.status(200).json(solutions)
}

const getSolutionsByMultipleProblemIds = async (req, res) => {
    const db = await dbConnection.connect()
    
    const cursor = await db.collection("problems").aggregate([
        { $addFields: { "current_solver_id":    { "$toObjectId": "$current_solver_id" }}},
        { $addFields: { "category_id": { "$toObjectId": "$category_id" }}},
        { $addFields: { "buyer_id":   { "$toObjectId": "$buyer_id" }}},
        {
            $lookup: {
                from: 'users',
                localField: 'current_solver_id',
                foreignField: '_id',
                as: 'solvers'
            },
        },
        {
            $lookup: {
                from: 'users',
                localField: 'buyer_id',
                foreignField: '_id',
                as: 'buyers'
            },
        },
        {
            $lookup: {
                from: 'categories',
                localField: 'category_id',
                foreignField: '_id',
                as: 'category'
            },
        },
        { $unwind: {path: "$category", preserveNullAndEmptyArrays: true }},
    ])

    const allProblems = await cursor.toArray()
    const problem_ids = req.body.data
    const problem_id_included = {}
    allProblems.forEach(problem => {
        if(problem_ids.includes(String(problem._id))) 
            problem_id_included[problem._id] = problem
    })

    const cursorSolutions = await db.collection("solutions").aggregate([
        { $addFields: { "solver_id":    { "$toObjectId": "$solver_id" }}},
        { $addFields: { "review_id": { "$toObjectId": "$review_id" }}},
        { $addFields: { "problem_id": { "$toObjectId": "$problem_id" }}},
        
        {
            $lookup : {
                from: 'users',
                localField: 'solver_id',
                foreignField: '_id',
                as: 'solver'
            },
        },
        {$unwind: {path: '$solver', preserveNullAndEmptyArrays: true}},
        {
            $lookup : {
                from: 'reviews',
                localField: 'review_id',
                foreignField: '_id',
                as: 'reviews'
            }
        },
        {
            $lookup : {
                from: 'problems',
                localField: 'problem_id',
                foreignField: '_id',
                as: 'problem'
            }
        },
        {$unwind: {path: '$problem', preserveNullAndEmptyArrays: true}},
    ])

    let allSolutions = await cursorSolutions.toArray()

    let foundSolutions = allSolutions.filter(solution => problem_id_included[solution.problem_id])
    
    foundSolutions = foundSolutions.map(solution => {
        solution.problem = problem_id_included[solution.problem_id]
        return solution
    })

    return res.status(200).json(foundSolutions)
}

const getSolutionsBySolverId = async (req, res) => {
    const db = await dbConnection.connect()

    const received_solver_id = req.params.solver_id

    const cursor = await db.collection("solutions").aggregate([
        {$match: {solver_id: received_solver_id}},

        { $addFields: { "solver_id":    { "$toObjectId": "$solver_id" }}},
        { $addFields: { "review_id": { "$toObjectId": "$review_id" }}},
        { $addFields: { "problem_id":   { "$toObjectId": "$problem_id" }}},
        {
            $lookup: {
                from: 'users',
                localField: 'solver_id',
                foreignField: '_id',
                as: 'solvers'
            },
        },
        {
            $lookup: {
                from: 'reviews',
                localField: 'review_id',
                foreignField: '_id',
                as: 'reviews'
            },
        },
        {
            $lookup: {
                from: 'problems',
                localField: 'problem_id',
                foreignField: '_id',
                as: 'problem'
            }
        },
        { $unwind: {path: "$problem", preserveNullAndEmptyArrays: true }},
    ])

    let solutions = await cursor.toArray()
    return res.status(200).json(solutions)
}

const postSolution = async (req, res) => {
    const db = await dbConnection.connect()    
    const doc = req.body.data
    const result = await db.collection("solutions").insertOne(doc)

    if (result.insertedCount == 1){
        let id = mongo.ObjectId(req.body.data.problem_id)
        const result = await db.collection("problems").updateOne(
            {_id: id},
            {$set: {status: 'sent_for_review'}}
        )

        res.status(200).json({message: 'Successfully posted', id: result.insertedId});
    }
    else res.status(400).json({status: 'Failed to post.'});
}

const updateSolution = async (req, res) => {
    let doc = req.body.data;
    delete doc._id;
    
    const id = mongo.ObjectId(req.params.id);
    const db = await dbConnection.connect()    
    const result = await db.collection("solutions").replaceOne({_id: id}, doc)

    if (result.modifiedCount == 1) 
        res.status(200).json({message: 'Successfully edited solution.', id: result.InsertedId});
    else 
        res.status(400).json({message: 'Failed to edit solution.'});
}

module.exports = {getSolutionsByProblemId, getSolutionsByMultipleProblemIds,
                  getSolutionsBySolverId, postSolution, updateSolution}