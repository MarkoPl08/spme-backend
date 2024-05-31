const express = require('express');
const router = express.Router();
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
require('dotenv').config();

passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
}, async (email, password, done) => {
    try {
        const user = await User.findOne({ where: { Email: email } });
        if (!user) {
            return done(null, false, { message: 'User not found' });
        }
        const isMatch = await bcrypt.compare(password, user.PasswordHash);
        if (!isMatch) {
            return done(null, false, { message: 'Incorrect password' });
        }
        return done(null, user);
    } catch (error) {
        return done(error);
    }
}));

router.post('/login', (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        if (err) {
            console.error("Login error:", err);
            return res.status(500).json({ error: 'Internal Server Error', details: err.message });
        }
        if (!user) {
            return res.status(400).json({ message: info.message });
        }
        const token = jwt.sign(
            { userId: user.UserID, role: user.RoleID },
            process.env.JWT_SECRET,  // Use the environment variable here
            { expiresIn: '1h' }
        );

        console.log("Generated JWT token:", token);

        return res.json({ message: 'Logged in successfully', token });
    })(req, res, next);
});

module.exports = router;
