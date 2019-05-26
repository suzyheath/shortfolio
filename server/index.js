const https = require('https');
const http = require('http');
const fs = require('fs');

const port_HTTPS = 8080;
const port_HTTP  = 3000;

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

// forward http requests to https
http.createServer(function(req, res) {
      res.writeHead(301, { "Location": "https://" + req.headers['host'] + req.url });
      res.end();
    })
    .listen(port_HTTP);

// start server on HTTPS
const httpsOptions = {
  key:  fs.readFileSync(process.env.HTTPS_KEY  || (__dirname + '/cert/localhost.key')),
  cert: fs.readFileSync(process.env.HTTPS_CERT || (__dirname + '/cert/localhost.crt'))
};

https.createServer(httpsOptions, server.app)
  .listen(port_HTTPS, function () {
    console.log(`Server is up on port ${port_HTTPS}`);
  });