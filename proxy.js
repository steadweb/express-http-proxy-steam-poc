const express = require('express');
const app = express();
const fs = require('fs');
const stream = require('stream');
const logger = require('pino')();

function makeid(length) {
  var result = '';
  var characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

app.use((req, res, next) => {
  logger.info('This logs signals the START of the PROXY request');
  next();
});

app.use((req, res, next) => {
  req.on('end', () => {
    logger.info('This log signals the END of the PROXY request');
  });
  next();
});

// This works when not using streams
// and you don't have to set the header in the consuming application
// app.get('*', function (req, res) {
//   return res.json({
//     id: makeid(8),
//   });
// });

// This also works, but, express tries to download the response
// not send back to the client.
app.get('*', function (req, res) {
  switch (req.path) {
    case '/image':
      const r1 = fs.createReadStream('sun.jpg'); // or any other way to get a readable stream
      const ps1 = new stream.PassThrough(); // <---- this makes a trick with stream error handling
      stream.pipeline(
        r1,
        ps1, // <---- this makes a trick with stream error handling
        (err) => {
          if (err) {
            logger.error(err); // No such file or any other kind of error
            return res.sendStatus(400);
          }
        },
      );
      ps1.pipe(res); // <---- this makes a trick with stream error handling
      break;

    default:
      const w = fs.createWriteStream('./output');
      w.write(
        JSON.stringify({
          id: makeid(8),
        }),
      );
      const r = fs.createReadStream('./output');
      const ps = new stream.PassThrough();
      stream.pipeline(
        r,
        ps, // <---- this makes a trick with stream error handling
        (err) => {
          if (err) {
            logger.error(err); // No such file or any other kind of error
            return res.sendStatus(400);
          }
        },
      );
      res.header('x-api-version', 'v1');
      ps.pipe(res);
      break;
  }
});

app.listen(5001, '0.0.0.0', () => {
  logger.info('Started PROXY listening on 0.0.0.0:5001');
});
