const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const User = require('../models/User');
const Photo = require('../models/Photos');

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

router.post('/upload', upload.single('photo'), async (req, res) => {
    const { userId, description, hashtags } = req.body;
    const photoSize = req.file.size / (1024 * 1024); // Convert to MB

    try {
        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.UploadCount += 1;
        user.StorageUsed += photoSize;
        await user.save();

        const photo = await Photo.create({
            UserID: userId,
            PhotoPath: req.file.path,
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
