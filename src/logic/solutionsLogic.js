const getSolutionsByProblemId = (req, res) => {
    const solutions = require('../mock_database/solutions.json')
    let foundSolutions = solutions.data.filter(solution => solution.problem_id == req.params.problem_id)
    foundSolutions = foundSolutions.map(solution => populateSolution(solution))
    return res.status(200).json(foundSolutions)
}

const getSolutionsByMultipleProblemIds = (req, res) => {
    const solutions = require('../mock_database/solutions.json')
    
    const problem_ids = req.body.data
    const problem_id_included = {}
    for(id of problem_ids)
        problem_id_included[id] = true

    let foundSolutions = solutions.data.filter(solution => problem_id_included[solution.problem_id])
    foundSolutions = foundSolutions.map(solution => populateSolution(solution))
    return res.status(200).json(foundSolutions)
}

const getSolutionsBySolverId = (req, res) => {
    const solutions = require('../mock_database/solutions.json')
    let foundSolutions = solutions.data.filter(solution => solution.solver_id == req.params.solver_id)
    foundSolutions = foundSolutions.map(solution => populateSolution(solution))
    return res.status(200).json(foundSolutions)
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

const populateSolution = (solution) =>{
    const problems   = require('../mock_database/problems.json')
    const users      = require('../mock_database/users.json')
    const reviews    = require('../mock_database/review_feedback.json')

    solution.problem        = problems.data.find(problem => problem.id == solution.problem_id)
    solution.solver         = users.data.find(user => user.id == solution.solver_id)
    solution.reviews        = reviews.data.filter(review => review.id == solution.review_feedback_id)

    if(solution.current_solver)
        solution.current_solver.password = solution.current_solver.email  = undefined    
    
    const problemsLogic = require('../logic/problemsLogic.js')
    solution.problem = problemsLogic.populateProblem(solution.problem)
    
    return solution
}

module.exports = {getSolutionsByProblemId, getSolutionsByMultipleProblemIds,
                  getSolutionsBySolverId, postSolution, updateSolution}