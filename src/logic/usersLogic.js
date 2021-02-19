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

const registerUser = (req, res) => {
    let users = require('../mock_database/users.json')
    users.data.push(req.body.data)

    let usersString = JSON.stringify(users)
    let fs = require("fs")
    fs.writeFile("src/mock_database/users.json", usersString, (err, result) => {})
    res.json({
        status: "success"
    })
}

const loginUser = (req, res) => {
    const users = require('../mock_database/users.json')
    
    const username = req.body.data.username
    const password = req.body.data.password

    const foundUser = users.data.find(user => user.username == username)

    if(foundUser == undefined){
        return res.status(404).json({
            status: "fail",
            message: "Username doesn't exist."
        })
    }

    if(foundUser.password != password){
        return res.status(401).json({
            status: "fail",
            message: "Password incorrect."
        })
    }

    return res.status(200).json({
        status: "success",
        message: "Successfully logged in."
    })
}

module.exports = {getUserById, updateUser, deleteUser, registerUser, loginUser}