const jwt = require('jsonwebtoken');

const config = require('./config');
const imgur = require('./imgur')
const db = require('./database');
const keys  = require('./../keys');

const app = config.app;

app.get('/', function(req, res, next) {
  res.render('home', {});
});

app.get('/register', function(req, res, next) {
  res.render('register', {});
});

app.post('/register', function(req, res, next) {
  let username = req.body.username;
  db.createUser(username, req.body.password)
    .then(() => {
      const token = jwt.sign({ username }, keys.jwtSecret);
      res.status(200)
        .cookie('auth', { token }, { maxAge: 30 * 60 * 1000 })
        .render('edit', {});
    })
    .catch(err => {
      handleError(err, res, 'createUser');
    });
});

app.get('/login', function(req, res, next) {
  res.render('login', {});
});

app.post('/login', function(req, res, next) {
  db.loginUser(req.body.username, req.body.password)
    .then((username) => {
      const token = jwt.sign({ username }, keys.jwtSecret);
      res.status(200)
        .cookie('auth', { token }, { maxAge: 30 * 60 * 1000 })
        .render('edit', {});
    })
    .catch(err => {
      handleError(err, res, 'login');
    });
});

app.get('/logout', function(req, res, next) {
  res.clearCookie('auth');
  res.render('home', {});
});

app.get('/edit', function(req, res, next) {
  if (req.user) { // if logged in
    res.render('edit', { username: req.user.username });
  } else {
    console.log('Not authorised');
    res.render('login', {});
  }
});

app.post('/edit', function(req, res) {
  if (Object.keys(req.files).length == 0) {
    return res.status(400).send('No files were uploaded.');
  }

  let username = req.user.username;
  if (!username) {
    console.log('Not authorised');
    res.render('login', {});
  }

  let coverPhotoFile = req.files.coverPhoto;
  if (coverPhotoFile.truncated) {
    return res.status(400).send('Cover photo too large.');
  }

  let coverPhoto = {
    encoded: coverPhotoFile.data.toString('base64'),
    size: coverPhotoFile.size,
    type: coverPhotoFile.mimetype
  };

  // upload to imgur and save result to db
  imgur.upload(coverPhoto)
    .then(imageUrl => {
      return db.updateImageUrl(imageUrl, username);
    })
    .then(dbEntry => {
      res.render('personal', {
        username,
        imageUrl: dbEntry.url
      });
    })
    .catch(err => {
      handleError(err, res, 'updateImageUrl');
    });
});

app.get('/printdb', function(req, res, next) {
  db.selectAll();
  res.render('home', {});
});

app.get('/u/:username', function(req, res, next) {
  let username = req.params.username;

  // see if username is in db
  db.getImageUrl(username)
    .then(imageUrl => {
      // serve image
      res.render('personal', {
        username,
        imageUrl
      });
    })
    .catch(err => {
      handleError(err, res, 'getImageUrl');
    });
});

function handleError(err, res, method) {
  // catch any custom built error objects
  if ('code' in err && 'text' in err) {
    res.status(err.code).send(err.text);
    console.log(`Error in ${method}, ${err.code}: ${err.text}`)
  } else {
    res.status(500).send('Server error');
    console.log(err);
  }
}

app.listen(config.port, () => {
  console.log(`Server is up on port ${config.port}`);
});