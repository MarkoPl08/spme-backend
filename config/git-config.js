const {use} = require("passport");
const User = require('../models/User');
const GitHubStrategy = require('passport-github').Strategy;

use(new GitHubStrategy({
        clientID: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        callbackURL: "http://localhost:3000/auth/github/callback"
    },
    async (accessToken, refreshToken, profile, done) => {
        try {
            const [user, created] = await User.findOrCreate({
                where: { githubId: profile.id },
                defaults: {
                    githubId: profile.id,
                    name: profile.displayName,
                    email: profile.emails && profile.emails.length > 0 ? profile.emails[0].value : null
                }
            });
            done(null, user);
        } catch (error) {
            done(error);
        }
    }
));
