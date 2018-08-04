const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt-nodejs');

// Define user model
const userSchema = new Schema({
  // define email field of type string which enforces uniqueness, lowercase ensures that all emails are case insensitive
  email: { type: String, unique: true, lowercase: true },
  password: String,
});

// On Save Hook, encrypt password so not saved to db in plain text
// Before saving a model, run this function
userSchema.pre('save', function(next) {
  // the context of this function is the user model
  const user = this;

  // generate a salt, then run callback
  bcrypt.genSalt(10, function(err, salt) {
    if (err) { return next(err); }

    // hash (encrypt) password using the salt
    bcrypt.hash(user.password, salt, null, function(err, hash) {
      if (err) { return next(err) }

      // overwrite plain text password with encrypted password
      user.password = hash;

      // save
      next();
    });
  });
});

// Create a helper func for compare passwords using bcrypt's compare method
  // this takes 2 args and compares them, in this case arg 1 is encrypted candidatePassord,
  // arg 2 is the stored encrypted password from the User model (this)
// methods property makes the defined func's available to every instance of User
userSchema.methods.comparePassword = function(candidatePassword, callback) {
  bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
    if (err) { return callback(err); }

    callback(null, isMatch);
  });
};

// Create the model class
// load schema into mongoose that corresponds to a collection called 'user'
const ModelClass = mongoose.model('user', userSchema);

// Export the model
module.exports = ModelClass;