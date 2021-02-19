const problemsLogic = require('../logic/problemsLogic')

const express = require('express')
const problemsRouter = express.Router()

problemsRouter.route('/')
              .get(problemsLogic.getAllProblems)
              .post(problemsLogic.postProblem)

problemsRouter.route('/:id')
              .put(problemsLogic.updateProblem)
              .delete(problemsLogic.deleteProblem)

// Gets all problems posted by 'buyer id'.
problemsRouter.route('/buyer/:buyer_id')
              .get(problemsLogic.getProblemsByBuyerId)

// Gets all problems solved by 'current solver id'.
problemsRouter.route('/solver/:current_solver_id')
               .get(problemsLogic.getProblemsByCurrentSolverId)

module.exports = problemsRouter