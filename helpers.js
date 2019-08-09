
const getUserByEmail = function(email, database) {
  for (let users in database) {
    const user = database[users];
    const dbEmail = database[users].email;
    if (email === dbEmail) {
      return user;
    }
  }
  return null;
};

module.exports = { getUserByEmail };