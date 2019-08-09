const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');
const { getUserByEmail, generateRandomString } = require('./helpers');
const PORT = 8080;

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}));

const users = {
  'test': {
    id: 'test',
    email: 'test@test.com',
    password: bcrypt.hashSync('test', 10)
  }
};

const urlDatabase = {
  'b2xVn2': {
    userID: 'test',
    longURL: 'http://www.lighthouselabs.ca'
  },
  '9sm5xK': {
    userID: 'test',
    longURL: 'http://www.google.com'
  }
};

// Filters urlDatabase by logged in users id
const urlsForUser = id => {
  const userURLs = {};
  for (let shortURL in urlDatabase) {
    const userID = urlDatabase[shortURL].userID;
    const longURL = urlDatabase[shortURL].longURL;
    if (id === userID) {
      userURLs[shortURL] = {
        userID: userID,
        longURL: longURL
      };
    }
  }
  return userURLs;
};

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

// renders urlDatabase index page
app.get('/urls', (req, res) => {
  const user = users[req.session.user_id];
  // user logged in, display urls page
  if (user) {
    const userID = users[req.session.user_id].id;
    const userURLs = urlsForUser(userID);
    const templateVars = {
      urls: urlDatabase,
      user: users[req.session.user_id],
      userURLs: userURLs
    };
    res.render('urls_index', templateVars);
    // displays error if user not logged in
  } else {
    res.status(403).send('403 Please Register or Login');
  }
});

// new shortURL submission
app.post('/urls', (req, res) => {
  const shortURL = generateRandomString();
  const longURL = req.body.longURL;
  const userID = users[req.session.user_id].id;
  // add new shortURL to database
  urlDatabase[shortURL] = {
    userID: userID,
    longURL: longURL
  };
  res.redirect(`/urls/${shortURL}`);
});

// registration page
app.get('/register', (req, res) => {
  const user = users[req.session.user_id];
  const templateVars = {
    urls: urlDatabase,
    user: users[req.session.user_id]
  };
  // if user is logged in, redirect to index page
  // if user is not logged in, render registration page
  user ? res.redirect('/urls') : res.render('urls_register', templateVars);
});

// Store new user in users db,csets cookie w/ user_id & redirect to index
app.post('/register', (req, res) => {
  const newUserID = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;
  // bcrypt hashing, 10 saltRounds
  const hashedPassword = bcrypt.hashSync(password, 10);
  // registration control flow, for errors or success
  if (email === '' || password === '') {
    res.status(400).send('400 Please fill out all registration fields');
  } else if (getUserByEmail(email, users)) {
    res.status(400).send('400 Email is already registered with TinyApp');
    // creates successful new registration
  } else {
    users[newUserID] = {
      id: newUserID,
      email: email,
      password: hashedPassword
    };
    req.session.user_id = newUserID;
    res.redirect('/urls');
  }
});

// Create New URL
app.get('/urls/new', (req, res) => {
  const userID = users[req.session.user_id];
  const templateVars = {
    user: userID
  };
  // logged in, renders create new page : logged out, redirect to login
  userID ? res.render('urls_new', templateVars) : res.redirect('/login');
});

// Redirect to longURL
app.get('/u/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL].longURL;
  const user = users[req.session.user_id];
  // logged in, redirect to longURL : logged out, error
  user ? res.redirect(longURL) : res.status(403).send('403 Please Register or Login');
});

// Index page Edit button redirects to edit form on show page
app.get('/urls/:shortURL/update', (req, res) => {
  const shortURL = req.params.shortURL;
  res.redirect(`/urls/${shortURL}`);
});

// If logged in, update longURL in urlDatabase and redirect to index
app.post('/urls/:shortURL/update', (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = req.body["longURL"];
  const userID = users[req.session.user_id].id;
  const user = users[req.session.user_id];
  if (user) {
    urlDatabase[shortURL] = {
      userID: userID,
      longURL: longURL
    };
    res.redirect('/urls');
  } else {
    res.status(403).send('403 Please Register or Login');
  }
});

// deletes shortURLs from urlDatabase & redirect to index page
app.post('/urls/:shortURL/delete', (req, res) => {
  const user = users[req.session.user_id];
  if (user) {
    delete urlDatabase[req.params.shortURL];
    res.redirect('/urls');
  } else {
    res.status(403).send('403 Please Register or Login');
  }
});

// renders short url detail show page
app.get('/urls/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL]["longURL"];
  const user = users[req.session.user_id];
  // user logged in, display urls page
  if (user) {
    const userID = users[req.session.user_id].id;
    const userURLs = urlsForUser(userID);
    // displays only shortURL pages that belong to the user
    if (userURLs[shortURL]) {
      const templateVars = {
        shortURL: shortURL,
        longURL: longURL,
        urls: urlDatabase,
        user: users[req.session.user_id],
        userURLs: userURLs
      };
      res.render('urls_show', templateVars);
    // error if a user tries to access another users shortURLs
    } else {
      res.status(403).send('This URL is not part of your collection');
    }
  // displays error if user not logged in
  } else {
    res.status(403).send('403 Please Register or Login');
  }
});

// Renders login page
app.get('/login', (req, res) => {
  const templateVars = {
    user: users[req.session.user_id]
  };
  res.render('urls_login', templateVars);
});

// Login page
app.post('/login', (req, res) => {
  const formEmail = req.body.email;
  const formPassword = req.body.password;
  const hashedPassword = getUserByEmail(formEmail, users).password;
  const dbID = getUserByEmail(formEmail, users).id;
  // error if login email doesn't exist in db
  if (!getUserByEmail(formEmail, users)) {
    res.status(403).send('403 Please Register for TinyApp');
  } else {
    // for registered users, compares form pw w/hashed pw in db
    const comparePassword = bcrypt.compareSync(formPassword, hashedPassword);
    if (!comparePassword) {
      res.status(403).send('403 Password does not match');
    } else {
      // on sucessful login, sets user_id cookie and redirect to index
      req.session.user_id = dbID;
      res.redirect('/urls');
    }
  }
});

// Logout button clears cookie and redirects to index page
app.post('/logout', (req, res) => {
  res.clearCookie('session');
  res.clearCookie('session.sig');
  res.redirect('/urls');
});

// logged in, redirect to index : logged out, redirect to login
app.get('/', (req, res) => {
  const userID = users[req.session.user_id];
  userID ? res.redirect('/urls') : res.redirect('/login');
});

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

app.get('*', (req, res) => {
  res.status(404).send('404 Page Not Found');
});