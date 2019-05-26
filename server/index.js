const https = require('https');
const fs = require('fs');

// configure server and middleware
const server = require('./server');

// set up routes
require('./routes/main.js');
require('./routes/edit.js');
require('./routes/admin.js');

server.app.get('/:any', function(req, res, next) {
  res.status(404)
    .render('404');
});

const httpsOptions = {
  key:  fs.readFileSync(process.env.HTTPS_KEY  || (__dirname + '/cert/localhost.key')),
  cert: fs.readFileSync(process.env.HTTPS_CERT || (__dirname + '/cert/localhost.crt'))
};

// HTTP
// server.app.listen(server.port, () => { console.log(`Server is up on port ${server.port}`); });

// HTTPS
https.createServer(httpsOptions, server.app)
  .listen(server.port, function () {
    console.log(`Server is up on port ${server.port}`);
  });