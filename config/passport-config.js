const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: "http://localhost:3000/auth/google/callback"
    },
    async (accessToken, refreshToken, profile, cb) => {
        try {
            const user = await User.findOrCreate({
                where: { googleId: profile.id },
                defaults: {
                    googleId: profile.id,
                    email: profile.emails[0].value,
                    name: profile.displayName
                }
            });
            cb(null, user);
        } catch (err) {
            cb(err);
        }
    }
));
