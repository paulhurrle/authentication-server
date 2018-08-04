// here is where the logic goes to process an incoming http request for authentication using helper funcs

const jwt = require('jwt-simple');
const User = require('../models/user');
const config = require('../config');

// create func that takes userId and encodes it using secret string
function tokenForUser(user) {
  // create a timestamp of when token is issued
  const timestamp = new Date().getTime();
  // encoding userId is good practice because id should never change, unlike password
  // use `sub` key (short for SUBJECT) that refers to whom this belongs
  // `iat` refers to ISSUED AT TIME
  return jwt.encode({ sub: user.id, iat: timestamp }, config.secret);
};

exports.signin = function(req, res, next) {
  // User has already had their email and password auth'd, just needs their token
    // which is made available through req.user which is returned from `done()` in local strategy
  res.send({ token: tokenForUser(req.user) });
};

exports.signup = function(req, res, next) {
  const email = req.body.email;
  const password = req.body.password;

  // Ensure all requests contain an email and a password
  if (!email || !password) {
    return res.status(422).send({ error: 'You must provide an email and password' });
  }
  // Search through all records in the User model using 'findOne' method,
  // passing in search criteria as 1st arg, callback as 2nd arg
  // If user exists, `existingUser` will be defined
  // If user does not exist, `existingUser` will be null
  User.findOne({ email: email }, function(err, existingUser) {
    // 1st case is error because connection to db fails
    if (err) { return next(err); }
  
    // If a user with email does exist, return an error
    if (existingUser) {
      // 422 = "unprocessable entity"
      return res.status(422).send({ error: 'Email is in use' });
    }

    // If a user with email does not exist, create and save new user record
    const user = new User({
      email: email,
      password: password,
    });

    user.save(function(err) {
      if (err) { return next(err); }

      // Respond to request providing a JSON Web Token (JWT), userId + secret string,
      // that the user may use for authenticated requests in future
      res.json({ token: tokenForUser(user) });
    });
  });
}