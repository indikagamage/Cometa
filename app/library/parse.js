'use strict';


module.exports = req => {

    let supportedOutput = ['webp', 'png', 'jpeg'],
        path = '',
        provider = null,
        outputFormat = 'jpeg',
        outputQuality = parseInt(req.query.q || req.query.quality);

    if (req.params[0]) {
        path = req.params[0];
        provider = 'S3'
    } else if (req.query.url) {
        path = req.query.url;
        provider = 'http';
    }

    let imageParts = path.split('/').pop().split('.');

    // TODO: Error on invalid input - imageParts[1]
    // let supportedInput = ['webp', 'png', 'jpeg', 'jpg']

    if (imageParts[2] && supportedOutput.indexOf(imageParts[2]) >= 0) {
        outputFormat = imageParts[2];
        path = path.replace('.' + outputFormat, '');
    }

    return {
        output: {
            width: parseInt(req.query.w || req.query.width) || 0,
            height: parseInt(req.query.h || req.query.height) || 0,
            quality: outputQuality > 0 && outputQuality <= 100 ? outputQuality : 80,
            format: outputFormat
        },
        imagePath: path || null,
        provider: provider
    };
};
