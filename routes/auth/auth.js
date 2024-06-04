const express = require('express');
const {createStrategy} = require("./AuthStrategyFactory");
const router = express.Router();
const loggingAspect = require('../../aspects/loggingAspect');

require('dotenv').config();

const googleStrategy = createStrategy('google');

router.post('/google', loggingAspect, (req, res) => {
    googleStrategy.authenticate(req, res);
});

const githubStrategy = createStrategy('github');

router.post('/github', loggingAspect, (req, res) => {
    githubStrategy.authenticate(req, res);
});


module.exports = router;
