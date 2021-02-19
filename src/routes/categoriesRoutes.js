const categoriesLogic = require('../logic/categoriesLogic')

const express = require('express')
const categoriesRouter = express.Router()

categoriesRouter.route('/')
                .get(categoriesLogic.getAllCategories)

module.exports = categoriesRouter