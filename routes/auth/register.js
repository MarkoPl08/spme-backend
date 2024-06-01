const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../../models/User');
const { Sequelize } = require("sequelize");
const router = express.Router();

router.post('/register', async (req, res) => {
    const { username, email, password, packageId } = req.body;
    const roleId = 2;

    try {
        if (!username || !email || !password || !packageId) {
            console.error('Missing required fields');
            return res.status(400).json({ error: 'All fields are required' });
        }

        const existingUser = await User.findOne({
            where: {
                [Sequelize.Op.or]: [
                    { Username: username },
                    { Email: email }
                ]
            }
        });

        if (existingUser) {
            console.error('Username or email already exists');
            return res.status(400).json({ error: 'Username or email already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({
            Username: username,
            Email: email,
            PasswordHash: hashedPassword,
            RoleID: roleId,
            PackageID: packageId
        });
        res.status(201).json({ message: 'User registered successfully', user });
    } catch (error) {
        console.error('Error during registration:', error);
        res.status(500).json({ error: 'Error registering new user', details: error.message });
    }
});

module.exports = router;
