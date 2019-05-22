const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');

let db = new sqlite3.Database(':memory:', (err) => {
  if (err) {
    return console.error(err.message);
  }
  console.log('Connected to the in-memory SQlite database.');
});

const create = () => {
  db.run("create table users (username TEXT PRIMARY KEY, password TEXT NOT NULL, url TEXT NOT NULL)", [], logError);
  db.run("insert into users values ('doggos', ?, 'https://i.imgur.com/4FHyn6b.jpg')", [hash('doggos')], logError);
  db.run("insert into users values ('spywhere', ?, 'https://i.imgur.com/jUreedP.jpg')", [hash('spywhere')], logError);
  db.run("insert into users values ('FredTheFarmer', ?, 'https://i.imgur.com/sbZIj7N.jpg')", [hash('FredTheFarmer')], logError);
};

db.serialize(create);

const createUser = (username, password) => {
  return new Promise((resolve, reject) => {
    // check if user already exists
    db.get('select * from users where username=?', [username], function(err, row) {
      if (err) {
        return reject({
          code: 500,
          text: `DB Error in createUser selecting: ${err.message}`
        });
      }
      if (row) {
        return reject({
          code: 400,
          text: `User already exists with username ${username}`
        });
      }
      // no user, so put 'em in
      let defaultImageUrl = 'https://i.imgur.com/vBAg1jJ.jpg';
      let hashedPassword = hash(password);
      db.run('insert or replace into users values (?, ?, ?)', [username, hashedPassword, defaultImageUrl], function(err) {
        if (err) {
          return reject({
            code: 500,
            text: `DB Error in createUser inserting: ${err.message}`
          });
        }
        resolve({
          username,
          hashedPassword,
          url: defaultImageUrl
        });
        console.log(`Created user ${username}`);
      });
    });
  });
};

const loginUser = (username, password) => {
  return new Promise((resolve, reject) => {
    // check if user exists
    db.get('select password from users where username=?', [username], function(err, row) {
      if (err) {
        return reject({
          code: 500,
          text: `DB Error in createUser selecting: ${err.message}`
        });
      }
      if (!row) {
        return reject({
          code: 400,
          text: `Invalid username or password`
        });
      }
      let validPassword = checkHash(password, row.password);
      if (!validPassword) {
        reject({
          code: 400,
          text: `Invalid username or password`
        });
      } else {
        // do some good stuff with cookies ?
        resolve(username);
      }
    });
  });
};

const updateImageUrl = (imageUrl, username) => {
  return new Promise((resolve, reject) => {
    db.get('select username, password from users where username=?', [username], function(err, row) {
      if (err) {
        return reject({
          code: 500,
          text: `DB Error in updateImageUrl selecting: ${err.message}`
        });
      }
      if (!row) {
        return reject({
          code: 404,
          text: 'Page not found'
        });
      }

      db.run('insert or replace into users values (?, ?, ?)', [row.username, row.password, imageUrl], function(err) {
        if (err) {
          return reject({
            code: 500,
            text: `DB Error in updateImageUrl inserting: ${err.message}`
          });
        }
        row.url = imageUrl;
        resolve(row);
        console.log(`Updated image for user ${username}`)
      });
    });
  });
};

const getImageUrl = (username) => {
  return new Promise((resolve, reject) => {
    db.get('select * from users where username=?', [username], function(err, row) {
      if (err) {
        return reject({
          code: 500,
          text: `DB Error getImageUrl: ${err.message}`
        });
      }
      if (!row) {
        return reject({
          code: 404,
          text: 'DB Error getImageUrl row does not exist'
        });
      }
      resolve(row.url);
    });
  });
};

module.exports = {
  close: db.close,
  createUser,
  loginUser,
  updateImageUrl,
  getImageUrl,
  selectAll // remove this after dev
};

/* debugging tools */

function selectAll() {
  db.all("select * from users", (err, rows) => {
    if (err) return console.log(err);
    console.log(rows);
  });
}

/* helpers */

function logError(err) {
  if (err) console.log(err)
}

function hash(password) {
  return bcrypt.hashSync(password, 8);
}

function checkHash(password, hash) {
  return bcrypt.compareSync(password, hash);
}