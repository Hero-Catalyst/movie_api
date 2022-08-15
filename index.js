const express = require('express'),
  morgan = require('morgan'),
  //Import built in node modules fs and path
  fs = require('fs'),
  path = require('path');

const app = express();

//Create a write stream (in append mode)
//A 'log.txt' file is created in root directory
const accessLogStream = fs.createWriteStream(path.join(__dirname,
  'log.txt'), {flags: 'a'})

//Setup the logger
app.use(morgan('combined', {stream: accessLogStream}));
app.use(express.static('public'));

//Array of movies
let topMovies =[
  {
    title: '',
    director: ''
  },
  {
    title: '',
    director: ''
  },
  {
    title: '',
    director: ''
  }

];

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
