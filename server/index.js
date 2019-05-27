const https = require('https');
// const http = require('http');
const fs = require('fs');

const port_HTTPS = 3000;

// configure server and middleware
const server = require('./server');

// set up routes
require('./routes/main.js');
require('./routes/edit.js');
require('./routes/admin.js');

// any accidental urls should redirect to pretty 404
server.app.get('/:any', function(req, res, next) {
  res.status(404)
    .render('404');
});

// start server on HTTPS
const httpsOptions = {
  key:  fs.readFileSync(process.env.HTTPS_KEY  || (__dirname + '/cert/localhost.key')),
  cert: fs.readFileSync(process.env.HTTPS_CERT || (__dirname + '/cert/localhost.crt'))
};

https.createServer(httpsOptions, server.app)
  .listen(port_HTTPS, function () {
    console.log(`HTTPS server listening on port ${port_HTTPS}...`);
  });