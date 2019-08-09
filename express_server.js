const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');
const app = express();
const PORT = 8080;

// sets EJS as view engine on Express app
app.set('view engine', 'ejs');

// sets middleware for req.body and cookies
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

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

// searches users db for email submitted at registration
const emailLookup = regEmail => {
  for (let user in users) {
    let dbEmail = users[user]["email"];
    if (regEmail === dbEmail) {
      return true;
    }
  }
  return false;
};

// returns matching password from user db by searching with reg email
const passwordLookup = regEmail => {
  for (let user in users) {
    let dbEmail = users[user]["email"];
    let dbPassword = users[user]["password"];
    if (regEmail === dbEmail) {
      return dbPassword;
    }
  }
  return false;
};

// returns matching id from user db by searching with reg email
const idLookup = regEmail => {
  for (let user in users) {
    let dbEmail = users[user]["email"];
    let dbID = users[user]["id"];
    if (regEmail === dbEmail) {
      return dbID;
    }
  }
  return false;
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
  const user = users[req.cookies["user_id"]];
  // user logged in, display urls page
  if (user) {
    const userID = users[req.cookies["user_id"]].id;
    const userURLs = urlsForUser(userID);
    const templateVars = {
      urls: urlDatabase,
      user: users[req.cookies["user_id"]],
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
  const userID = users[req.cookies["user_id"]].id;
  // add new shortURL to database
  urlDatabase[shortURL] = {
    userID: userID,
    longURL: longURL
  };
  res.redirect(`/urls/${shortURL}`);
});

// renders registration page
app.get('/register', (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    user: users[req.cookies["user_id"]]
  };
  res.render('urls_register', templateVars);
});

// store user registration in db, sets cookie w/ user_id & redirect to index
app.post('/register', (req, res) => {
  const userID = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;
  // bcrypt hashing, 10 saltRounds
  const hashedPassword = bcrypt.hashSync(password, 10);
  // creates new user in users db
  // handles registration errors
  if (email === '' || password === '') {
    res.status(400).send('400 Please fill out all registration fields');
  } else if (emailLookup(email)) {
    res.status(400).send('400 Email is already registered with TinyApp');
    // successful new registration
  } else {
    users[userID] = {
      id: userID,
      email: email,
      password: hashedPassword
    };
    res.cookie('user_id', userID);
    res.redirect('/urls');
  }
});

// if logged in it renders create new short url page
// if not logged in, redirects to login page
app.get('/urls/new', (req, res) => {
  const userID = users[req.cookies["user_id"]];
  const templateVars = {
    user: userID
  };
  if (userID) {
    res.render('urls_new', templateVars);
  } else {
    res.redirect('/login');
  }
});

// once new shortURL is created, url links to page
app.get('/u/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL];
  res.redirect(longURL);
});

// index page edit button redirects to edit form on show page
app.get('/urls/:shortURL/update', (req, res) => {
  const shortURL = req.params.shortURL;
  console.log(shortURL);
  res.redirect(`/urls/${shortURL}`);
});

// updates new longURL in urlDatabase and redirects to index page
app.post('/urls/:shortURL/update', (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = req.body["longURL"];
  const userID = users[req.cookies["user_id"]].id;
  const user = users[req.cookies["user_id"]];
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
  const user = users[req.cookies["user_id"]];
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
  const user = users[req.cookies["user_id"]];
  // user logged in, display urls page
  if (user) {
    const userID = users[req.cookies["user_id"]].id;
    const userURLs = urlsForUser(userID);
    // displays only shortURL pages that belong to the user
    if (userURLs[shortURL]) {
      const templateVars = {
        shortURL: shortURL,
        longURL: longURL,
        urls: urlDatabase,
        user: users[req.cookies["user_id"]],
        userURLs: userURLs
      };
      res.render('urls_show', templateVars);
    // error if a user tries to access another users shortURLs
    } else {
      res.redirect(longURL);
    }
  // displays error if user not logged in
  } else {
    res.status(403).send('403 Please Register or Login');
  }
});

// renders login page
app.get('/login', (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]]
  };
  res.render('urls_login', templateVars);
});

// login page
app.post('/login', (req, res) => {
  const formEmail = req.body.email;
  const formPassword = req.body.password;
  const hashedPassword = passwordLookup(formEmail);
  const dbID = idLookup(formEmail);
  // error if login email doesn't exist in db
  if (!emailLookup(formEmail)) {
    res.status(403).send('403 Please Register for TinyApp');
  } else {
    // for registered users, compares form pw w/hashed pw in db
    const comparePassword = bcrypt.compareSync(formPassword, hashedPassword);
    if (!comparePassword) {
      res.status(403).send('403 Password does not match');
    } else {
      // on sucessful login, sets user_id cookie and redirect to index
      res.cookie('user_id', dbID);
      res.redirect('/urls');
    }
  }
});

// clear user_id cookie and redirects to index page
app.post('/logout', (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/urls');
});

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

app.get('/', (req, res) => {
  res.send('Welcome 127.0.0.1');
});

app.get('*', (req, res) => {
  res.status(404).send('404 Page Not Found');
});