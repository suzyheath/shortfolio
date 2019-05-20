const sqlite3 = require('sqlite3').verbose();

let db = new sqlite3.Database(':memory:', (err) => {
  if (err) {
    return console.error(err.message);
  }
  console.log('Connected to the in-memory SQlite database.');
});

create = () => {
  db.run("create table animals (id, breed)");
  db.run("insert into animals values (42, 'dog')");
  db.run("insert into animals values (53, 'fish')");
}

selectAll = (selectStmt) => {
  return new Promise((resolve, reject) => {
    db.all(selectStmt, (err, rows) => {
      if (err) throw err;
      resolve(rows);
    });
  });
}

selectOne = (selectStmt) => {
  return new Promise((resolve, reject) => {
    db.each(selectStmt, (err, row) => {
      if (err) throw err;
      resolve(row);
    });
  });
}

db.serialize(create);

selectAll("select * from animals").then((err, res) => {
  if (err) console.log(err);
  else console.log(res);
});

selectOne("select * from animals where id = 42").then((err, res) => {
  if (err) console.log(err);
  else console.log(res);
});

db.run("insert into animals values (64, 'cat')");
db.run("update animals set breed='terrier' where id=42");

selectAll("select * from animals").then((err, res) => {
  if (err) console.log(err);
  else console.log(res);
});

module.exports = {
  close: db.close
};