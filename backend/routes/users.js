var express = require('express');
var router = express.Router();
var crypto = require('crypto');
var mongoose = require('mongoose');
var User = mongoose.model('User');
var Session = mongoose.model('Session');

/* User login */
router.post('/login', function(req, res, next) {
  User.findOne({
      username: req.body.username.toLowerCase()
    })
    .select('password salt')
    .exec(function(err, user) {
      if (err) {
        res.status(500).json({
          msg: "Couldn't search the database for user!"
        });
      } else if (!user) {
        res.status(401).json({
          msg: "Wrong email!"
        });
      } else {
        var hash = crypto.pbkdf2Sync(req.body.password, user.salt, 10000, 512);
        if (hash == user.password) {
          var token = crypto.randomBytes(48).toString('hex');
          new Session({
            accountId: user._id,
            token: token
          }).save(function(err) {
            if (err) {
              console.log("Error saving token to DB!");
              res.status(500).json({
                msg: "Error saving token to DB!"
              });
            } else {
              res.status(200).json({
                token: token
              });
            }
          });
        } else {
          res.status(401).json({
            msg: "Password is incorrect!"
          });
        }
      }
    });
});

/* New user */
router.post('/join', function(req, res, next) {
  var emailRegex = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+(?:[A-Z]{2}|com|org|net|edu|gov|mil|biz|info|mobi|name|aero|asia|jobs|museum)\b/;
  if (!emailRegex.test(req.body.username)) {
    res.status(412).json({
      msg: "Not a valid email!"
    });
  } else {
    User.findOne({
        username: req.body.username.toLowerCase()
      })
      .select('_id')
      .exec(function(err, user) {
        if (user) {
          res.status(406).json({
            msg: "Email already exists!"
          });
        } else {
          var salt = crypto.randomBytes(128).toString('base64');
          var hash = crypto.pbkdf2Sync(req.body.password, salt, 10000, 512);

          var newUser = new User({
            username: req.body.username.toLowerCase(),
            password: hash,
            salt: salt
          }).save(function(err, newUser) {
            if (err) {
              console.log("Error saving user to DB!");
              res.status(500).json({
                msg: "Error saving user to DB!"
              });
            } else {
              var token = crypto.randomBytes(48).toString('hex');
              new Session({
                accountId: newUser._id,
                token: token
              }).save(function(err) {
                if (err) {
                  res.status(500).json({
                    msg: "Error saving token to DB!"
                  });
                } else {
                  res.status(201).json({
                    token: token
                  });
                }
              });
            }
          });
        }
      });
  }
});

module.exports = router;
