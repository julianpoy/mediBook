'use strict';
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var User = new mongoose.Schema({
    username: {
        type: String
    },
    password: {
        type: String
    },
    salt: {
        type: String
    }
});

mongoose.model('User', User);
