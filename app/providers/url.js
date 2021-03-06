// Modules
const http = require('http');
const https = require('https');
const { parse } = require('url');
const { Readable } = require('stream');

class URL extends Readable {
  constructor(config = null) {
    super({ objectMode: true });
    if (!config) {
      throw new Error('Configuration is required.');
    }

    this.inputUrl = parse(config.input);
    this.inputUrl.timeout = config.requestTimeout;
    this.image = { output: config.output };
    this.isComplete = false;

    this.on('end', () => {
      this.image = null;
    });
  }

  _read() {
    if (this.isComplete) {
      return;
    }

    const protocol = /https/.test(this.inputUrl.protocol) ? https : http;
    protocol.get(this.inputUrl, (res) => {
      if (res.statusCode !== 200) {
        return this.emit('error', new Error('The requested image could not be found.'));
      }

      let data = [];
      res.setEncoding('binary');
      return res.on('data', (chunk) => data.push(chunk)).on('end', () => {
        data = data.join('');
        this.image.body = Buffer.from(data, 'binary');
        this.image.originalSize = data.length;

        setImmediate(() => {
          this.isComplete = true;
          this.push(this.image);
          this.push(null);
        });
      });
    });
  }
}

module.exports = URL;
