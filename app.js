const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const morgan = require('morgan');

const app = express();

dotenv.config({ path: "./config.env" });


if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

module.exports = app;