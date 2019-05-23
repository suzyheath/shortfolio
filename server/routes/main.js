const jwt = require('jsonwebtoken');

const server = require('./../server');
const db = require('./../database');
const keys  = require('./../../keys');

let app = server.app;

app.get('/', function(req, res, next) {
  res.render('home', {});
});

app.get('/register', function(req, res, next) {
  if (req.user) { // if logged in
    res.render('edit/text', { username: req.user.username });
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
        .render('edit/text', { username });
    })
    .catch(err => {
      server.renderError(err, res, 'register');
    });
});

app.get('/login', function(req, res, next) {
  if (req.user) { // if logged in
    res.render('edit/text', { username: req.user.username });
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
        .render('edit/text', { username });
    })
    .catch(err => {
      server.renderError(err, res, 'login');
    });
});

app.get('/logout', function(req, res, next) {
  res.clearCookie('auth');
  res.render('home', {});
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
      server.renderError(err, res, 'getPortfolio');
    });
});
