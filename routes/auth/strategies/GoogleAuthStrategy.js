const User = require('../../../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

async function fetchWithNodeFetch(url, options) {
    const fetch = (await import('node-fetch')).default;
    return fetch(url, options);
}

class GoogleAuthStrategy {
    async validateGoogleToken(token) {
        const googleClientId = process.env.GOOGLE_CLIENT_ID;
        const url = `https://oauth2.googleapis.com/tokeninfo?id_token=${token}`;
        const response = await fetchWithNodeFetch(url);
        const data = await response.json();
        if (data.error_description) {
            throw new Error(`Token validation error: ${data.error_description}`);
        }
        if (data.aud !== googleClientId) {
            throw new Error('Token validation failed due to client ID mismatch.');
        }
        return data;
    }

    async findOrCreateUser(email, username) {
        let user = await User.findOne({ where: { Email: email } });
        if (!user) {
            user = await User.create({
                Username: username,
                Email: email,
                PasswordHash: bcrypt.hashSync('default_password', 10),
                RoleID: 2
            });
        }
        return user;
    }

    generateJwtToken(user) {
        return jwt.sign({ userId: user.UserID, email: user.Email }, process.env.JWT_SECRET, { expiresIn: '1h' });
    }

    async authenticate(req, res) {
        const { token } = req.body;
        try {
            const userData = await this.validateGoogleToken(token);
            const user = await this.findOrCreateUser(userData.email, userData.name);
            const jwtToken = this.generateJwtToken(user);
            res.json({
                message: "Token received and validated successfully",
                user: {
                    UserID: user.UserID,
                    Username: user.Username,
                    Email: user.Email
                },
                token: jwtToken
            });
        } catch (error) {
            console.error('Error in Google authentication:', error);
            res.status(401).json({ message: "Invalid token", details: error.message });
        }
    }
}

module.exports = GoogleAuthStrategy;
