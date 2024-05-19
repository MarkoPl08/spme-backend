const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();

const SECRET_KEY = 'your_secret_key';

router.post('/verifyToken', (req, res) => {
    const { token } = req.body;

    if (!token) {
        return res.status(400).json({ isValid: false, message: "No token provided." });
    }

    jwt.verify(token, SECRET_KEY, (err, decoded) => {
        if (err) {
            return res.status(401).json({ isValid: false, message: "Invalid token." });
        }
        return res.json({ isValid: true, message: "Token is valid.", userId: decoded.userId });
    });
});

module.exports = router;
