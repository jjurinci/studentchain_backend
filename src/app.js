const express = require('express')

const app = express()
const port = 3000

const cors = require('cors');
app.use(cors());

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

app.listen(port, () => { console.log(`Listening at port ${port}`)})
app.get('/', (req, res) => {res.send('Hello world')})

/*
    @TODO:
        1. Check and evaluate request body before saving it to mock DB.
        2. Setup constraints where they make sense (e.g. min. 6 characters for password)
 */

const usersRouter      = require('./routes/usersRoutes.js')
const problemsRouter   = require('./routes/problemsRoutes.js')
const solutionsRouter  = require('./routes/solutionsRoutes.js')
const reviewsRouter    = require('./routes/reviewsRoutes.js')
const categoriesRouter = require('./routes/categoriesRoutes.js')

app.use('/users', usersRouter)
app.use('/problems', problemsRouter)
app.use('/solutions', solutionsRouter)
app.use('/reviews', reviewsRouter)
app.use('/categories', categoriesRouter)