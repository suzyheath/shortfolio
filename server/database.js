const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');

const em = require('./error');

const getUserByUsername = (username) => {
  username = username.toLowerCase();
  return new Promise((resolve, reject) => {
    db.get('select * from users where username=?', [username], (err, res) => {
      if (err) return reject(err);
      resolve(res);
    });
  });
}

const insertOrReplaceUser = (username, password, imageUrl, title, bio, font, social) => {
  username = username.toLowerCase();
  return new Promise((resolve, reject) => {
    db.run('insert or replace into users values (?, ?, ?, ?, ?, ?, ?)', [username, password, imageUrl, title, bio, font, social], (err) => {
      if (err) return reject(err);
      resolve();
    });
  });
}

const createUser = (username, password) => {
  return new Promise((resolve, reject) => {
    if (username.includes(' ')) {
      return reject(em.newErr(400, `Username should cannot contain spaces`));
    }

    getUserByUsername(username)
      .then((row) => {
        if (row) {
          return reject(em.newErr(400, `User already exists with username ${username}`));
        }
        // no user, so put 'em in
        let hashedPassword = hash(password);
        insertOrReplaceUser(username, hashedPassword, defaultImageUrl, username, defaultBio, defaultFont, defaultSocial)
          .then(() => {
            resolve();
            console.log(`Created user ${username}`);
          })
          .catch(err => {
            reject(em.newErr(500, `DB Error in createUser insertOrReplaceUser catch block: ${err}`));
          });
      })
      .catch(err => {
        reject(em.newErr(500, `DB Error in createUser getUserByUsername catch block: ${err}`));
      });
  });
};

const loginUser = (username, password) => {
  username = username.toLowerCase();
  return new Promise((resolve, reject) => {
    // check if user exists
    getUserByUsername(username)
      .then((row) => {
        if (!row) {
          return reject(em.newErr(400, `Invalid username or password ${username} ${password}`));
        }
        let validPassword = checkHash(password, row.password);
        if (!validPassword) {
          reject(em.newErr(400, `Invalid username or password`));
        } else {
          resolve(username);
        }
      })
      .catch(err => {
        reject(em.newErr(500, `DB Error in loginUser getUserByUsername catch block: ${err}`));
      });
  });
};

const updateImageUrl = (newImage, username) => {
  return new Promise((resolve, reject) => {
    getUserByUsername(username)
      .then((row) => {
        if (!row) {
          return reject(em.newErr(404, 'DB Error updateImageUrl user does not exist'));
        }

        insertOrReplaceUser(row.username, row.password, newImage, row.title, row.bio, row.font, row.social)
          .then(() => {
            row.url = newImage;
            resolve(row);
            console.log(`Updated image for user ${username}`)
          })
          .catch(err => {
            reject(em.newErr(500, `DB Error in updateImageUrl insertOrReplaceUser catch block: ${err}`));
          });
      })
      .catch(err => {
        reject(em.newErr(500, `DB Error in updateImageUrl getUserByUsername catch block: ${err}`));
      });
  });
};

const getPortfolio = (username) => {
  return new Promise((resolve, reject) => {
    getUserByUsername(username)
      .then((row) => {
        if (!row) {
          return reject(em.newErr(404, 'DB Error getPortfolio user does not exist'));
        }
        resolve(row);
      })
      .catch(err => {
        reject(em.newErr(500, `DB Error in getPortfolio getUserByUsername catch block: ${err}`));
      });
  });
};

const updateTitleAndBio = (username, newTitle, newBio) => {
  return new Promise((resolve, reject) => {
    getUserByUsername(username)
      .then((row) => {
        if (!row) {
          return reject(em.newErr(404, 'DB Error updateTitleAndBio user does not exist'));
        }

        insertOrReplaceUser(row.username, row.password, row.url, newTitle, newBio, row.font, row.social)
          .then(() => {
            row.title = newTitle;
            row.bio = newBio;
            resolve(row);
            console.log(`Updated title and bio for user ${username}`)
          })
          .catch(err => {
            reject(em.newErr(500, `DB Error in updateTitleAndBio insertOrReplaceUser catch block: ${err}`));
          });
      })
      .catch(err => {
        reject(em.newErr(500, `DB Error in updateTitleAndBio getUserByUsername catch block: ${err}`));
      });
  });
};

const getTitleAndBio = (username) => {
  return new Promise((resolve, reject) => {
    getUserByUsername(username)
      .then((row) => {
        if (!row) {
          return reject(em.newErr(404, 'DB Error getTitleAndBio user does not exist'));
        }
        resolve({
          title: row.title,
          bio: row.bio
        });
      })
      .catch(err => {
        reject(em.newErr(500, `DB Error in getTitleAndBio getUserByUsername catch block: ${err}`));
      });
  });
};

const updateFont = (username, newFont) => {
  return new Promise((resolve, reject) => {
    getUserByUsername(username)
      .then((row) => {
        if (!row) {
          return reject(em.newErr(404, 'DB Error updateFont user does not exist'));
        }

        insertOrReplaceUser(row.username, row.password, row.url, row.title, row.bio, newFont, row.social)
          .then(() => {
            row.font = newFont;
            resolve(row);
            console.log(`Updated font for user ${username}`)
          })
          .catch(err => {
            reject(em.newErr(500, `DB Error in updateFont insertOrReplaceUser catch block: ${err}`));
          });
      })
      .catch(err => {
        reject(em.newErr(500, `DB Error in updateFont getUserByUsername catch block: ${err}`));
      });
  });
};

const getFont = (username) => {
  return new Promise((resolve, reject) => {
    getUserByUsername(username)
      .then((row) => {
        if (!row) {
          return reject(em.newErr(404, 'DB Error getFont user does not exist'));
        }
        resolve(row.font);
      })
      .catch(err => {
        reject(em.newErr(500, `DB Error in getFont getUserByUsername catch block: ${err}`));
      });
  });
};

const updateSocial = (username, newSocial) => {
  return new Promise((resolve, reject) => {
    getUserByUsername(username)
      .then((row) => {
        if (!row) {
          return reject(em.newErr(404, 'DB Error updateSocial user does not exist'));
        }

        insertOrReplaceUser(row.username, row.password, row.url, row.title, row.bio, row.font, newSocial)
          .then(() => {
            row.social = newSocial;
            resolve(row);
            console.log(`Updated social for user ${username}`)
          })
          .catch(err => {
            reject(em.newErr(500, `DB Error in updateSocial insertOrReplaceUser catch block: ${err}`));
          });
      })
      .catch(err => {
        reject(em.newErr(500, `DB Error in updateSocial getUserByUsername catch block: ${err}`));
      });
  });
};

const getSocial = (username) => {
  return new Promise((resolve, reject) => {
    getUserByUsername(username)
      .then((row) => {
        if (!row) {
          return reject(em.newErr(404, 'DB Error getSocial user does not exist'));
        }
        resolve(row.social);
      })
      .catch(err => {
        reject(em.newErr(500, `DB Error in getSocial getUserByUsername catch block: ${err}`));
      });
  });
};

/* create db */

let db = new sqlite3.Database('./data.db', (err) => {
  if (err) {
    return console.error(err.message);
  }
  console.log('Connected to the in-memory SQlite database.');
});

const defaultImageUrl = 'https://i.imgur.com/7ehiObZ.jpg';
const defaultBio = 'This is your bio.\nWrite whatever you want, for example about yourself, career, hobbies or interests.'
const defaultFont = 'Verdana';
const defaultSocial = '[]';

const createNewDb = () => {
  db.run(`create table users (
    username TEXT PRIMARY KEY,
    password TEXT NOT NULL,
    url      TEXT NOT NULL,
    title    TEXT NOT NULL,
    bio      TEXT,
    font     TEXT NOT NULL,
    social   TEXT NOT NULL
  )`, [], logError);

  const insert = 'insert into users values (?, ?, ?, ?, ?, ?, ?)';
  db.run(insert, ['doggos', hash('doggos'), 'https://i.imgur.com/4FHyn6b.jpg', 'Two Good Doggos', defaultBio, defaultFont, defaultSocial], logError);
  db.run(insert, ['spywhere', hash('spywhere'), 'https://i.imgur.com/jUreedP.jpg', 'SPYWHERE!', defaultBio, defaultFont, defaultSocial], logError);
  db.run(insert, ['fredthefarmer', hash('fredthefarmer'), 'https://i.imgur.com/sbZIj7N.jpg', 'Fred The Farmer', defaultBio, defaultFont, defaultSocial], logError);
};

// db.serialize(createNewDb);

module.exports = {
  close: db.close,
  createUser,
  loginUser,
  updateImageUrl,
  getPortfolio,
  updateTitleAndBio,
  getTitleAndBio,
  updateFont,
  getFont,
  updateSocial,
  getSocial,
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