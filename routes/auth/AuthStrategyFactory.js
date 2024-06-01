const LocalStrategy = require('./strategies/LocalStrategy');
const GoogleStrategy = require('./strategies/GoogleAuthStrategy');
const GitHubStrategy = require('./strategies/GitHubAuthStrategy');

class AuthStrategyFactory {
    static createStrategy(type) {
        switch (type) {
            case 'local':
                return new LocalStrategy();
            case 'google':
                return new GoogleStrategy();
            case 'github':
                return new GitHubStrategy();
            default:
                throw new Error('Unknown strategy type');
        }
    }
}

module.exports = AuthStrategyFactory;
