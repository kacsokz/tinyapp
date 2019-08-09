// returns user object if email exists in users database
const getUserByEmail = function(email, database) {
  for (let users in database) {
    const user = database[users];
    const dbEmail = database[users].email;
    if (email === dbEmail) {
      return user;
    }
  }
  return undefined;
};

// generates random 6 character string
const generateRandomString = () => {
  let randSix = '';
  const char = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  // generate random number to map to an index on char string
  for (let i = 0; i < 6; i++) {
    randSix += char.charAt(Math.floor(Math.random() * char.length));
  }
  return randSix;
};

module.exports = {
  getUserByEmail,
  generateRandomString
};