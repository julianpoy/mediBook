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
    },
    name: {
        type: String,
        default: ""
    },
    dob: {
        type: String,
        default: ""
    }
});

mongoose.model('User', User);
