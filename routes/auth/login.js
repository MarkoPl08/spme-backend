const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const {createStrategy} = require("./AuthStrategyFactory");
const loggingAspect = require('../../aspects/loggingAspect');
require('dotenv').config();
createStrategy('local');
router.post('/login', loggingAspect, (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        if (err) {
            console.error("Login error:", err);
            return res.status(500).json({error: 'Internal Server Error', details: err.message});
        }
        if (!user) {
            return res.status(400).json({message: info.message});
        }
        const token = jwt.sign(
            {userId: user.UserID, role: user.RoleID},
            process.env.JWT_SECRET,
            {expiresIn: '1h'}
        );

        return res.json({message: 'Logged in successfully', token});
    })(req, res, next);
});

module.exports = router;
