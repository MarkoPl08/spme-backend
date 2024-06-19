const {S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand} = require('@aws-sdk/client-s3');
const {getSignedUrl} = require('@aws-sdk/s3-request-presigner');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const s3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});

async function uploadFile(filePath, bucketName, key) {
    const fileContent = fs.readFileSync(filePath);
    const uploadParams = {
        Bucket: bucketName,
        Key: key,
        Body: fileContent,
    };

    try {
        return await s3.send(new PutObjectCommand(uploadParams));
    } catch (err) {
        throw err;
    }
}

async function downloadFile(bucketName, key, downloadPath) {
    const downloadParams = {
        Bucket: bucketName,
        Key: key,
    };

    try {
        const data = await s3.send(new GetObjectCommand(downloadParams));
        const bodyContents = await streamToBuffer(data.Body);
        fs.writeFileSync(downloadPath, bodyContents);
    } catch (err) {
        throw err;
    }
}

const streamToBuffer = async (stream) => {
    return new Promise((resolve, reject) => {
        const chunks = [];
        stream.on("data", (chunk) => chunks.push(chunk));
        stream.on("error", reject);
        stream.on("end", () => resolve(Buffer.concat(chunks)));
    });
};

async function deleteFile(bucketName, key) {
    const deleteParams = {
        Bucket: bucketName,
        Key: key,
    };

    try {
        return await s3.send(new DeleteObjectCommand(deleteParams));
    } catch (err) {
        throw err;
    }
}

module.exports = {uploadFile, downloadFile, deleteFile};
