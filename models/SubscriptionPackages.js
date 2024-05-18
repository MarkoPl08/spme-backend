const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const SubscriptionPackages = sequelize.define('SubscriptionPackages', {
    PackageID: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    PackageName: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    Price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    UploadLimit: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    StorageLimit: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    Features: {
        type: DataTypes.TEXT,
        allowNull: false
    }
}, {
    tableName: 'SubscriptionPackages',
    timestamps: false
});

module.exports = SubscriptionPackages;
