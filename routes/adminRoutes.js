const express = require('express');
const router = express.Router();
const { User, Photos } = require('../models');
const authenticateToken = require('../middlewares/authenticateToken');
const loggingAspect = require('../aspects/loggingAspect');
const adminAspect = require('../aspects/adminAspect');

router.use(authenticateToken);

router.get('/users', adminAspect,loggingAspect, async (req, res) => {
    try {
        const users = await User.findAll();
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching users', error });
    }
});

router.put('/users/:userId', adminAspect, loggingAspect, async (req, res) => {
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

router.delete('/photos/:photoId', adminAspect, loggingAspect, async (req, res) => {
    const { photoId } = req.params;
    try {
        const photo = await Photos.findByPk(photoId);
        if (!photo) {
            return res.status(404).json({ message: 'Photo not found' });
        }
        await photo.destroy();
        res.status(200).json({ message: 'Photo deleted successfully' });
    } catch (error) {
        console.error('Error deleting photo:', error);
        res.status(500).json({ message: 'Error deleting photo', error: error.message });
    }
});

module.exports = router;
