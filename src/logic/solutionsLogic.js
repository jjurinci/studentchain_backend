const getSolutionsByProblemId = (req, res) => {
    const solutions = require('../mock_database/solutions.json')
    const foundSolutions = solutions.data.filter(solution => solution.problem_id == req.params.problem_id)
    return res.status(200).json({
        status: "success",
        data: foundSolutions
    })
}

const getSolutionsBySolverId = (req, res) => {
    const solutions = require('../mock_database/solutions.json')
    const foundSolutions = solutions.data.filter(solution => solution.solver_id == req.params.solver_id)
    return res.status(200).json({
        status: "success",
        data: foundSolutions
    })
}

const postSolution = (req, res) => {
    let solutions = require('../mock_database/solutions.json')
    solutions.data.push(req.body.data)

    let solutionsString = JSON.stringify(solutions)
    let fs = require("fs")
    fs.writeFile("src/mock_database/solutions.json", solutionsString, (err, result) => {})
    res.json({
        status: "success"
    })
}

const updateSolution = (req, res) => {
    const solutions = require('../mock_database/solutions.json')
    const foundSolutionIndex = solutions.data.findIndex(solution => solution.id == req.params.id)

    if(foundSolutionIndex == -1){
        return res.json({
            status: "fail",
            message: "Solution not found."
        })
    }

    solutions.data[foundSolutionIndex] = req.body.data;
    let solutionString = JSON.stringify(solutions)
    let fs = require("fs")
    fs.writeFile("src/mock_database/solutions.json", solutionString, (err, result) => {})
    
    return res.json({
        status: "success"
    })
}

module.exports = {getSolutionsByProblemId, getSolutionsBySolverId,
                  postSolution, updateSolution}