const bcrypt = require('bcrypt');
async function run() {
  const password = 'admin@access.com';
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);
  console.log('New hash:', hash);
  const match = await bcrypt.compare(password, hash);
  console.log('Match new:', match);
  const dbHash = '$2b$10$aIQbaKo9glYu1bd/b2SigeHIaac3A7IhmvLgozTOVI/crOkDZaA/y';
  const matchDb = await bcrypt.compare(password, dbHash);
  console.log('Match DB:', matchDb);
}
run();
