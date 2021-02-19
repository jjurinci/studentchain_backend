/*
    @TODO:
    Implement "getMarketplaceProblems" function that returns
    all problems with "status" == "unsolved" and "created_at_date" + "due_days"
    <= Date.now().
 */

const getAllProblems = (req, res) => {
    const problems = require('../mock_database/problems.json')
    return res.json(problems)
}

const getProblemsByBuyerId = (req, res) => {
    const problems = require('../mock_database/problems.json')
    const foundProblems = problems.data.filter(problem => problem.buyer_id == req.params.buyer_id)
    return res.status(200).json({
        status: "success",
        data: foundProblems
    })
}

const getProblemsByCurrentSolverId = (req, res) => {
    const problems = require('../mock_database/problems.json')
    const foundProblems = problems.data.filter(problem => problem.current_solver_id == req.params.current_solver_id)
    return res.status(200).json({
        status: "success",
        data: foundProblems
    })
}

const postProblem = (req, res) => {
    let problems = require('../mock_database/problems.json')
    problems.data.push(req.body.data)

    let problemsString = JSON.stringify(problems)
    let fs = require("fs")
    fs.writeFile("src/mock_database/problems.json", problemsString, (err, result) => {})
    res.json({
        status: "success"
    })
}

const updateProblem = (req, res) => {
    const problems = require('../mock_database/problems.json')
    const foundProblemIndex = problems.data.findIndex(problem => problem.id == req.params.id)

    if(foundProblemIndex == -1){
        return res.json({
            status: "fail",
            message: "Problem not found."
        })
    }

    problems.data[foundProblemIndex] = req.body.data;
    let problemString = JSON.stringify(problems)
    let fs = require("fs")
    fs.writeFile("src/mock_database/problems.json", problemString, (err, result) => {})
    
    return res.json({
        status: "success"
    })
}

const deleteProblem = (req, res) => {
    let problems = require('../mock_database/problems.json')
    const foundProblemIndex = problems.data.findIndex(problem => problem.id == req.params.id)

    if(foundProblemIndex == -1){
        return res.status(404).json({
            status: "fail",
            message: "Problem not found."   
        })
    }

    problems.data.splice(foundProblemIndex, 1)

    const problemsString = JSON.stringify(problems)
    let fs = require("fs")
    fs.writeFile("src/mock_database/problems.json", problemsString, (err, result) => {})
    
    return res.status(200).json({
        status: "success",
        message: "Problem successfully deleted."   
    })
}

module.exports = {getAllProblems, getProblemsByBuyerId, getProblemsByCurrentSolverId,
                  postProblem, updateProblem, deleteProblem}