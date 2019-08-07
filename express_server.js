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

let urlDatabase = {
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

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

// renders urlDatabase index page
app.get('/urls', (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    username: req.cookies["username"]
  };
  res.render('urls_index', templateVars);
});

// new shortURL submission form
app.post('/urls', (req, res) => {
  const shortURL = generateRandomString();
  // add shortURL longURL key-value pair to urlDatabase
  urlDatabase[shortURL] = req.body.longURL;
  // redirect to show page for new shortURL/longURL pair
  res.redirect(`/urls/${shortURL}`);
});

// renders create new short url page
app.get('/urls/new', (req, res) => {
  const templateVars = {
    username: req.cookies["username"]
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

// renders short url detail display page
app.get('/urls/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL;
  const templateVars = {
    shortURL: shortURL,
    longURL: urlDatabase[shortURL],
    username: req.cookies["username"]
  };
  res.render('urls_show', templateVars);
});

// sets username cookie and redirects to index page
app.post('/login', (req, res) => {
  const username = req.body.username;
  res.cookie('username', username);
  res.redirect('/urls');
});

// clears username cookie and redirects to index page
app.post('/logout', (req, res) => {
  res.clearCookie('username');
  res.redirect('/urls');
});

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

app.get('/', (req, res) => {
  res.send('Hello!');
});