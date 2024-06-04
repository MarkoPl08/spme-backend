const express = require('express');
const router = express.Router();
const SubscriptionPackages = require('../models/SubscriptionPackages');
const User = require('../models/User');
const {map, pipe} = require('lodash/fp');

const asyncHandler = fn => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

const hoursSinceLastUpdate = (lastUpdate, now) => (now - new Date(lastUpdate)) / 36e5;

const validatePackageUpdate = (user, now) => {
    const lastUpdate = user.LastPackageUpdate;
    return lastUpdate ? hoursSinceLastUpdate(lastUpdate, now) >= 24 : true;
};

const updateUserPackage = (user, packageId, now) => ({
    ...user,
    PackageID: packageId,
    LastPackageUpdate: now,
});

const processUserData = (user, callback) => {
    return callback(user);
};

router.get('/packages', asyncHandler(async (req, res) => {
    const packages = await SubscriptionPackages.findAll();
    res.json(packages);
}));

router.post('/setPackage', asyncHandler(async (req, res) => {
    const {userId, packageId} = req.body;
    const user = await User.findByPk(userId);
    if (!user) {
        return res.status(404).json({message: 'User not found'});
    }

    const now = new Date();
    if (!validatePackageUpdate(user, now)) {
        return res.status(403).json({message: 'You can only change your package once every 24 hours'});
    }

    const updatedUser = processUserData(user, user => updateUserPackage(user, packageId, now));
    await User.update(updatedUser, {where: {id: userId}});

    res.json({message: 'Package updated successfully', user: updatedUser});
}));

router.get('/consumption/:userId', asyncHandler(async (req, res) => {
    const {userId} = req.params;
    const user = await User.findByPk(userId);
    if (!user) {
        return res.status(404).json({message: 'User not found'});
    }

    const subscriptionPackage = await SubscriptionPackages.findByPk(user.PackageID);
    if (!subscriptionPackage) {
        return res.status(404).json({message: 'Subscription package not found'});
    }

    res.json({
        uploadCount: user.UploadCount,
        storageUsed: user.StorageUsed,
        uploadLimit: subscriptionPackage.UploadLimit,
        storageLimit: subscriptionPackage.StorageLimit
    });
}));

router.post('/changePackage', asyncHandler(async (req, res) => {
    const {userId, newPackageId} = req.body;
    const user = await User.findByPk(userId);
    if (!user) {
        return res.status(404).json({message: 'User not found'});
    }

    const now = new Date();
    if (hoursSinceLastUpdate(user.updatedAt, now) < 24) {
        return res.status(403).json({message: 'You can only change your package once a day'});
    }

    const updatedUser = processUserData(user, user => updateUserPackage(user, newPackageId, now));
    await User.update(updatedUser, {where: {id: userId}});

    res.json({message: 'Package changed successfully', user: updatedUser});
}));

module.exports = router;
