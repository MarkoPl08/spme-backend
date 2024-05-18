const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('spme_db', 'root', 'admin', {
    host: 'localhost',
    dialect: 'mysql',
    logging: false, // turn off logging; set to console.log to enable it
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    }
});

// Test the connection
sequelize.authenticate()
    .then(() => {
        console.log('Connection has been established successfully.');
    })
    .catch(err => {
        console.error('Unable to connect to the database:', err);
    });

module.exports = sequelize;
