const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
    UserID: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    Username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    Email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    PasswordHash: {
        type: DataTypes.CHAR(64),
        allowNull: false
    },
    RoleID: {
        type: DataTypes.INTEGER,
        references: {
            model: 'UserRoles',
            key: 'RoleID'
        }
    },
    PackageID: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    CreatedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    UpdatedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    LastPackageUpdate: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    tableName: 'Users',
    timestamps: false
});

module.exports = User;
