const path = require('path');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');

const app = express();

app.enable('trust proxy')

app.use(helmet({
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: {
        allowOrigins: ['*'],
    },
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ['*'],
            scriptSrc: ["* data: 'unsafe-eval' 'unsafe-inline' blob:"],
        },
    },
})
);

if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

const limiter = rateLimit({
    max: 100,
    windowMs: 60 * 60 * 1000,
    message: 'Too many requests from this IP, please try again in an hour!'
});

app.use('/api', limiter);

app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

app.use(mongoSanitize());

app.use(xss());

app.use((req, res, next) => {
    req.requestTime = new Date().toISOString();
    console.log(req.cookies);
    next();
});

module.exports = app;