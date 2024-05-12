const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const UserRoles = sequelize.define('UserRoles', {
    RoleID: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    RoleName: {
        type: DataTypes.STRING(50),
        allowNull: false
    }
}, {
    tableName: 'UserRoles',
    timestamps: false
});

module.exports = UserRoles;
