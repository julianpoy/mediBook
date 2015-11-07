var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var SessionService = require('../services/sessions.js');
var Session = mongoose.model('Session');
var Document = mongoose.model('Document');

/* Create a Document */
router.post('/', function(req, res) {
    //Check if required was sent
    if (!(req.body.title &&
            req.body.body &&
            req.body.images &&
            req.body.sessionToken)) {
        return res.status(412).json({
            msg: "Requirements not met!"
        });
    }

    SessionService.validateSession(req.body.sessionToken, function(err, userId) {
        if (err) {
            res.json(err);
        } else {
            new Document({
                userId: userId,
                title: req.body.title,
                body: req.body.body,
                images: req.body.images
            }).save(function(err, document) {
                if (err) {
                    console.log("Database error!");
                    res.status(500).json({
                        msg: "Document save DB error!"
                    });
                } else {
                    res.status(201).send("Created");
                }
            });
        }
    });
});

module.exports = router;
