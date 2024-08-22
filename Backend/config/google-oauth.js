const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth2').Strategy;
const jwt = require("jsonwebtoken")
const { UserModel } = require("../model/user.model")
const bcrypt = require("bcrypt")
const fs = require("fs")
require('dotenv').config()

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.OAUTH_CALLBACK_URL,
  scope: ['email', 'profile']
},

  async function (request, accessToken, refreshToken, profile, done) {
    const password = 'aaa'
    const email = profile._json.email
    console.log(profile._json.email)
    const user = await UserModel.find({ email })
    if (user.length > 0) {
      console.log('User found, attempting login');
      let val = user[0]._id.toString();
      fs.writeFile('userData.txt', val, (err) => {
        if (err) {
          console.error('Error writing to file', err);
        }
      });
      var token = jwt.sign({ data: user[0].email }, "imran");
    }
    else {
      bcrypt.hash(password, 5, async (err, hash) => {
        if (err) {
          res.send({ "msg": err.message })
        } else {
          const user = new UserModel({ email, password: hash, bookmark: [{ movie: [], tvSeries: [] }] })
          await user.save()
          console.log("new user created", email);
        }
      });
    }
    console.log(profile._json.email)
    return done(null, profile);
  }));


passport.serializeUser(function (user, done) {
  done(null, user);
});

passport.deserializeUser(function (user, done) {
  done(null, user);
});

