/*
    @TODO: 
        1. Don't return sensitive user details like email, password, etc.
        2. Make sure authentication checks are done at necessary points.
        3. Make sure user cannot update/delete others' profiles, only their own.
        4. Implement real login and register (secret env keys,auth tokens, hashes)
*/

const getUserById = (req, res) => {
    const users = require('../mock_database/users.json')
    const foundUser = users.data.find(user => user.id == req.params.id)
    
    if(foundUser == undefined){
        return res.status(404).json({
            status: "fail",
            message: "User not found."
        })
    }
    return res.status(200).json(foundUser)    
}

const updateUser = (req, res) => {
    const users = require('../mock_database/users.json')
    const foundUserIndex = users.data.findIndex(user => user.id == req.params.id)

    if(foundUserIndex == -1){
        return res.status(404).json({
            status: "fail",
            message: "User not found."
        })
    }

    users.data[foundUserIndex] = req.body.data;
    let usersString = JSON.stringify(users)
    let fs = require("fs")
    fs.writeFile("src/mock_database/users.json", usersString, (err, result) => {})
    
    return res.status(200).json({
        status: "success"
    })
}

/* 
    Deleting a user doesn't delete their problems, solutions or reviews.
    
    In their problems we set status = 'buyer_acc_deleted' which signifies that
    they shouldn't be displayed at the Marketplace. They will still remain in
    solver's Problem Status tab if they had solved it.

    In their solutions and reviews, we do nothing because we don't want to hide
    their solutions and reviews from anywhere upon account deletion.
*/

const deleteUser = (req, res) => {
    let users = require('../mock_database/users.json')
    const foundUserIndex = users.data.findIndex(user => user.id == req.params.id)

    if(foundUserIndex == -1){
        return res.status(404).json({
            status: "fail",
            message: "User not found."   
        })
    }

    let problems = require('../mock_database/problems.json')

    problems.data = problems.data.map(problem => {
        if(problem.buyer_id == req.params.id){
            problem.status = "buyer_acc_deleted"
        }
        return problem
    })

    users.data.splice(foundUserIndex, 1)

    const problemsString = JSON.stringify(problems)
    let fs = require("fs")
    fs.writeFile("src/mock_database/problems.json", problemsString, (err, result) => {})
    
    const usersString = JSON.stringify(users)
    fs.writeFile("src/mock_database/users.json", usersString, (err, result) => {})

    return res.status(200).json({
        status: "success",
        message: "User successfully deleted."   
    })
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

        let users = require('../mock_database/users.json')
        
        let foundUser = users.data.find(user => user.email == email || user.username == username)
        
        if(foundUser != undefined){
            return res.status(400).json({message: "User with that email already exists."})
        }

        user.wallet_public_key = ''
        user.total_number_problems = 0
        user.approved_problems = 0

        users.data.push(user)
        let usersString = JSON.stringify(users)
        let fs = require("fs")
        fs.writeFile("src/mock_database/users.json", usersString, (err, result) => {})
    
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
        
        const users = require('../mock_database/users.json')
        const foundUser = users.data.find(user => user.username == username)

        if(foundUser == undefined){
            return res.status(404).json({
                status: "fail",
                message: "Username doesn't exist."
            })
        }
        
        if (!(await isCorrectPassword(password, foundUser.password)))
            return res.status(403).json({ message: "Password incorrect." })

        tokenCreation(foundUser, 200, res)
    }
    catch(err){
        return res.status(500).json({message: "Internal server error."})
    }
}

module.exports = {getUserById, updateUser, deleteUser, registerUser, loginUser}