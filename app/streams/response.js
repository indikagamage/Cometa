'use strict';


const crypto = require('crypto');
const sharp = require('sharp');
const stream = require('stream');
const Response = function (res) {
    if (!(this instanceof Response)) {
        return new Response(res);
    }

    stream.Writable.call(this, { objectMode: true });
    this.res = res;
};

Response.prototype._write = async function (image) {

    try {
        image.body = await sharp(image.body).jpeg({ quality: image.output.quality }).toBuffer();
    } catch (error) {
        console.log(error);
    }

    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + 30);
    const headers = {
        'Content-Type': `image/${image.output.format}`,
        'Cache-Control': 'max-age=2592000,public',
        'Expires': expirationDate.toGMTString(),
        'Content-Length': image.body.length,
        'Last-Modified': (new Date()).toGMTString(),
        'Etag': crypto.createHash('sha1').update(image.body, 'utf8').digest('hex'),
        'Vary': 'Accept-Encoding'
    };

    this.res.set(headers).send(image.body);
    image = null;
};

require('util').inherits(Response, stream.Writable);
module.exports = Response;