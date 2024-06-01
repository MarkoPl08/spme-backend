const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const {Photos, User} = require('../models');
const SubscriptionPackages = require('../models/SubscriptionPackages');
const {Op} = require('sequelize');
const {uploadFile, deleteFile} = require('../config/awsConfig');
const PhotoProcessingFacade = require('../facades/photoProcessingFacade');
const {photoUploaded, photoUpdated} = require("../observers/photoEventWatcher");

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

router.post('/upload', upload.single('photo'), async (req, res) => {
    const { userId, description, hashtags, resizeWidth, resizeHeight, format } = req.body;
    const originalFilePath = req.file.path;
    const photoSize = req.file.size / (1024 * 1024);
    const bucketName = process.env.AWS_S3_BUCKET_NAME;

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

        const originalKey = `original/${Date.now()}-${req.file.originalname}`;
        await uploadFile(originalFilePath, bucketName, originalKey);

        const processedBuffer = await PhotoProcessingFacade.processPhoto(originalFilePath, { resizeWidth, resizeHeight, format });
        const processedKey = `processed/${Date.now()}-${req.file.originalname}.${format}`;
        const processedPath = path.join(__dirname, '..', 'uploads', processedKey);

        PhotoProcessingFacade.saveFile(processedBuffer, processedPath);
        await uploadFile(processedPath, bucketName, processedKey);

        user.UploadCount += 1;
        user.StorageUsed += photoSize;
        await user.save();

        const photo = await Photos.create({
            UserID: userId,
            PhotoPath: processedKey,
            OriginalPhotoPath: originalKey,
            Description: description,
            Hashtags: hashtags
        });

        photoUploaded(photo);

        res.json({ message: 'Photo uploaded successfully', photo });
    } catch (error) {
        console.error('Error uploading photo:', error);
        res.status(500).json({ message: 'Error uploading photo', error: error.message });
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
    const { photoId } = req.params;
    const { description, hashtags } = req.body;

    try {
        const photo = await Photos.findByPk(photoId);
        if (!photo) {
            return res.status(404).json({ message: 'Photo not found' });
        }

        photo.Description = description || photo.Description;
        photo.Hashtags = hashtags || photo.Hashtags;
        await photo.save();

        photoUpdated(photo);

        res.json({ message: 'Photo updated successfully', photo });
    } catch (error) {
        console.error('Error updating photo:', error);
        res.status(500).json({ message: 'Error updating photo', error: error.message });
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

        const filePath = path.join(__dirname, '..', photo.OriginalPhotoPath);
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
