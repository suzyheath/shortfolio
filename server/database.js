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
  db.run("create table images (username TEXT PRIMARY KEY, url TEXT NOT NULL, imageId TEXT NOT NULL, deleteHash TEXT NOT NULL)", [], logError);
  db.run("insert into images values ('doggos', 'https://i.imgur.com/4FHyn6b.jpg', '4FHyn6b', 'unknown')", [], logError);
  db.run("insert into images values ('spywhere', 'https://i.imgur.com/jUreedP.jpg', 'jUreedP', 'unknown')", [], logError);
  db.run("insert into images values ('FredTheFarmer', 'https://i.imgur.com/sbZIj7N.jpg', 'sbZIj7N', 'unknown')", [], logError);
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

const saveImage = (image, username) => {
  return new Promise((resolve, reject) => {
    db.run(`insert or replace into images values (?, ?, ?, ?)`, [username, image.url, image.id, image.deleteHash], function(err) {
      if (err) {
        return reject(`DB Error saveImage: ${err.message}`);
      }
      selectOne(`select * from images where username='${username}'`).then(row => {
        resolve(row);
      }).catch(err => {
        reject(`DB Error saveImage catch: ${err}`);
      });
    });
  });
};

const selectImage = (username) => {
  return new Promise((resolve, reject) => {
    db.get('select * from images where username=?', [username], function(err, row) {
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
      resolve(row);
    });
  })
}

db.serialize(create);

// selectAll("select * from images").then(console.log);

// selectOne("select * from images where username = 'cornwall'").then(console.log);

// db.run("insert into images values (64, 'cat')");
// db.run("update images set username='terrier' where username='bobby'");

// selectAll("select * from images").then(console.log);

module.exports = {
  close: db.close,
  saveImage,
  selectImage
};