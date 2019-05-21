const sqlite3 = require('sqlite3').verbose();

const logError = (err) => {
  if (err) return console.log(err)
}

let db = new sqlite3.Database(':memory:', (err) => {
  if (err) {
    return console.error(err.message);
  }
  console.log('Connected to the in-memory SQlite database.');
});

const create = () => {
  db.run("create table images (username TEXT PRIMARY KEY, url TEXT NOT NULL, imageId TEXT NOT NULL, deleteHash TEXT NOT NULL)", [], logError);
  db.run("insert into images values ('cornwall', 'https://imgur.com/Tbmnq4R', 'Tbmnq4R', 'unknown')", [], logError);
  db.run("insert into images values ('bobby', 'https://imgur.com/hneyXl5', 'hneyXl5', 'unknown')", [], logError);
}

const selectAll = (selectStmt) => {
  return new Promise((resolve, reject) => {
    db.all(selectStmt, (err, rows) => {
      if (err) throw err;
      resolve(rows);
    });
  });
}

const selectOne = (selectStmt) => {
  return new Promise((resolve, reject) => {
    db.each(selectStmt, (err, row) => {
      if (err) throw err;
      resolve(row);
    });
  });
}

const saveImage = (image, username) => {
  // TODO check for duplicate username ?
  db.run(`insert or replace into images values (?, ?, ?, ?)`, [username, image.url, image.id, image.deleteHash], function(err) {
    if (err) {
      return console.log(err.message);
    }
    console.log(`Inserted row:`);

    selectOne(`select * from images where username='${username}'`).then((err, res) => {
      if (err) console.log(err);
      else console.log(res);
    }).catch(console.log);
  });
};

db.serialize(create);

selectAll("select * from images").then((err, res) => {
  if (err) console.log(err);
  else console.log(res);
});

// selectOne("select * from images where username = 'cornwall'").then((err, res) => {
//   if (err) console.log(err);
//   else console.log(res);
// });

// db.run("insert into images values (64, 'cat')");
// db.run("update images set username='terrier' where username='bobby'");

// selectAll("select * from images").then((err, res) => {
//   if (err) console.log(err);
//   else console.log(res);
// });

module.exports = {
  close: db.close,
  saveImage
};