const jwt = require('jsonwebtoken');

const app = require('./../server').app;
const error = require('./../error');
const db = require('./../database');
const keys  = require('./../../keys');

app.get('/', function(req, res, next) {
  res.render('home', {});
});

app.get('/register', function(req, res, next) {
  if (req.user) { // if logged in
    renderEditText(req.user.username, res);
  } else {
    res.render('register', {});
  }
});

app.post('/register', function(req, res, next) {
  if (!req.body || !req.body.username) {
    return res.render('register', { error: 'Please enter a username' });
  }
  if (!req.body.password) {
    return res.render('register', { error: 'Please enter a password' });
  }
  let username = req.body.username;
  db.createUser(username, req.body.password)
    .then(() => {
      const token = jwt.sign({ username }, keys.jwtSecret);
      res.status(200)
        .cookie('auth', { token }, { maxAge: 30 * 60 * 1000 })
      renderEditText(username, res);
    })
    .catch(err => {
      error.handleError(err, res, 'register');
    });
});

app.get('/login', function(req, res, next) {
  if (req.user) { // if logged in
    renderEditText(req.user.username, res);
  } else {
    res.render('login', {});
  }
});

app.post('/login', function(req, res, next) {
  if (!req.body || !req.body.username) {
    return res.render('login', { error: 'Please enter a username' });
  }
  if (!req.body.password) {
    return res.render('login', { error: 'Please enter a password' });
  }
  db.loginUser(req.body.username, req.body.password)
    .then((username) => {
      const token = jwt.sign({ username }, keys.jwtSecret);
      res.status(200)
        .cookie('auth', { token }, { maxAge: 30 * 60 * 1000 })
      renderEditText(username, res);
    })
    .catch(err => {
      error.handleError(err, res, 'login');
    });
});

app.get('/logout', function(req, res, next) {
  res.clearCookie('auth');
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
        bio: row.bio,
        imageUrl: row.url,
        font: row.font,
        social: JSON.parse(row.social)
      });
    })
    .catch(err => {
      error.handleError(err, res, 'home');
    });
});

function renderEditText(username, res) {
  if (username == 'admin') {
    db.getAllUsers()
    .then(users => {
      res.render('admin', { users });
    })
    .catch(err => {
      console.log(err);
      res.render('admin', { error: 'Could not retrieve users' });
    });
  } else {
    db.getTitleAndBio(username)
    .then(row => {
      const bio = (!row.bio)
                ? ""  // allow no bio
                : row.bio.replace(/<br\s*[\/]?>/gi, '\n');
      res.render('edit/text', { 
        username,
        title: `"${row.title}"`,
        bio
      });
    })
    .catch(err => {
      console.log(err);
      res.render('edit/text', { username, error: 'Could not retrieve Title or Bio' });
    });
  }
};
