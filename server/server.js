const app = require('./upload').app;
const path = require('path');
const db = require('./database');

const port = 8080;

// app.get('/', function(req, res) {
//   res.sendFile(path.join(__dirname + '/index.html'));
// });

app.get('/:username', function(req, res, next) {
  console.log(req.params.username)

  // see if username is in db

  // if not, throw 404

  // else send request to imgur

  // display image

  res.sendFile(path.join(__dirname + '/public/index.html'));
});

app.listen(port, () => {
  console.log(`Server is up on port ${port}`);
});

//db.close();