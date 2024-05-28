const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const fetch = require('node-fetch');
const User = require('../models/User'); // Adjust the path as necessary
require('dotenv').config();

async function validateGoogleToken(token) {
    const googleClientId = process.env.GOOGLE_CLIENT_ID;
    const url = `https://oauth2.googleapis.com/tokeninfo?id_token=${token}`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        if (data.error_description) {
            throw new Error(`Token validation error: ${data.error_description}`);
        }
        if (data.aud !== googleClientId) {
            throw new Error('Token validation failed due to client ID mismatch.');
        }
        return data;
    } catch (error) {
        console.error('Error validating Google token:', error);
        throw error;
    }
}

async function findOrCreateUser(email, username) {
    try {
        let user = await User.findOne({ where: { Email: email } });
        if (!user) {
            user = await User.create({
                Username: username,
                Email: email,
                PasswordHash: bcrypt.hashSync('default_password', 10) // Default password should be changed by user
            });
        }
        return user;
    } catch (error) {
        console.error('Error finding or creating user:', error);
        throw error;
    }
}

// Google Authentication Route
router.post('/google', async (req, res) => {
    const { token } = req.body;
    try {
        const userData = await validateGoogleToken(token);
        const user = await findOrCreateUser(userData.email, userData.name);
        const jwtToken = jwt.sign({ id: user.UserID }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({
            message: "Token received and validated successfully",
            token: jwtToken,
            user: {
                UserID: user.UserID,
                Username: user.Username,
                Email: user.Email
            }
        });
    } catch (error) {
        res.status(401).json({ message: "Invalid token" });
    }
});

// GitHub Authentication Route
router.post('/github', async (req, res) => {
    const { code } = req.body;

    if (!code) {
        return res.status(400).json({ message: 'No code received from GitHub.' });
    }

    try {
        const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                client_id: process.env.GITHUB_CLIENT_ID,
                client_secret: process.env.GITHUB_CLIENT_SECRET,
                code,
            }),
        });
        const tokenData = await tokenResponse.json();

        if (!tokenData.access_token) {
            return res.status(401).json({ message: 'GitHub did not return an access token.' });
        }

        const userDataResponse = await fetch('https://api.github.com/user', {
            headers: {
                'Authorization': `Bearer ${tokenData.access_token}`
            }
        });
        const userData = await userDataResponse.json();

        const user = await findOrCreateUser(userData.email || `${userData.login}@github.com`, userData.login);
        const jwtToken = jwt.sign({ id: user.UserID }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.json({
            message: "Login successful",
            token: jwtToken,
            user: {
                UserID: user.UserID,
                Username: user.Username,
                Email: user.Email
            }
        });
    } catch (error) {
        console.error('Failed to login with GitHub:', error);
        res.status(500).json({ message: "Internal server error", details: error.message });
    }
});

module.exports = router;
