/*
    @TODO: 
        1. Don't return sensitive user details like email, password, etc.
        2. Make sure authentication checks are done at necessary points.
        3. Make sure user cannot update/delete others' profiles, only their own.
        4. Implement real login and register (secret env keys,auth tokens, hashes)
*/

const mongo = require('mongodb')
const dbConnection = require('../database/db.js')

const getUserById = async (req, res) => {
    const db = await dbConnection.connect()
    const received_user_id = mongo.ObjectId(req.params.id) 
    const result = await db.collection("users").findOne({ _id: received_user_id})
    
    delete result.email
    delete result.password

    return res.status(200).json(result)
}

const updateUser = async (req, res) => {
    let doc = req.body.data;
    delete doc._id;
    
    const id = mongo.ObjectId(req.params.id);
    const db = await dbConnection.connect()    
    const result = await db.collection("users").replaceOne({_id : id}, doc)

    if (result.modifiedCount == 1) 
        res.status(200).json({message: 'Successfully edited user.', id: result.InsertedId});
    else 
        res.status(400).json({message: 'Failed to edit user.'});
}

/* 
    Deleting a user doesn't delete their problems, solutions or reviews.
    
    In their problems we set status = 'buyer_acc_deleted' which signifies that
    they shouldn't be displayed at the Marketplace. They will still remain in
    solver's Problem Status tab if they had solved it.

    In their solutions and reviews, we do nothing because we don't want to hide
    their solutions and reviews from anywhere upon account deletion.
*/

const deleteUser = async (req, res) => {
    const id = req.params.id
    const db = await dbConnection.connect()
    const result = await db.collection("problems").deleteOne({_id : id})

    if (result.deletedCount == 1){
        const resultProblem = db.collection("problems").updateMany(
            {
                buyer_id:id,
                $set: {status: 'buyer_acc_deleted'}
            }
        )
        res.status(200).json({message: 'Successfully deleted problem.', id: result.InsertedId});
    }
    else 
        res.status(400).json({message: 'Failed to delete problem.'});
}

//AUTHENTICATION
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs');

const tokenSignature = payload => {
    return jwt.sign(payload, "random_key_change_later", {
        expiresIn: "2 days"
    })
}

const tokenCreation = (user, statusCode, res) => {
    const token = tokenSignature(user)
    const cookieOptions = {
        expires: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        httpOnly: true
    }
    res.cookie('jwt', token, cookieOptions)
    user.password = undefined

    return res.status(statusCode).json({
        status: 'success',
        token,
        data: {
            user
        }
    })
}

const isCorrectPassword = async (inputPassword, userPassword) => {
    return await bcrypt.compare(inputPassword, userPassword)
}
const validateEmail = (email) => {
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

const registerUser = async (req, res) => {
    try{
        const { username, password, email, account_type } = req.body.data
        if (!username || !password|| !email || !account_type)
            return res.status(400).json({ message: "Please enter all fields." })

        if (!validateEmail(email))
            return res.status(400).json({ message: "Email is invalid." })

        if(username.length < 4 ){
            return res.status(400).json({message: "Username must be at least 4 characters long."})
        }
        if (password.length < 6)
            return res.status(400).json({ message: "Password must be at least 6 characters long." })

        let user = {
            username: username,
            email: email,
            password: await bcrypt.hash(password, 12),
            account_type: account_type
        }

        const db = await dbConnection.connect()
        
        let userExists = await db.collection("users").findOne(
            {or : {email: user.email, username: user.username}}
        )
        if (userExists) return res.status(400).json({ message: "User already exists." })

        user.wallet_public_key = ''
        user.total_number_problems = 0
        user.approved_problems = 0

        const result = await db.collection("users").insertOne(user)

        if (result.insertedCount != 1) res.status(400).json({status: 'Failed to register.'});

        tokenCreation(user, 201, res)
    }
    catch(err){
        return res.status(500).json({message: "Internal server error."})
    }
}

const loginUser = async (req, res) => {
    try{
        const { username, password } = req.body.data
        if (!username) return res.status(400).json({ message: "Please enter username." })
        if (!password) return res.status(400).json({ message: "Please enter password." })
        
        const db = await dbConnection.connect()

        let foundUser = await db.collection("users").findOne({username: username})
        if (!foundUser) return res.status(400).json({ message: "Username doesn't exist." })

        if (!(await isCorrectPassword(password, foundUser.password)))
            return res.status(403).json({ message: "Password incorrect." })

        tokenCreation(foundUser, 200, res)
    }
    catch(err){
        return res.status(500).json({message: "Internal server error."})
    }
}

module.exports = {getUserById, updateUser, deleteUser, registerUser, loginUser}