const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('medicore_erp.sqlite');
db.all("SELECT email, username, passwordHash FROM users", (err, rows) => {
  console.log(err || rows);
});
