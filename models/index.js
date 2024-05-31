const sequelize = require('../config/database');
const User = require('./User');
const Photos = require('./Photos');
const UserRoles = require('./UserRoles');

User.hasMany(Photos, { foreignKey: 'UserID' });
Photos.belongsTo(User, { foreignKey: 'UserID' });

module.exports = {
    User,
    Photos,
    UserRoles
};
