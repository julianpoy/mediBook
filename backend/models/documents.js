var mongoose = require('mongoose');
var Document = new mongoose.Schema({
    accountId: {
        type: String,
        ref: 'user'
    },
    title: {
        type: String
    },
    body: {
        type: String
    },
    images: [{
        type: String
    }],
    token: {
        type: String
    }
});

mongoose.model('Document', Document);
