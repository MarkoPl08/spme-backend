const express = require('express');
const {createStrategy} = require("./AuthStrategyFactory");
const router = express.Router();

require('dotenv').config();

const googleStrategy = createStrategy('google');

router.post('/google', (req, res) => {
    googleStrategy.authenticate(req, res);
});

const githubStrategy = createStrategy('github');

router.post('/github', (req, res) => {
    githubStrategy.authenticate(req, res);
});


module.exports = router;
