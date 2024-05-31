const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const {Photos, User} = require('../models');
const SubscriptionPackages = require('../models/SubscriptionPackages');
const {Op} = require('sequelize');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({storage: storage});

const sharp = require('sharp');

router.post('/upload', upload.single('photo'), async (req, res) => {
    const {userId, description, hashtags, resizeWidth, resizeHeight, format} = req.body;
    const originalFilePath = req.file.path;
    const photoSize = req.file.size / (1024 * 1024);

    try {
        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({message: 'User not found'});
        }

        const subscriptionPackage = await SubscriptionPackages.findByPk(user.PackageID);
        if (!subscriptionPackage) {
            return res.status(404).json({message: 'Subscription package not found'});
        }

        if (user.UploadCount >= subscriptionPackage.UploadLimit) {
            return res.status(403).json({message: 'Upload limit exceeded'});
        }

        if (user.StorageUsed + photoSize > subscriptionPackage.StorageLimit) {
            return res.status(403).json({message: 'Storage limit exceeded'});
        }

        let processedImage = sharp(req.file.path);
        if (resizeWidth || resizeHeight) {
            processedImage = processedImage.resize(parseInt(resizeWidth), parseInt(resizeHeight));
        }

        const validFormats = ['jpeg', 'png', 'webp'];
        if (validFormats.includes(format)) {
            processedImage = processedImage.toFormat(format);
        } else {
            return res.status(400).json({message: `Invalid format: ${format}`});
        }

        const processedPath = `uploads/processed-${req.file.filename}.${format}`;
        await processedImage.toFile(processedPath);

        user.UploadCount += 1;
        user.StorageUsed += photoSize;
        await user.save();

        const photo = await Photos.create({
            UserID: userId,
            PhotoPath: processedPath,
            OriginalPhotoPath: originalFilePath,
            Description: description,
            Hashtags: hashtags
        });

        res.json({message: 'Photo uploaded successfully', photo});
    } catch (error) {
        console.error('Error uploading photo:', error);
        res.status(500).json({message: 'Error uploading photo', error: error.message});
    }
});

router.get('/all', async (req, res) => {
    try {
        const photos = await Photos.findAll({
            include: {
                model: User,
                attributes: ['Username']
            }
        });
        res.json(photos);
    } catch (error) {
        console.error('Error fetching photos:', error);
        res.status(500).json({message: 'Error fetching photos', error: error.message});
    }
});

router.put('/update/:photoId', async (req, res) => {
    const {photoId} = req.params;
    const {description, hashtags} = req.body;

    try {
        const photo = await Photos.findByPk(photoId);
        if (!photo) {
            return res.status(404).json({message: 'Photo not found'});
        }

        photo.Description = description || photo.Description;
        photo.Hashtags = hashtags || photo.Hashtags;
        await photo.save();

        res.json({message: 'Photo updated successfully', photo});
    } catch (error) {
        console.error('Error updating photo:', error);
        res.status(500).json({message: 'Error updating photo', error: error.message});
    }
});

router.post('/search', async (req, res) => {
    const {description, hashtags, startDate, endDate, username} = req.body;
    let where = {};

    if (description) {
        where.Description = {[Op.like]: `%${description}%`};
    }
    if (hashtags) {
        where.Hashtags = {[Op.like]: `%${hashtags}%`};
    }
    if (startDate && endDate) {
        where.UploadDateTime = {[Op.between]: [new Date(startDate), new Date(endDate)]};
    }

    try {
        const photos = await Photos.findAll({
            where,
            include: [
                {
                    model: User,
                    attributes: ['Username'],
                    where: username ? {Username: {[Op.like]: `%${username}%`}} : {},
                }
            ]
        });
        res.json(photos);
    } catch (error) {
        console.error('Error searching photos:', error);
        res.status(500).json({message: 'Error searching photos', error: error.message});
    }
});

router.get('/download/original/:photoId', async (req, res) => {
    const {photoId} = req.params;
    try {
        const photo = await Photos.findByPk(photoId);
        if (!photo) {
            return res.status(404).json({message: 'Photo not found'});
        }

        const filePath = path.join(__dirname, '..', photo.OriginalPhotoPath);  // Use the original file path
        res.download(filePath, (err) => {
            if (err) {
                console.error('Error downloading original photo:', err);
                res.status(500).json({message: 'Error downloading original photo', error: err.message});
            }
        });
    } catch (error) {
        console.error('Error fetching photo:', error);
        res.status(500).json({message: 'Error fetching photo', error: error.message});
    }
});

router.get('/download/processed/:photoId', async (req, res) => {
    const {photoId} = req.params;
    try {
        const photo = await Photos.findByPk(photoId);
        if (!photo) {
            return res.status(404).json({message: 'Photo not found'});
        }

        const filePath = path.join(__dirname, '..', photo.PhotoPath);
        res.download(filePath, (err) => {
            if (err) {
                console.error('Error downloading processed photo:', err);
                res.status(500).json({message: 'Error downloading processed photo', error: err.message});
            }
        });
    } catch (error) {
        console.error('Error fetching photo:', error);
        res.status(500).json({message: 'Error fetching photo', error: error.message});
    }
});


module.exports = router;
