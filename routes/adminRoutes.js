const express = require('express');
const router = express.Router();
const { User } = require('../models');
const authenticateToken = require('../middlewares/authenticateToken');

const isAdmin = (req, res, next) => {
    console.log("Checking admin role...");
    if (!req.user) {
        console.log("No user found in request");
        return res.status(403).json({ message: 'Forbidden: Admins only' });
    }

    const userRole = req.user.role;
    console.log("User role:", userRole);

    if (userRole !== 1) { // Assuming role 1 is admin
        console.log("Forbidden: User is not an admin");
        return res.status(403).json({ message: 'Forbidden: Admins only' });
    }
    next();
};

router.use(authenticateToken);
router.use(isAdmin);

router.get('/users', async (req, res) => {
    try {
        const users = await User.findAll();
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching users', error });
    }
});

router.put('/users/:userId', async (req, res) => {
    const { userId } = req.params;
    const { username, email, packageId, roleId } = req.body;

    try {
        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.Username = username;
        user.Email = email;
        user.PackageID = packageId;
        user.RoleID = roleId;

        await user.save();
        res.json({ message: 'User updated successfully', user });
    } catch (error) {
        res.status(500).json({ message: 'Error updating user', error });
    }
});

module.exports = router;
