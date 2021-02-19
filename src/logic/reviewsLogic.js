const getReviewsBySolutionId = (req, res) => {
    const reviewFeedback = require('../mock_database/review_feedback.json')
    const foundReviews = reviewFeedback.data.filter(review => review.solution_id == req.params.solution_id) 
    return res.status(200).json({
        status: "success",
        data: foundReviews
    })
}

const postReview = (req, res) => {
    let review_feedback = require('../mock_database/review_feedback.json')
    review_feedback.data.push(req.body.data)

    let review_feedbackString = JSON.stringify(review_feedback)
    let fs = require("fs")
    fs.writeFile("src/mock_database/review_feedback.json", review_feedbackString, (err, result) => {})
    res.json({
        status: "success"
    })
}

const updateReview = (req, res) => {
    const reviewFeedback = require('../mock_database/review_feedback.json')
    const foundReviewIndex = reviewFeedback.data.findIndex(review => review.id == req.params.id)

    if(foundReviewIndex == -1){
        return res.json({
            status: "fail",
            message: "Review not found."
        })
    }

    reviewFeedback.data[foundReviewIndex] = req.body.data;
    let reviewString = JSON.stringify(reviewFeedback)
    let fs = require("fs")
    fs.writeFile("src/mock_database/review_feedback.json", reviewString, (err, result) => {})
    
    return res.json({
        status: "success"
    })
}

module.exports = {getReviewsBySolutionId, postReview, updateReview}