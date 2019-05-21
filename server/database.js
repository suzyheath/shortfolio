const sqlite3 = require('sqlite3').verbose();

const logError = (err) => {
  if (err) console.log(err)
}

let db = new sqlite3.Database(':memory:', (err) => {
  if (err) {
    return console.error(err.message);
  }
  console.log('Connected to the in-memory SQlite database.');
});

const create = () => {
  db.run("create table users (username TEXT PRIMARY KEY, password TEXT NOT NULL, url TEXT NOT NULL)", [], logError);
  db.run("insert into users values ('doggos', 'test', 'https://i.imgur.com/4FHyn6b.jpg')", [], logError);
  db.run("insert into users values ('spywhere', 'test', 'https://i.imgur.com/jUreedP.jpg')", [], logError);
  db.run("insert into users values ('FredTheFarmer', 'test', 'https://i.imgur.com/sbZIj7N.jpg')", [], logError);
}

const selectAll = (selectStmt) => {
  return new Promise((resolve, reject) => {
    db.all(selectStmt, (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
}

const selectOne = (selectStmt) => {
  return new Promise((resolve, reject) => {
    db.each(selectStmt, (err, row) => {
      if (err) return reject(err);
      resolve(row);
    });
  });
}

const createUser = (username, password) => { // TODO check if user already exists
  return new Promise((resolve, reject) => {
    db.run('insert or replace into users values (?, ?, ?)', [username, password, 'https://i.imgur.com/vBAg1jJ.jpg'], function(err) {
      if (err) {
        return reject(`DB Error createUser: ${err.message}`);
      }
      selectOne(`select * from users where username='${username}'`).then(row => {
        console.log(row);
        resolve(row);
      }).catch(err => {
        reject(`DB Error createUser catch: ${err}`);
      });
    });
  });
};

const saveImage = (imageUrl, username) => { // TODO change this to find existing user and update URL
  return new Promise((resolve, reject) => {
    db.run('insert or replace into users values (?, ?)', [username, imageUrl], function(err) {
      if (err) {
        return reject(`DB Error saveImage: ${err.message}`);
      }
      selectOne(`select * from users where username='${username}'`).then(row => {
        resolve(row);
      }).catch(err => {
        reject(`DB Error saveImage catch: ${err}`);
      });
    });
  });
};

const selectImage = (username) => {
  return new Promise((resolve, reject) => {
    db.get('select * from users where username=?', [username], function(err, row) {
      if (err) {
        return reject({
          code: 500,
          text: `DB Error exists query: ${err.message}`
        });
      }
      if (!row) {
        return reject({
          code: 404,
          text: 'DB Error selectImage row does not exist'
        });
      }
      resolve(row.url);
    });
  })
}

db.serialize(create);

// selectAll("select * from users").then(console.log);

// selectOne("select * from users where username = 'cornwall'").then(console.log);

// db.run("insert into users values (64, 'cat')");
// db.run("update users set username='terrier' where username='bobby'");

// selectAll("select * from users").then(console.log);

module.exports = {
  close: db.close,
  saveImage,
  createUser,
  selectImage
};