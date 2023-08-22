const express = require('express');
const { default: helmet } = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const app = express();

// init middlewares
app.use(morgan("dev"))
app.use(helmet())
app.use(compression())
app.use(express.json())
app.use(express.urlencoded({
    extended: true
}))

// init db
require('./dbs/init.mongodb')
const { countConnect } = require('./helpers/check.connect')
countConnect()
// init routes
app.use('', require('./routes'))

// handle error
app.use((req, res, next) => {
    const error = new Error('Not Found')
    error.status = 404
    next(error)

})

app.use((error, req, res, next) => {
    const status = error.status | 500

    return res.status(status).json({
        status: 'error',
        code: status,
        message: error.message || 'Internal Server error',
    })

})


module.exports = app