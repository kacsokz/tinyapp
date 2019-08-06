const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const PORT = 8080;

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

// sets EJS as view engine on Express app
app.set('view engine', 'ejs');

// sets middleware
app.use(bodyParser.urlencoded({extended: true}));

let urlDatabase = {
  'b2xVn2': 'http://www.lighthouselabs.ca',
  '9sm5xK': 'http://www.google.com'
};

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

// renders urlDatabase index page
app.get('/urls', (req, res) => {
  let templateVars = { urls: urlDatabase };
  res.render('urls_index', templateVars);
});

// shortURL submission form
app.post('/urls', (req, res) => {
  let shortURL = generateRandomString();
  // add shortURL longURL key-value pair to urlDatabase
  urlDatabase[shortURL] = req.body.longURL;
  // redirect to show page for new shortURL/longURL pair
  res.redirect(`/urls/${shortURL}`);
});

// renders create new short url page
app.get('/urls/new', (req, res) => {
  res.render('urls_new');
});

// renders short url detail display page
app.get('/urls/:shortURL', (req, res) => {
  let shortURL = req.params.shortURL;
  let templateVars = { shortURL: shortURL, longURL: urlDatabase[shortURL] };
  res.render("urls_show", templateVars);
});

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

app.get('/', (req, res) => {
  res.send('Hello!');
});