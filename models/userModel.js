const mongoose = require('mongoose');
const bcrypt    = require('bcrypt');
const Schema    = mongoose.Schema;

const userSchema = new Schema({
  username:       { type: String, required: true, unique: true },
  password:       { type: String, required: true },
  email:          { type: String },
  profilePicture: { type: String, default: '/images/avatars/default.png' }
});

/* --- hash gesla ----------------------------------------------------------- */
userSchema.pre('save', function (next) {
  const user = this;
  if (!user.isModified('password')) return next();
  bcrypt.hash(user.password, 10, (err, hash) => {
    if (err) return next(err);
    user.password = hash;
    next();
  });
});

/* --- metoda authenticate -------------------------------------------------- */
userSchema.statics.authenticate = function (username, password, cb) {
  this.findOne({ username }).exec((err, user) => {
    if (err) return cb(err);
    if (!user) {
      const e = new Error('User not found');
      e.status = 401;
      return cb(e);
    }
    bcrypt.compare(password, user.password, (err, same) => {
      if (same) return cb(null, user);
      cb();
    });
  });
};

module.exports = mongoose.model('user', userSchema);
