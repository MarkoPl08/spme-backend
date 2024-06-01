const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const User = require('../../../models/User');

class LocalAuthStrategy {
    constructor() {
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
    }
}

module.exports = LocalAuthStrategy;
