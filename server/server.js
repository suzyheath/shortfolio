const app = require('./upload').app;
const path = require('path');
const db = require('./database');
const hbs = require('hbs');

const port = 8080;

app.set('view engine', 'hbs');

app.get('/:username', function(req, res, next) {
  let username = req.params.username;

  // see if username is in db
  db.selectImage(username)
    .then(row => {
      // serve image
      res.render('personal', {
        username,
        imageUrl: row.url
      });
    })
    .catch(err => {
      if ('code' in err && 'text' in err) {
        res.status(err.code).send(err.text);
        console.log(`GET /:username selectImage catch ${err.code}: ${err.text}`)
      } else {
        res.status(500).send('Server error');
        console.log(err);
      }
    });
});

app.listen(port, () => {
  console.log(`Server is up on port ${port}`);
});