const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');

const UserActions = sequelize.define('UserActions', {
    ActionID: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    UserID: {
        type: DataTypes.INTEGER,
        references: {
            model: User,
            key: 'UserID'
        }
    },
    ActionType: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    ActionDescription: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    ActionDateTime: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'UserActions',
    timestamps: false
});

module.exports = UserActions;
