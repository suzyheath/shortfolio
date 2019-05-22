const express = require('express');
const jwt = require('jsonwebtoken');

const keys = require('./../keys');

const app = express();

app.set('view engine', 'hbs');

app.use(express.static(__dirname + '/../public'));
app.use(require('express-fileupload')());
app.use(require('cookie-parser')());
app.use(express.urlencoded({extended: true}));

// handle session cookies with jwt
app.use(function(req, res, next) {
  const token = req.cookies.auth.token;
  if (token) {
    let payload = jwt.verifySync(token, keys.jwtSecret);
    if (payload) {
      req.user = { username: payload.username };
      return next();
    }
    console.log(`session cookie could not be parsed. err: ${err}`);
  }
  next();
});

let port = process.env.port || 8080;

module.exports = {
  app,
  port
};