const {Photos, User, SubscriptionPackages} = require('../models');
const {uploadFile} = require('../config/awsConfig');
const PhotoProcessingFacade = require('../facades/photoProcessingFacade');
const path = require('path');
const fs = require('fs');
const {Op} = require("sequelize");

class PhotoService {
    static async uploadPhoto(req) {
        try {
            const {userId, description, hashtags, resizeWidth, resizeHeight, format} = req.body;
            const originalFilePath = req.file.path;
            const photoSize = req.file.size / (1024 * 1024);
            const bucketName = process.env.AWS_S3_BUCKET_NAME;
            if (!bucketName) throw new Error('AWS S3 Bucket Name is undefined');

            const user = await User.findByPk(userId);
            if (!user) {
                console.log('User not found');
                throw new Error('User not found');
            }

            const subscriptionPackage = await SubscriptionPackages.findByPk(user.PackageID);
            if (!subscriptionPackage) {
                throw new Error('Subscription package not found');
            }

            if (user.UploadCount >= subscriptionPackage.UploadLimit) {
                throw new Error('Upload limit exceeded');
            }
            if (user.StorageUsed + photoSize > subscriptionPackage.StorageLimit) {
                throw new Error('Storage limit exceeded');
            }

            const originalKey = `original/${Date.now()}-${req.file.originalname}`;
            const processedKey = `processed/${Date.now()}-${req.file.originalname}.${format}`;
            const originalPath = path.join(__dirname, '..', 'uploads', originalKey);
            const processedPath = path.join(__dirname, '..', 'uploads', 'processed', path.basename(processedKey));

            // Ensure directories exist
            const originalDir = path.dirname(originalPath);
            const processedDir = path.dirname(processedPath);

            if (!fs.existsSync(originalDir)) {
                fs.mkdirSync(originalDir, {recursive: true});
            }

            if (!fs.existsSync(processedDir)) {
                fs.mkdirSync(processedDir, {recursive: true});
            }

            await uploadFile(originalFilePath, bucketName, originalKey);

            fs.copyFileSync(originalFilePath, originalPath);

            const processedBuffer = await PhotoProcessingFacade.processPhoto(originalFilePath, {
                resizeWidth,
                resizeHeight,
                format
            });

            PhotoProcessingFacade.saveFile(processedBuffer, processedPath);
            await uploadFile(processedPath, bucketName, processedKey);

            user.UploadCount += 1;
            user.StorageUsed += photoSize;
            await user.save();

            return await Photos.create({
                UserID: userId,
                PhotoPath: `processed/${path.basename(processedKey)}`,
                OriginalPhotoPath: `original/${path.basename(originalKey)}`,
                Description: description,
                Hashtags: hashtags
            });
        } catch (error) {
            console.error('Error in uploadPhoto method:', error);
            throw error;
        }
    }

    static async getAllPhotos() {
        return Photos.findAll({
            include: {
                model: User,
                attributes: ['Username']
            }
        });
    }

    static async updatePhoto(photoId, description, hashtags) {
        const photo = await Photos.findByPk(photoId);
        if (!photo) throw new Error('Photo not found');

        photo.Description = description || photo.Description;
        photo.Hashtags = hashtags || photo.Hashtags;
        await photo.save();

        return photo;
    }

    static async searchPhotos({description, hashtags, startDate, endDate, username}) {
        let where = {};

        if (description) where.Description = {[Op.like]: `%${description}%`};
        if (hashtags) where.Hashtags = {[Op.like]: `%${hashtags}%`};
        if (startDate && endDate) where.UploadDateTime = {[Op.between]: [new Date(startDate), new Date(endDate)]};

        return Photos.findAll({
            where,
            include: [
                {
                    model: User,
                    attributes: ['Username'],
                    where: username ? {Username: {[Op.like]: `%${username}%`}} : {},
                }
            ]
        });
    }

    static async downloadPhoto(photoId, isOriginal) {
        const photo = await Photos.findByPk(photoId);
        if (!photo) throw new Error('Photo not found');

        const filePath = path.join(__dirname, '..', 'uploads', isOriginal ? photo.OriginalPhotoPath : photo.PhotoPath);
        if (!fs.existsSync(filePath)) throw new Error(`File not found: ${filePath}`);
        return filePath;
    }
}

module.exports = PhotoService;
