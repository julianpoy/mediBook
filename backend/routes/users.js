var express = require('express');
var router = express.Router();
var crypto = require('crypto');
var mongoose = require('mongoose');
var User = mongoose.model('User');
var SessionService = require('../services/sessions.js');
var Session = mongoose.model('Session');

/* User Get */
router.get('/', function(req, res) {
    SessionService.validateSession(req.query.sessionToken, function(err, userId) {
        if (err) {
            res.json(err);
        } else {
            User.findOne({
                    _id: userId
                })
                .select()
                .exec(function(err, data) {
                    if (err) {
                        return res.status(500).json({
                            msg: "Couldn't query the database for documents!"
                        });
                    } else {
                        res.status(200).json(data);
                    }
                });
            }
    });
});

/* User login */
router.post('/login', function(req, res, next) {
  User.findOne({
      username: req.body.username
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

/* User login */
router.post('/emergency', function(req, res, next) {
  User.findOne({
      username: req.body.username
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
        if (true) {
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
    User.findOne({
        username: req.body.username
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
            username: req.body.username,
            password: hash,
            salt: salt,
            name: req.body.name,
            dob: req.body.dob,
            picture: req.body.picture
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
});

/* Update a User */
router.put('/', function(req, res) {
    if (!req.body.sessionToken) {
        return res.status(412).json({
            msg: "You must provide all required fields!"
        });
    }
    SessionService.validateSession(req.body.sessionToken, function(err, accountId) {
        if (err) {
            res.json(err);
        } else {
            var updatedObj = {};

            if (req.body.name && typeof req.body.name === 'string') updatedObj.name = req.body.name;
            if (req.body.dob && typeof req.body.dob === 'string') updatedObj.dob = req.body.dob;
            if (req.body.username && typeof req.body.username === 'string') updatedObj.username = req.body.username;
            if (req.body.picture && typeof req.body.picture === 'string') updatedObj.picture = req.body.picture;

            var setObj = {
                $set: updatedObj
            }

            User.update({
                    _id: accountId
                }, setObj)
                .exec(function(err, user) {
                    if (err) {
                        res.status(500).json(err);
                    } else {
                        res.status(200).send("Updated");
                    }
                })
        }
    });
});

module.exports = router;
