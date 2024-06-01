const fs = require('fs');
const path = require('path');
const User = require('../models/User');

async function logAction(req, res, next) {
    const logDirPath = path.join(__dirname, '..', 'logs');
    const logFilePath = path.join(logDirPath, 'actions.log');

    if (!fs.existsSync(logDirPath)) {
        fs.mkdirSync(logDirPath, { recursive: true });
    }

    let logEntry;
    if (req.user) {
        try {
            const user = await User.findByPk(req.user.userId);
            if (user) {
                logEntry = `${new Date().toISOString()} - User: ${user.Username} (ID: ${req.user.userId}) - Action: ${req.method} ${req.originalUrl}\n`;
            } else {
                logEntry = `${new Date().toISOString()} - User: Unknown (ID: ${req.user.userId}) - Action: ${req.method} ${req.originalUrl}\n`;
            }
        } catch (error) {
            logEntry = `${new Date().toISOString()} - User: Error Fetching User Info (ID: ${req.user.userId}) - Action: ${req.method} ${req.originalUrl}\n`;
            console.error('Error fetching user info for logging:', error);
        }
    } else {
        logEntry = `${new Date().toISOString()} - User: Guest - Action: ${req.method} ${req.originalUrl}\n`;
    }

    fs.appendFile(logFilePath, logEntry, (err) => {
        if (err) {
            console.error('Error logging action:', err);
        }
    });

    next();
}

module.exports = logAction;
