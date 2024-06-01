const { Sequelize } = require('sequelize');

// Singleton Pattern: Create a single instance of the Sequelize connection
const sequelize = new Sequelize('spme_db', 'root', 'root', {
    host: 'localhost',
    dialect: 'mysql',
    logging: false,
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    }
});

// Ensure the connection is established successfully
sequelize.authenticate()
    .then(() => {
        console.log('Connection has been established successfully.');
    })
    .catch(err => {
        console.error('Unable to connect to the database:', err);
    });

// Export the single instance of Sequelize
module.exports = sequelize;
