const express = require('express');
const path = require('path');

const db = require('./database');

const port = 8080;
const app = express();

app.use(express.static(__dirname + '/public'));

app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname + '/index.html'));
});

app.listen(port, () => {
  console.log(`Server is up on port ${port}`);
});

//db.close();