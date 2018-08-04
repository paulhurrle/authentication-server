const Authentication = require('./controllers/authentication');
const passportService = require('./services/passport');
const passport = require('passport');

// Create "middleware/interceptor" between http request and route handler

// Use the `jwt` strategy to create an auth object, do not create a new session(cookie) 
  // as passport would normally do by default
const requireAuth = passport.authenticate('jwt', { session: false });
// Use the `local` strategy to create an auth object, do not create a new session
const requireSignin = passport.authenticate('local', { session: false });

module.exports = function(app) {
  // create a route handler for GET requests that hit the / route, 
    // first pass through the requireAuth middleware, 
    // then execute the callback func/handler defined in Auth controller
  app.get('/', requireAuth, function(req, res) {
    res.send({ hi: 'there' });
  });

  // create a route handler for POST requests that hit the /signin route,
    // first pass through the requireSignin middleware,
    // then execute the callback func/handler defined in Auth controller
  app.post('/signin', requireSignin, Authentication.signin);

  // create a route handler for POST requests that hit the /signup route
  app.post('/signup', Authentication.signup);
};