const userLogic = require('../logic/usersLogic.js')

const express = require('express')
const userRouter = express.Router()

userRouter.route('/register')
          .post(userLogic.registerUser)

userRouter.route('/login')
          .post(userLogic.loginUser)

userRouter.route('/:user_id')
          .get(userLogic.getUserById)
          .put(userLogic.updateUser)
          .delete(userLogic.deleteUser)

module.exports = userRouter