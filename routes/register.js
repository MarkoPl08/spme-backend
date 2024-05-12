const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const {Sequelize} = require("sequelize");
const router = express.Router();

router.post('/', async (req, res) => {
    const { username, email, password, role } = req.body;
    try {
        const existingUser = await User.findOne({
            where: {
                [Sequelize.Op.or]: [
                    { Username: username },
                    { Email: email }
                ]
            }
        });

        if (existingUser) {
            return res.status(400).json({ error: 'Username or email already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({
            Username: username,
            Email: email,
            PasswordHash: hashedPassword,
            RoleID: role
        });
        res.status(201).json({ message: 'User registered successfully', user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error registering new user', details: error.message });
    }
});


module.exports = router;
