const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const app = express();
const PORT = 8080;

// sets EJS as view engine on Express app
app.set('view engine', 'ejs');

// sets middleware for req.body and cookies
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

const users = {
  'kacsokz': {
    id: 'kacsokz',
    email: 'caseysokach@gmail.com',
    password: 'smelly-cat'
  }
};

const urlDatabase = {
  'b2xVn2': 'http://www.lighthouselabs.ca',
  '9sm5xK': 'http://www.google.com'
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
const emailLookup = (regEmail) => {
  for (let user in users) {
    let dbEmail = users[user]["email"];
    return (regEmail === dbEmail) ? true : false;
  }
};

// returns matching password from user db by searching with reg email
const passwordLookup = (regEmail) => {
  for (let user in users) {
    let dbEmail = users[user]["email"];
    let dbPassword = users[user]["password"];
    return (regEmail === dbEmail) ? dbPassword : false;
  }
};

// returns matching id from user db by searching with reg email
const idLookup = (regEmail) => {
  for (let user in users) {
    let dbEmail = users[user]["email"];
    let dbID = users[user]["id"];
    return (regEmail === dbEmail) ? dbID : false;
  }
};

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

// renders urlDatabase index page
app.get('/urls', (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    user: users[req.cookies["user_id"]]
  };
  res.render('urls_index', templateVars);
});

// new shortURL submission form
app.post('/urls', (req, res) => {
  const shortURL = generateRandomString();
  const longURL = req.body.longURL;
  // add shortURL longURL key-value pair to urlDatabase
  urlDatabase[shortURL] = longURL;
  // redirect to show page for new shortURL/longURL pair
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
  // creates new user in users db
  users[userID] = {
    id: userID,
    email: email,
    password: password
  };
  // handles registration errors
  if (email === '' || password === '') {
    res.status(400).send('400 Please fill out all registration fields');
  } else if (emailLookup(email)) {
    res.status(400).send('400 Email is already registered with TinyApp');
  // successful new registration
  } else {
    res.cookie('user_id', userID);
  }
  res.redirect('/urls');
});

// renders create new short url page
app.get('/urls/new', (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]]
  };
  res.render('urls_new', templateVars);
});

// once new shortURL is created, shortURL links to longURL webpage
app.get('/u/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL];
  res.redirect(longURL);
});

// index page edit button redirects to edit form on show page
app.get('/urls/:shortURL/update', (req, res) => {
  const shortURL = req.params.shortURL;
  res.redirect(`/urls/${shortURL}`);
});

// updates new longURL in urlDatabase and redirects to index page
app.post('/urls/:shortURL/update', (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = req.body.longURL;
  urlDatabase[shortURL] = longURL;
  res.redirect('/urls');
});

// deletes shortURLs from urlDatabase & redirect to index page
app.post('/urls/:shortURL/delete', (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect('/urls');
});

// renders short url detail show page
app.get('/urls/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL;
  const templateVars = {
    shortURL: shortURL,
    longURL: urlDatabase[shortURL],
    user: users[req.cookies["user_id"]]
  };
  res.render('urls_show', templateVars);
});

// renders login page
app.get('/login', (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]]
  };
  res.render('urls_login', templateVars);
});

// confirms login details, throws errors if login doesn't exist or
// password doesn't match. Upon successful login, set user_id cookie
// and redirects to index page
app.post('/login', (req, res) => {
  const formEmail = req.body.email;
  const formPassword = req.body.password;
  const dbPassword = passwordLookup(formEmail);
  const dbID = idLookup(formEmail);
  if (!emailLookup(formEmail)) {
    res.status(403).send('403 Please Register for TinyApp');
  } else if (emailLookup(formEmail) && dbPassword !== formPassword) {
    res.status(403).send('403 Password does not match');
  } else if (emailLookup(formEmail) && dbPassword === formPassword) {
    res.cookie('user_id', dbID);
  }
  res.redirect('/urls');
});

// clears username cookie and redirects to index page
app.post('/logout', (req, res) => {
  // res.clearCookie('username');
  res.redirect('/urls');
});

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

app.get('/', (req, res) => {
  res.send('Hello!');
});