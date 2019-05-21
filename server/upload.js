const express = require('express');
const fileUpload = require('express-fileupload');
const imgur = require('./imgur')
const path = require('path');
const db = require('./database');

const app = express();

app.use(express.static(__dirname + '/../public'));
app.use(fileUpload());

app.post('/upload', function(req, res) {
  if (Object.keys(req.files).length == 0) {
    return res.status(400).send('No files were uploaded.');
  }

  let username = req.body.username;
  if (username == null || username == '' || username == ' ') {
    return res.status(400).send('No username entereds');
  }

  let coverPhotoFile = req.files.coverPhoto;
  if (coverPhotoFile.truncated) {
    return res.status(400).send('Cover photo too large.');
  }

  let coverPhoto = {
    name: coverPhotoFile.name,
    encoded: coverPhotoFile.data.toString('base64'),
    size: coverPhotoFile.size,
    type: coverPhotoFile.mimetype
  };

  // upload to imgur and save result to db
  imgur.upload(coverPhoto)
    .then(imageObj => {
      return db.saveImage(imageObj, username);
    })
    .then(dbEntry => {
      res.sendFile(path.join(__dirname + '/../public/index.html'));
    })
    .catch(error => {
      console.log('error caught ');
      res.status(500).send(error);
      console.log(error)
    });
});

module.exports = {
  app
};