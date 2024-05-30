const express = require('express');
const router = express.Router();
const SubscriptionPackages  = require('../models/SubscriptionPackages');
const User  = require('../models/User');

router.get('/packages', async (req, res) => {
    try {
        const packages = await SubscriptionPackages.findAll();
        res.json(packages);
    } catch (error) {
        console.error('Error fetching packages:', error);
        res.status(500).json({ message: 'Error fetching packages', error: error.message });
    }
});

router.post('/setPackage', async (req, res) => {
    const { userId, packageId } = req.body;
    try {
        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const now = new Date();
        const lastUpdate = user.LastPackageUpdate;
        if (lastUpdate) {
            const hoursSinceLastUpdate = (now - new Date(lastUpdate)) / 36e5;
            if (hoursSinceLastUpdate < 24) {
                return res.status(403).json({ message: 'You can only change your package once every 24 hours' });
            }
        }

        user.PackageID = packageId;
        user.LastPackageUpdate = now;
        await user.save();

        res.json({ message: 'Package updated successfully', user });
    } catch (error) {
        console.error('Error updating package:', error);
        res.status(500).json({ message: 'Error updating package', error: error.message });
    }
});


// Track and update user’s consumption (mock example)
router.get('/consumption/:userId', async (req, res) => {
    const { userId } = req.params;
    try {
        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        // Mock data for consumption
        const consumption = {
            uploadCount: 10,
            storageUsed: 5000, // in MB
        };
        res.json({ user, consumption });
    } catch (error) {
        console.error('Error fetching consumption:', error);
        res.status(500).json({ message: 'Error fetching consumption', error: error.message });
    }
});

// Allow user to change package once a day (mock example)
router.post('/changePackage', async (req, res) => {
    const { userId, newPackageId } = req.body;
    try {
        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const lastChanged = user.updatedAt;
        const now = new Date();
        const hoursDiff = Math.abs(now - lastChanged) / 36e5;
        if (hoursDiff < 24) {
            return res.status(403).json({ message: 'You can only change your package once a day' });
        }
        user.packageId = newPackageId;
        await user.save();
        res.json({ message: 'Package changed successfully', user });
    } catch (error) {
        res.status(500).json({ message: 'Error changing package', error });
    }
});

module.exports = router;
