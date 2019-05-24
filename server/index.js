// configure server and middleware
const server = require('./server');

// set up routes
require('./routes/main.js');
require('./routes/edit.js');

server.app.get('/:any', function(req, res, next) {
  res.status(404)
    .render('404');
});

// start server
server.app.listen(server.port, () => {
  console.log(`Server is up on port ${server.port}`);
});