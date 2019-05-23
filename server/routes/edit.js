const server = require('./../server');
const imgur = require('./../imgur')
const db = require('./../database');

let app = server.app;

app.get('/edit', function(req, res, next) {
  if (req.user) { // if logged in
    res.render('edit/text', { username: req.user.username });
  } else {
    console.log('Not authorised');
    res.render('login', {});
  }
});

app.post('/editText', function(req, res) {
  if (!req.user || !req.user.username) {
    console.log('Not authorised');
    return res.render('login', {});
  }
  if (!req.body || !req.body.title) {
    return res.render('edit/text', {
      username: req.user.username,
      error: 'No title provided'
    });
  }
  if (!req.body.bio) {
    return res.render('edit/text', {
      username: req.user.username,
      error: 'No bio provided'
    });
  }


  return res.status(500).send('Under construction');
});

app.post('/edit', function(req, res) {
  if (!req.user || !req.user.username) {
    console.log('Not authorised');
    return res.render('login', {});
  }

  if (!req.files || Object.keys(req.files).length == 0) {
    return res.status(400)
            .render('edit', { 
              username: req.user.username,
              error: 'Please select an image'
            });
  }

  let username = req.user.username;

  let coverPhotoFile = req.files.coverPhoto;
  if (coverPhotoFile.truncated) {
    return res.status(400)
            .render('edit', { 
              username: req.user.username,
              error: 'Cover photo too large'
            });
  }

  let coverPhoto = {
    encoded: coverPhotoFile.data.toString('base64'),
    size: coverPhotoFile.size,
    type: coverPhotoFile.mimetype
  };

  if (coverPhoto.type != 'image/jpeg' && coverPhoto.type != 'image/png') {
    return res.status(400)
            .render('edit', { 
              username: req.user.username,
              error: 'Invalid file type'
            });
  }

  // upload to imgur and save result to db
  imgur.upload(coverPhoto)
    .then(imageUrl => {
      return db.updateImageUrl(imageUrl, username);
    })
    .then(dbEntry => {
      res.render('personal', {
        title: dbEntry.title,
        imageUrl: dbEntry.url
      });
    })
    .catch(err => {
      server.renderError(err, res, 'edit');
    });
});