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

// returns a specified users' collection of urls
const getURLsByUser = (id, database) => {
  const userURLs = {};
  for (let url in database) {
    const userID = database[url].userID;
    const longURL = database[url].longURL;
    if (id === userID) {
      userURLs[url] = {
        userID: userID,
        longURL: longURL
      };
    }
  }
  return userURLs;
};

// returns user object if email exists in users database
const getUserByEmail = (email, database) => {
  for (let users in database) {
    const user = database[users];
    const dbEmail = database[users].email;
    if (email === dbEmail) {
      return user;
    }
  }
  return undefined;
};

module.exports = {
  generateRandomString,
  getURLsByUser,
  getUserByEmail
};