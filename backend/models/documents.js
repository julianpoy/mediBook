var mongoose = require('mongoose');
var Document = new mongoose.Schema({
    userId: {
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
    }]
});

mongoose.model('Document', Document);
