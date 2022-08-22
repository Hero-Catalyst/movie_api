const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

let movieSchema = mongoose.Schema({
  Title: {type: String, required: true},
  Description: {type: String, required: true},
  Genre: {type: mongoose.Schema.Types.ObjectId, ref: 'Genre'},
  Director: {type: mongoose.Schema.Types.ObjectId, ref: 'Director'},
  Actors: [{type: mongoose.Schema.Types.ObjectId, ref: 'Actor'}],
  ImagePath: String,
  Featured: Boolean
});

let genreSchema = mongoose.Schema({
  Name: {type: String, required: true},
  Description: String
});

let directorSchema = mongoose.Schema({
  Name: {type: String, required: true},
  Bio: String,
  Birth: Date,
  Death: Date
});

let actorSchema = mongoose.Schema({
  Name: {type: String, required: true},
  Bio: String,
  Birth: Date,
  Death: Date
});

let userSchema = mongoose.Schema({
  Username: {type: String, required: true},
  Password: {type: String, required: true},
  Email: {type: String, required: true},
  Birthday: Date,
  FavoriteMovies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Movie'}]
});

//Hash the user password
userSchema.statics.hashPassword = (password) => {
  return bcrypt.hashSync(password, 10);
};
//Comapare submitted hashed passwords with hashed passwords in database
userSchema.methods.validatePassword = function(password) {
  return bcrypt.compareSync(password, this.Password);
};

//Model Creation
let Movie = mongoose.model('Movie', movieSchema);
let Genre = mongoose.model('Genre', genreSchema);
let Director = mongoose.model('Director', directorSchema);
let Actor = mongoose.model('Actor', actorSchema);
let User = mongoose.model('User', userSchema);

//Model exports to index.js
module.exports.Movie = Movie;
module.exports.Genre = Genre;
module.exports.Director = Director;
module.exports.Actor = Actor;
module.exports.User = User;
