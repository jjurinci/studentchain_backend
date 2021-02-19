const reviewsLogic = require('../logic/reviewsLogic')

const express = require('express')
const reviewsRouter = express.Router()

reviewsRouter.route('/')
             .post(reviewsLogic.postReview)

reviewsRouter.route('/:id')
             .put(reviewsLogic.updateReview)

reviewsRouter.route('/solution/:solution_id')
             .get(reviewsLogic.getReviewsBySolutionId)

module.exports = reviewsRouter