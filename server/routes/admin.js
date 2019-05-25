const app = require('./../server').app;
const error = require('./../error');
const db = require('./../database');

function renderAdminPage(res, message = "") {
  db.getAllUsers()
    .then(users => {
      res.render('admin', { users, error: message });
    })
    .catch(err => {
      console.log(err);
      res.render('admin', { error: 'Could not retrieve users' });
    });
}

app.get('/admin', function(req, res, next) {
  if (!req.user || !req.user.username || req.user.username != 'admin') {
    console.log('Not authorised');
    return res.render('login', {});
  }
  renderAdminPage(res);
});

app.post('/deleteUser', function(req, res, next) {
  if (!req.user || !req.user.username || req.user.username != 'admin') {
    console.log('Not authorised');
    return res.render('login', {});
  }
  if (!req.body || !req.body.username) {
    renderAdminPage(res, 'No username provided');
  }
  let userToDelete = req.body.username;
  db.deleteUser(userToDelete)
    .then(() => {
      renderAdminPage(res, `Succesfully deleted user ${userToDelete}`);
    })
    .catch(err => {
      console.log(err);
      renderAdminPage(res, 'Error deleting user');
    });
});