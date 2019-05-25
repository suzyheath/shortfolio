const app = require('./../server').app;
const error = require('./../error');
const db = require('./../database');

app.get('/admin', function(req, res, next) {
  if (!req.user || !req.user.username || req.user.username != 'admin') {
    console.log('Not authorised');
    return res.render('login', {});
  }

  db.getAllUsers()
    .then(users => {
      res.render('admin', { users });
    })
    .catch(err => {
      console.log(err);
      res.render('admin', { error: 'Could not retrieve users' });
    });
});