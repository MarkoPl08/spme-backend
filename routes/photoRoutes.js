const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const User = require('../models/User');
const Photos = require('../models/Photos');
const SubscriptionPackages  = require('../models/SubscriptionPackages');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

const sharp = require('sharp');

router.post('/upload', upload.single('photo'), async (req, res) => {
    const { userId, description, hashtags, resizeWidth, resizeHeight, format } = req.body;
    const photoSize = req.file.size / (1024 * 1024);

    try {
        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const subscriptionPackage = await SubscriptionPackages.findByPk(user.PackageID);
        if (!subscriptionPackage) {
            return res.status(404).json({ message: 'Subscription package not found' });
        }

        if (user.UploadCount >= subscriptionPackage.UploadLimit) {
            return res.status(403).json({ message: 'Upload limit exceeded' });
        }

        if (user.StorageUsed + photoSize > subscriptionPackage.StorageLimit) {
            return res.status(403).json({ message: 'Storage limit exceeded' });
        }

        let processedImage = sharp(req.file.path);
        if (resizeWidth || resizeHeight) {
            processedImage = processedImage.resize(parseInt(resizeWidth), parseInt(resizeHeight));
        }

        const validFormats = ['jpeg', 'png', 'webp'];
        if (validFormats.includes(format)) {
            processedImage = processedImage.toFormat(format);
        } else {
            return res.status(400).json({ message: `Invalid format: ${format}` });
        }

        const processedPath = `uploads/processed-${req.file.filename}.${format}`;
        await processedImage.toFile(processedPath);

        user.UploadCount += 1;
        user.StorageUsed += photoSize;
        await user.save();

        const photo = await Photos.create({
            UserID: userId,
            PhotoPath: processedPath,
            Description: description,
            Hashtags: hashtags
        });

        res.json({ message: 'Photo uploaded successfully', photo });
    } catch (error) {
        console.error('Error uploading photo:', error);
        res.status(500).json({ message: 'Error uploading photo', error: error.message });
    }
});

module.exports = router;
