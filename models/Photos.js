const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');

const Photos = sequelize.define('Photos', {
    PhotoID: {
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
    PhotoPath: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    Description: {
        type: DataTypes.TEXT
    },
    Hashtags: {
        type: DataTypes.TEXT
    },
    UploadDateTime: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'Photos',
    timestamps: false
});

module.exports = Photos;
