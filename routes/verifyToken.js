const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();

router.post('/verifyToken', (req, res) => {
    const { token } = req.body;

    if (!token) {
        return res.status(400).json({ isValid: false });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({ isValid: false });
        }

        res.json({ isValid: true });
    });
});

module.exports = router;
