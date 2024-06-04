const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const PhotoService = require('../service/PhotoService');
const loggingAspect = require('../aspects/loggingAspect');

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

router.post('/upload', loggingAspect, upload.single('photo'), async (req, res) => {
    try {
        const photo = await PhotoService.uploadPhoto(req);
        res.json({message: 'Photo uploaded successfully', photo});
    } catch (error) {
        console.error('Error uploading photo:', error);
        res.status(500).json({message: 'Error uploading photo', error: error.message});
    }
});

router.get('/all', loggingAspect, async (req, res) => {
    try {
        const photos = await PhotoService.getAllPhotos();
        res.json(photos);
    } catch (error) {
        console.error('Error fetching photos:', error);
        res.status(500).json({message: 'Error fetching photos', error: error.message});
    }
});

router.put('/update/:photoId', loggingAspect, async (req, res) => {
    const {photoId} = req.params;
    const {description, hashtags} = req.body;

    try {
        const photo = await PhotoService.updatePhoto(photoId, description, hashtags);
        res.json({message: 'Photo updated successfully', photo});
    } catch (error) {
        console.error('Error updating photo:', error);
        res.status(500).json({message: 'Error updating photo', error: error.message});
    }
});

router.post('/search', loggingAspect, async (req, res) => {
    try {
        const photos = await PhotoService.searchPhotos(req.body);
        res.json(photos);
    } catch (error) {
        console.error('Error searching photos:', error);
        res.status(500).json({message: 'Error searching photos', error: error.message});
    }
});

router.get('/download/original/:photoId', loggingAspect, async (req, res) => {
    const {photoId} = req.params;
    try {
        const filePath = await PhotoService.downloadPhoto(photoId, true);
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

router.get('/download/processed/:photoId', loggingAspect, async (req, res) => {
    const {photoId} = req.params;
    try {
        const filePath = await PhotoService.downloadPhoto(photoId, false);
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
