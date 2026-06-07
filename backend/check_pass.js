const bcrypt = require('bcrypt');
const hash = '$2b$10$aIQbaKo9glYu1bd/b2SigeHIaac3A7IhmvLgozTOVI/crOkDZaA/y';
bcrypt.compare('admin@access.com', hash).then(res => console.log('Match:', res));
