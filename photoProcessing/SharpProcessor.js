const sharp = require('sharp');
const PhotoProcessor = require('./PhotoProcessor');

class SharpProcessor extends PhotoProcessor {
    constructor(inputPath) {
        super();
        this.inputPath = inputPath;
        this.processor = sharp(inputPath);
    }

    async process() {
        return await this.processor.toBuffer();
    }
}

module.exports = SharpProcessor;
