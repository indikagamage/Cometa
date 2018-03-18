// Modules
const crypto = require('crypto');
const query = require('querystring');

// Libraries
const { cometa } = attract('config');

module.exports = (req, res, next) => {
  if (cometa.allowUnauthorized) {
    return next();
  }

  const { auth } = req.query || req.headers;
  const { host } = req.headers;
  delete req.query.auth;
  const url = `${host}${req.pathname}?${query.stringify(req.query)}`;
  const serverSignature = crypto.createHmac('sha1', cometa.key).update(url).digest('hex');
  return serverSignature === auth ? next() : next('This request is not authorized.');
};