const express = require('express');
const router = express.Router();
const { User, Photos} = require('../models');
const authenticateToken = require('../middlewares/authenticateToken');

const isAdmin = (req, res, next) => {
    if (!req.user) {
        return res.status(403).json({ message: 'Forbidden: Admins only' });
    }

    const userRole = req.user.role;

    if (userRole !== 1) {
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

router.delete('/photos/:photoId', authenticateToken, isAdmin, async (req, res) => {
    const { photoId } = req.params;
    try {
        const photo = await Photos.findByPk(photoId);
        if (!photo) {
            return res.status(404).json({ message: 'Photo not found' });
        }
        await photo.destroy();
        res.json({ message: 'Photo deleted successfully' });
    } catch (error) {
        console.error('Error deleting photo:', error);
        res.status(500).json({ message: 'Error deleting photo', error: error.message });
    }
});

module.exports = router;
