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
  if (req.user) { // if logged in
    res.render('edit', { username: req.user.username });
  } else {
    res.render('register', {});
  }
});

app.post('/register', function(req, res, next) {
  let username = req.body.username;
  db.createUser(username, req.body.password)
    .then(() => {
      const token = jwt.sign({ username }, keys.jwtSecret);
      res.status(200)
        .cookie('auth', { token }, { maxAge: 30 * 60 * 1000 })
        .render('edit', { username });
    })
    .catch(err => {
      handleError(err, res, 'register');
    });
});

app.get('/login', function(req, res, next) {
  if (req.user) { // if logged in
    res.render('edit', { username: req.user.username });
  } else {
    res.render('login', {});
  }
});

app.post('/login', function(req, res, next) {
  db.loginUser(req.body.username, req.body.password)
    .then((username) => {
      const token = jwt.sign({ username }, keys.jwtSecret);
      res.status(200)
        .cookie('auth', { token }, { maxAge: 30 * 60 * 1000 })
        .render('edit', { username });
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
  if (!req.user || !req.user.username) {
    console.log('Not authorised');
    res.render('login', {});
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
      handleError(err, res, 'edit');
    });
});

app.get('/printdb', function(req, res, next) {
  db.selectAll();
  res.render('home', {});
});

app.get('/u/:username', function(req, res, next) {
  let username = req.params.username;

  // see if username is in db
  db.getPortfolio(username)
    .then(row => {
      // serve image
      res.render('personal', {
        title: row.title,
        imageUrl: row.url
      });
    })
    .catch(err => {
      handleError(err, res, 'getPortfolio');
    });
});

function handleError(err, res, template) {
  // catch any custom built error objects
  if ('code' in err && 'text' in err) {
    res.status(err.code)
      .render(template, { error: `${err.code}: ${err.text}` });
    console.log(`Error '${template}' ${err.code}: ${err.text}`)
  } else {
    res.status(500).send('Server error');
    console.log(err);
  }
}

app.listen(config.port, () => {
  console.log(`Server is up on port ${config.port}`);
});