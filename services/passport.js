// authenticate user before visiting a particular route before passing it to route handler

const passport = require('passport');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const LocalStrategy = require('passport-local');
const User = require('../models/user');
const config = require('../config');

// Create local strategy

// passport expects incoming requests to have a usernameField and password,
  // so must tell passport what to use instead in the options obj
const localOptions = { usernameField: 'email' };

const localLogin = new LocalStrategy(localOptions, function(email, password, done) {
  // Verify this email and password, call done with the user if correct email and password,
  // otherwise, call done with false
  User.findOne({ email: email }, function(err, user) {
    if (err) { return done(err); }
    if (!user) { return done(null, false); }

    // compare passwords - does the encrypted password supplied on this http request === user.password?
    // the same salt that is applied in generating the original encrypted (salt + hashed password) password 
      // gets applied to the hashed password submitted in the http request,
      // then the original encrypted password gets compared to the new encrypted password,
      // since the salt is the same in both cases, if the two values are a match, then the passwords must be the same
    // find the user in the database and call the comparePassword func defined in the User model 
      // and made available to every instance of User
    user.comparePassword(password, function(err, isMatch) {
      // if there is an error, return done with error
      if (err) { return done(err); }
      // if there is no match, return false == did not find user
      if (!isMatch) { return done(null, false); }
      // otherwise return the user
      return done(null, user);
    });
  });
});

// Create JWT Strategy

// must tell JWT Strategy where on the http req to find the web token (header? body? url?)
// must tell JWT Strategy where to find the secret string used to decode the payload
const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromHeader('authorization'),
  secretOrKey: config.secret
};

// Create JWT Strategy
// `payload` is the decoded jwtToken(userId+timestamp)
// `done` is callback func once we have attempted to auth a user
const jwtLogin = new JwtStrategy(jwtOptions, function(payload, done) {
  // See if the userId in the payload exists in database
  // If it does, call 'done' with that user == user is authenticated
  // Otherwise, call done without a user object == user is not auth
  User.findById(payload.sub, function(err, user) {
    // if error, return done with the error and `false` indicating no user found
    if (err) { return done(err, false); }
    
    // if no error and user exists, call done with user indicating user is found
    // if no error and user does not exist, dall done with false indicating no user found
    if (user) {
      done(null, user);
    } else {
      done(null, false);
    }
  });
});

// Tell passport to use the defined strategy
passport.use(jwtLogin);
passport.use(localLogin);
