const passport = require("passport"),
  LocalStrategy = require("passport-local").Strategy,
  Models = require("./models.js"),
  passportJWT = require("passport-jwt");

let Users = Models.User,
  JWTStrategy = passportJWT.Strategy,
  ExtractJWT = passportJWT.ExtractJwt;

//Defining "Strategies"
//Defines basic HTTP authentication for login requests.
passport.use(new LocalStrategy({
  usernameField: "Username",
  passwordField: "Password"
}, (username, password, callback) => {
  console.log(username + ' ' + password);
  Users.findOne({ Username: username }, (error, user) =>{
    if (error) {
      console.log(error);
      return callback(error);
    }

    if (!user) {
      console.log("Incorrect username");
      return callback(null, false, {message: "Incorrect username or password."});
    }
//Validate hashed password
    if (!user.validatePassword(password)) {
      console.log("Incorrect password");
      return callback(null, false, {message: "Incorrect password."});
    }

    console.log("Finished");
    return callback(null, user);
  });
}));

//Allows authentication of users based on the JWT submitted alongside their request.
passport.use(new JWTStrategy({
  jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
  secretOrKey: "1a2@3d4$5g"},
  (jwtPayload, callback) => {
    return Users.findById(jwtPayload._id)
    .then((user) => {
      return callback(null, user);
    })
    .catch((error) => {
      return callback(error)
    });
}));
