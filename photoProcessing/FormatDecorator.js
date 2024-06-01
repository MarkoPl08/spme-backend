const PhotoProcessor = require('./PhotoProcessor');
const sharp = require("sharp");

class FormatDecorator extends PhotoProcessor {
    constructor(photoProcessor, format) {
        super();
        this.photoProcessor = photoProcessor;
        this.format = format;
    }

    async process() {
        const buffer = await this.photoProcessor.process();
        const processedImage = sharp(buffer).toFormat(this.format);
        return await processedImage.toBuffer();
    }
}

module.exports = FormatDecorator;
