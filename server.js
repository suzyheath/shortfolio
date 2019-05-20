const express = require('express');
const fileUpload = require('express-fileupload');
const path = require('path');

const db = require('./database');

const port = 8080;
const app = express();

app.use(express.static(__dirname + '/public'));
app.use(fileUpload());

app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname + '/index.html'));
});

app.get('/:username', function(req, res, next) {
  console.log(req.params.username)

  // see if username is in db

  // if not, throw 404

  // else retrieve their profile and display

  res.sendFile(path.join(__dirname + '/public/index.html'));
});

app.post('/upload', function(req, res) {
  if (Object.keys(req.files).length == 0) {
    return res.status(400).send('No files were uploaded.');
  }

  let coverPhotoFile = req.files.coverPhoto;

  if (coverPhotoFile.truncated) {
    return res.status(400).send('Cover photo too large.');
  }
  let coverPhoto = {
    name: coverPhotoFile.name,
    encoded: Buffer.from(coverPhotoFile.data, 'base64'),
    size: coverPhotoFile.size,
    type: coverPhotoFile.mimetype
  };

  // upload to imgur

  // associate imgur id with profile and save to db

  res.writeHead(200, {
    'Content-Type': coverPhoto.type,
    'Content-Length': coverPhoto.size
  });
  res.end(coverPhoto.encoded);
});

app.listen(port, () => {
  console.log(`Server is up on port ${port}`);
});

//db.close();