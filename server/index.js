// configure server and middleware
const server = require('./server');

// set up routes
require('./routes/main.js');
require('./routes/edit.js');

// start server
server.app.listen(server.port, () => {
  console.log(`Server is up on port ${server.port}`);
});