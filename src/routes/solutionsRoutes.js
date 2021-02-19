const solutionsLogic = require('../logic/solutionsLogic')

const express = require('express')
const solutionsRouter = express.Router()

solutionsRouter.route('/')
               .post(solutionsLogic.postSolution)

solutionsRouter.route('/:id')
               .put(solutionsLogic.updateSolution)


// Gets all solutions posted by 'solver id'.
solutionsRouter.route('/solver/:solver_id')
               .get(solutionsLogic.getSolutionsBySolverId)

// Gets all solutions inteded for 'problem id'
solutionsRouter.route('/problem/:problem_id')
               .get(solutionsLogic.getSolutionsByProblemId)

module.exports = solutionsRouter