const express = require('express'),
  bodyParser = require('body-parser'),
  uuid = require('uuid'),
  morgan = require('morgan'),
  //Import built in node modules fs and path
  fs = require('fs'),
  path = require('path');

const app = express();


//A 'log.txt' file is created in root directory
const accessLogStream = fs.createWriteStream(path.join(__dirname,
  'log.txt'), {flags: 'a'})

//Setup the logger
app.use(morgan('combined', {stream: accessLogStream}));

app.use(express.static('public'));
app.use(bodyParser.json());

//Array of users
let users =[
  {
    id: 1,
    name: "Kim",
    favoriteMovies: []
  },
  {
    id: 2,
    name: "Joe",
    favoriteMovies: ["Thor: Ragnarok"]
  },
]

//Array of movies
let movies =[
  {
    Title: 'What We Do In The Shadows',
    Directors: 'Taika Waititi',
    Genre: 'Dark Comedy'
  },
  {
    Title: 'Thor: Ragnarok',
    Directors: 'Taika Waititi',
    Genre: 'Action'
  },
  {
    Title: 'Hook',
    Directors: 'Steven Spielberg',
    Genre: 'Fantasy'
  }

];


// CREATE - allows creation of new user
app.post('/users', (req, res) => {
  const newUser = req.body;

  if (newUser.name) {
    newUser.id = uuid.v4();
    users.push(newUser);
    res.status(201).json(newUser)
  } else {
    res.status(400).send('Users need names')
  }
});

// UPDATE - user can update info
app.put('/users/:id', (req, res) => {
  const { id } = req.params;
  const updatedUser = req.body;

  let user = users.find( user => user.id == id );

  if (user) {
    user.name = updatedUser.name;
    res.status(200).json(user);
  } else {
    res.status(400).send('no such user')
  }
});

// CREATE - user can add movies to their list
app.post('/users/:id/:movieTitle', (req, res) => {
  const { id, movieTitle } = req.params;

  let user = users.find( user => user.id == id );

  if (user) {
    user.favoriteMovies.push(movieTitle);
    res.status(200).send(`${movieTitle} has been added to user ${id}'s array`);
  } else {
    res.status(400).send('no such user')
  }
});

// DELETE - allows removal of movie from list
app.delete('/users/:id/:movieTitle', (req, res) => {
  const { id, movieTitle } = req.params;

  let user = users.find( user => user.id == id );

  if (user) {
    user.favoriteMovies = user.favoriteMovies.filter( title => title !== movieTitle);
    res.status(200).send(`${movieTitle} has been removed from user ${id}'s array`);
  } else {
    res.status(400).send('no such user')
  }
});

// DELETE - allows removal of user id
app.delete('/users/:id', (req, res) => {
  const { id } = req.params;

  let user = users.find( user => user.id == id );

  if (user) {
    users = users.filter( user => user.id != id);
    res.status(200).send(`user ${id} has been deleted`);
  } else {
    res.status(400).send('no such user')
  }
});

// READ - allows search of specific movie
app.get('/movies/:title', (req, res) => {
  //const title = req.params.title;
  //*Object Destructuring* the next line is the same as the previous comment
  const { title } = req.params;
  const movie = movies.find(movie => movie.Title === title);

  if (movie) {
    res.status(200).json(movie);
  } else {
    res.status(400).send('No such movie')
  }
});

// READ - allows sorting of movies by genre
app.get('/movies/genre/:genreName', (req, res) => {
  const { genreName } = req.params;
  const genre = movies.find( movie => movie.Genre === genreName );

  if (genre) {
    res.status(200).json(genre);
  } else {
    res.status(400).send('No such genre')
  }
});

// READ - allows search of director and returns data
app.get('/movies/directors/:directorName', (req, res) => {
  const { directorName } = req.params;
  const director = movies.find( movie => movie.Directors === directorName );

  if (director) {
    res.status(200).json(director);
  } else {
    res.status(400).send('No such director')
  }
});

app.get('/', (request, response) => {
  response.send('hello world!')
});

//Error handling
app.use((err, req, res, next) => {
console.error(err.stack);
res.status(500).send('Something broke!');
});

//Listen for requests
app.listen(8080, () => {
console.log('Your app is listening on port 8080.');
});
