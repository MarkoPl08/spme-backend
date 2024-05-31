const jwt = require('jsonwebtoken');
require('dotenv').config();  // Add this line to load environment variables

function authenticateToken(req, res, next) {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];  // Bearer TOKEN

    if (token == null) {
        console.log("No token provided");
        return res.sendStatus(401);
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            console.log("Token verification failed:", err);
            return res.sendStatus(403);
        }
        console.log("Token verified, user:", user);
        req.user = user;
        next();
    });
}

module.exports = authenticateToken;
