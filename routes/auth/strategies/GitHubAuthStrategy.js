
const User = require('../../../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

class GitHubAuthStrategy {
    async fetchWithNodeFetch(url, options) {
        const fetch = (await import('node-fetch')).default;
        return fetch(url, options);
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
        const { code } = req.body;
        if (!code) {
            return res.status(400).json({ message: 'No code received from GitHub.' });
        }

        try {
            const tokenResponse = await this.fetchWithNodeFetch('https://github.com/login/oauth/access_token', {
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

            const userDataResponse = await this.fetchWithNodeFetch('https://api.github.com/user', {
                headers: {
                    'Authorization': `Bearer ${tokenData.access_token}`
                }
            });
            const userData = await userDataResponse.json();

            const user = await this.findOrCreateUser(userData.email || `${userData.login}@github.com`, userData.login);
            const jwtToken = this.generateJwtToken(user);

            res.json({
                message: "Login successful",
                user: {
                    UserID: user.UserID,
                    Username: user.Username,
                    Email: user.Email
                },
                token: jwtToken
            });
        } catch (error) {
            console.error('Failed to login with GitHub:', error);
            res.status(500).json({ message: "Internal server error", details: error.message });
        }
    }
}

module.exports = GitHubAuthStrategy;
