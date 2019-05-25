const express = require('express');
const jwt = require('jsonwebtoken');
const hbs = require('hbs');

const keys = require('./../keys');

const app = express();

app.set('view engine', 'hbs');

app.use(express.static(__dirname + '/../public'));
app.use(require('express-fileupload')());
app.use(require('cookie-parser')());
app.use(express.urlencoded({extended: true}));

// handle session cookies with jwt
app.use(function(req, res, next) {
  try {
    const token = req.cookies.auth.token;
    jwt.verify(token, keys.jwtSecret, (err, payload) => {
      if (payload) {
        req.user = { username: payload.username };
      }
      next();
    });
  } catch (e) {
    next();
  }
});

hbs.registerPartials(__dirname + '/../views/partials');
hbs.registerHelper('ifExists', str => (str == null) ? "" : str);

let port = process.env.port || 8080;

module.exports = {
  app,
  port
};