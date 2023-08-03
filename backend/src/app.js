const express = require('express');
const { default: helmet } = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const app = express();

// init middlewares
app.use(morgan("dev"))
app.use(helmet())
app.use(compression())

// init db


// init routes


// handle error



module.exports = app