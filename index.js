const express = require('express');
const app = express();
const proxy = require('express-http-proxy');
const logger = require('pino')();

// Before
app.use((req, res, next) => {
  logger.info('This logs signals the START of the MAIN request');
  next();
});

// End
app.use((req, res, next) => {
  req.on('end', (data) => {
    logger.info('This logs signals the END of the MAIN request');
  });
  next();
});

// Basic
app.get('/', function (req, res) {
  res.send('Hello World!');
});

// Use this is using steams with JSON content
app.use(
  '/json',
  proxy('http://localhost:5001', {
    userResHeaderDecorator(headers, userReq, userRes, proxyReq, proxyRes) {
      // Log out the headers
      logger.info(`Headers received ${JSON.stringify(headers)}`);

      // Assign the content-type (required due to steams downloading)
      headers['content-type'] = 'application/json';

      // Set a custom header
      headers['x-api-version'] ?? 'v2';

      // Return
      return headers;
    },
    userResDecorator: (proxyRes, proxyResData, userReq, userRes) => {
      // Get the data
      const data = JSON.parse(proxyResData.toString('utf8'));

      // Log out what's been received
      logger.info(`Data received: ${JSON.stringify(data)}`);

      // Set custom data values before responding
      data.version = proxyRes.headers['x-api-version'] ?? 'v2';
      data.custom = 'this is a custom value';

      // Log out what's being sent back
      logger.info(`Data sending back to client: ${JSON.stringify(data)}`);

      return data;
    },
  }),
);

// Use this for images
app.use(
  '/image',
  proxy('http://localhost:5001', {
    proxyReqBodyDecorator: function (bodyContent, srcReq) {
      return bodyContent;
    },
    proxyReqPathResolver: function (req) {
      return '/image';
    },
  }),
);

app.listen(5000, '0.0.0.0', () => {
  logger.info('Started MAIN listening on 0.0.0.0:5000');
});
