const {writeFileSync, existsSync, mkdirSync} = require("fs");
const path = require('path');
const SharpProcessor = require('../photoProcessing/SharpProcessor');
const ResizeDecorator = require('../photoProcessing/ResizeDecorator');
const FormatDecorator = require('../photoProcessing/FormatDecorator');

class PhotoProcessingFacade {
    static async processPhoto(inputPath, options) {
        let processor = new SharpProcessor(inputPath);

        if (options.resizeWidth || options.resizeHeight) {
            processor = new ResizeDecorator(processor, parseInt(options.resizeWidth), parseInt(options.resizeHeight));
        }

        const validFormats = ['jpeg', 'png', 'webp'];
        if (validFormats.includes(options.format)) {
            processor = new FormatDecorator(processor, options.format);
        } else {
            throw new Error(`Invalid format: ${options.format}`);
        }

        return await processor.process();
    }

    static ensureDirectoryExistence(filePath) {
        const dirname = path.dirname(filePath);
        if (existsSync(dirname)) {
            return true;
        }
        this.ensureDirectoryExistence(dirname);
        mkdirSync(dirname);
    }

    static saveFile(buffer, filePath) {
        this.ensureDirectoryExistence(filePath);
        writeFileSync(filePath, buffer);
    }
}

module.exports = PhotoProcessingFacade;
