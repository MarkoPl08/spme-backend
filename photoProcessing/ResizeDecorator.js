const PhotoProcessor = require('./PhotoProcessor');
const sharp = require("sharp");

class ResizeDecorator extends PhotoProcessor {
    constructor(photoProcessor, width, height) {
        super();
        this.photoProcessor = photoProcessor;
        this.width = width;
        this.height = height;
    }

    async process() {
        const buffer = await this.photoProcessor.process();
        const processedImage = sharp(buffer).resize(this.width, this.height);
        return await processedImage.toBuffer();
    }
}

module.exports = ResizeDecorator;
