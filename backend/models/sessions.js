var mongoose = require('mongoose');
var Session = new mongoose.Schema({
    accountId: {
        type: String
    },
    token: {
        type: String
    }
});

mongoose.model('Session', Session);
