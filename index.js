//Express
const express = require("express");
const app = express();
const { check, validationResult } = require("express-validator");
//Body Parser
const bodyParser = require("body-parser");

//Uuid
const uuid = require("uuid");

//Morgan
const morgan = require("morgan");

//Import built in node modules fs and path
const fs = require("fs");
const path = require("path");
//A 'log.txt' file is created in root directory
const accessLogStream = fs.createWriteStream(path.join(__dirname,
  "log.txt"), {flags: "a"});

app.use(morgan("combined", {stream: accessLogStream}));
app.use(bodyParser.json());
app.use(express.static("public"));

//CORS
const cors = require("cors");
//This code would allow requests from ALL origins: app.use(cors(*));
//This code allows certain origins to have access
let allowedOrigins = ["http://localhost:8080", "http://localhost:1234" ];
app.use(cors({
  origin: (origin, callback) => {
    if(!origin) return callback(null, true);
    if(allowedOrigins.indexOf(origin) === -1){//If a specific origin isn't
//found on the list of allowed origins
    let message = "The CORS policy for this application does not allow access from origin "
    + origin;
    return callback(new Error(message), false);
    }
    return callback(null, true);
  }
}));

//Import auth.js
let auth = require("./auth")(app);
//Passport and importing passport.js
const passport = require("passport");
require("./passport");

//Mongoose
const mongoose = require("mongoose");
const Models = require("./models.js");
//Imported Models from models.js
const Movies = Models.Movie;
const Genre = Models.Genre;
const Director = Models.Director;
const Actor = Models.Actor;
const Users = Models.User;

//Connecting Mongoose to myFlixDB on Mongodb-community(ran in terminal)
/* use for local testing: mongoose.connect('mongodb://localhost:2701/myFlixDB',
{ useNewUrlParser: true, useUnifiedTopology: true}); */

//use for online database
mongoose.connect( process.env.CONNECTION_URI,
{ useNewUrlParser: true, useUnifiedTopology: true});


//******** "CRUD" in Mongoose ********

// * CREATE *
// Add a user
/* We'll expect JSON in this format:
{
  ID: Integer,
  Username: String,
  Password: String,
  Email: String,
  Birthday: Date
}*/

app.post("/users", [
  check("Username", "Username is required").isLength({min: 5}),
  check("Username", "Username contains non alphanumeric characters - not allowed.").isAlphanumeric(),
  check("Password", "Password is required").not().isEmpty(),
  check("Email", "Email does not appear to be valid").isEmail()
], (req, res) => {

  //Check the validation object for errors
  let errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }


  let hashedPassword = Users.hashPassword(req.body.Password);
  Users.findOne({ Username: req.body.Username })//Search to see if a user with the requested username already exists
  .then((user) => {
    if (user) {//If the user is found, send a response that it already exists
      return res.status(400).send(req.body.Username +
      " already exists");
    } else {
      Users.create({
        Username: req.body.Username,
        Password: hashedPassword,
        Email: req.body.Email,
        Birthday: req.body.Birthday
      })
      .then((user) => {res.status(201).json(user)
})
      .catch((error) => {
        console.error(error);
        res.status(500).send("Error: " + error);
      })
    }//end of if/else
  })
    .catch((error) => {
      console.error(error);
      res.status(500).send("Error: " + error);
    });
});

// Add a movie to a user's list of favorites
app.post("/users/:Username/movies/:MovieID", passport.authenticate("jwt", { session: false }),
(req, res) => {
  Users.findOneAndUpdate({ Username: req.params.Username },
    { $push: { FavoriteMovies: req.params.MovieID } },
    { new: true }, //This line makes sure that the updated doc is returned
    (err, updatedUser) => {
      if (err) {
        console.error(err);
        res.status(500).send("Error: " + err);
      } else {
        res.json(updatedUser);
      }
  });
});

// * READ *
// GET all users
app.get("/users", passport.authenticate("jwt", { session: false }),
(req, res) => {
  Users.find()
  .then((users) => {
    res.status(201).json(users);
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send("Error: " + err);
  });
});

// GET a user by username
app.get("/users/:Username", passport.authenticate("jwt", { session: false }),
(req, res) => {
  Users.findOne({ Username: req.params.Username})
  .then((user) => {
    res.json(user);
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send("Error: " + err);
  });
});


//GET a list of ALL movies
app.get("/movies", passport.authenticate("jwt", {session: false}),
(req, res) => {
  Movies.find()
  .then((movies) => {
    res.status(201).json(movies);
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send("Error: " + err);
  });
});

// GET data by movie title
app.get("/movies/:Title", passport.authenticate("jwt", { session: false }),
(req, res) => {
  Movies.findOne({Title: req.params.Title})
  .then((title) => {
    res.json(title);
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send("Error: " + err);
  });
});

// GET genre data by genre name
app.get("/genres/:Name", passport.authenticate("jwt", { session: false }),
(req, res) => {
  Genre.findOne({ Name: req.params.Name})
  .then((genre) => {
    res.json(genre);
  })
  .catch((error) =>{
    if (genre) {
      res.status(200).json(genre);
    } else {
      res.status(400).send("Error: " + err)
    }
  })
});

// GET data by director name
app.get("/directors/:Name", passport.authenticate("jwt", { session: false }),
(req, res) => {
  Director.findOne({ Name: req.params.Name})
  .then((director) => {
    res.json(director);
  })
  .catch((error) => {
    if (director) {
      res.stats(200).json(director);
    } else {
      res.status(400).send("Error: " + err)
    }
  });
});


// * UPDATE *
// Update a user's info, by username
/* We'll expect JSON in this format
{
  Username: String,
  (required)
  Password: String,
  (required)
  Email: String,
  (required)
  Birthday: Date
}
*/
app.put("/users/:Username", passport.authenticate("jwt", { session: false }),
(req, res) => {
  let hashedPassword = Users.hashPassword(req.body.Password);
  Users.findOneAndUpdate(
    { Username: req.params.Username },
  {
    updateUser: {
        Username: req.body.Username,
        Password: hashedPassword,
        Email: req.body.Email,
        Birthday: req.body.Birthday
      },
    },
  { new: true }, //This line makes sure that the updated document is returned
  (err, updatedUser) => {
    if(err) {
      console.error(err);
      res.status(500).send("Error: " + err);
    } else {
      res.json(updatedUser);
    }
  });
});


// * DELETE *
// Remove a movie from users list of favorite movies
app.delete("/users/:Username/movies/:MovieID", passport.authenticate("jwt", { session: false }),
(req, res) => {
  Users.findOneAndUpdate({ Username: req.params.Username },
    { $pull: { FavoriteMovies: req.params.MovieID } },
    { new: true }, //This line makes sure that the updated doc is returned
    (err, updatedUser) => {
      if (err) {
        console.error(err);
        res.status(500).send("Error: " + err);
      } else {
        res.json(updatedUser);
      }
  });
});

// Delete a user by username
app.delete("/users/:Username", passport.authenticate("jwt", { session: false }),
(req, res) => {
  Users.findOneAndRemove({ Username: req.params.Username})
  .then((user) => {
    if (!user) {
      res.status(400).send(req.params.Username + " was not found");
    } else {
      res.status(200).send(req.params.Username + " was deleted.")
    }
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send("Error: " + err);
  });
});


app.get("/", (request, response) => {
  response.send("Welcome to the MyFlix Movie App!")
});

//Error handling
app.use((err, req, res, next) => {
console.error(err.stack);
res.status(500).send("Something broke!");
});

//Listen for requests
const port = process.env.PORT || 8080;
app.listen(port, "0.0.0.0", () => {
  console.log("Listening on Port " + port);
});
