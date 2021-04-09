const passport = require("passport");
const mongoose = require("mongoose");

const localStrategy = require("passport-local").Strategy;
require("./db");
const User = mongoose.model("User");

passport.use(
  new localStrategy(async (username, password, done) => {
    try {
      const user = await User.findOne({ username: username }).exec();
      if (!user) {
        console.log("problem with username");
        console.log(username);
        return done(null, false, { message: "Invalid Username or Password" });
      }
      const passwordOK = await user.comparePassword(password);
      if (!passwordOK) {
        console.log(password);
        console.log("problem with pass");

        return done(null, false, { message: "Invalid Username or Password" });
      }
      console.log(user);
      return done(null, user);
    } catch (err) {
      return done(err);
    }
  })
);

passport.serializeUser((user, done) => {
  return done(null, user._id);
});
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id).exec();
    return done(null, user);
  } catch (error) {
    return done(err);
  }
});

module.exports = {
  initialize: passport.initialize(),
  session: passport.session(),
  setUser: (req, res, next) => {
    res.locals.user = req.user;
    return next();
  },
};
