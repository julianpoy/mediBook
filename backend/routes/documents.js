var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var conn = mongoose.connection;
var crypto = require('crypto');
var SessionService = require('../services/sessions.js');
var Session = mongoose.model('Session');
var Document = mongoose.model('Document');
var Grid = require('gridfs-stream');
var fs = require('fs');

/* Create a Document */
router.post('/', function(req, res) {
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

/* Get User Documents */
router.get('/', function(req, res) {
    SessionService.validateSession(req.query.sessionToken, function(err, userId) {
        if (err) {
            res.json(err);
        } else {
            Document.find({
                    userId: userId
                })
                .select()
                .exec(function(err, data) {
                    if (err) {
                        return res.status(500).json([{
                            msg: "Couldn't query the database for documents!"
                        }]);
                    } else {
                        res.status(200).json(data);
                    }
                });
            }
        });
});

/* Find my document from id */
router.get('/:id', function(req, res) {
    Document.findOne({
            _id: req.params.id
        })
        .select()
        .exec(function(err, document) {
            if (err) {
                return res.status(500).json({
                    msg: "Couldn't query the database for locations!"
                });
            } else {
                res.status(200).json(document);
            }
        });
});

/* Update a Document */
router.put('/:id', function(req, res) {
    if (!req.body.sessionToken) {
        return res.status(412).json({
            msg: "Requirements not met!"
        });
    }
    SessionService.validateSession(req.body.sessionToken, function(err, userId) {
        if (err) {
            res.json(err);
        } else {
            var newDocument = {};

            if (req.body.title && typeof req.body.title === 'string') newDocument.title = req.body.title;
            if (req.body.body && typeof req.body.body === 'string') newDocument.body = req.body.body;
            if (req.body.images) newDocument.images = req.body.images;

            var setDocument = {
                $set: newDocument
            }

            Document.update({
                    _id: req.params.id,
                    userId: userId
                }, setDocument)
                .exec(function(err, document) {
                    if (err) {
                        res.status(500).json(err);
                    } else {
                        res.status(200).send("Updated");
                    }
                })
        }
    });
});

/* Delete a Document */
router.delete('/:id', function(req, res) {
    if (!req.body.sessionToken) {
        return res.status(412).json({
            msg: "Requirements not met!"
        });
    }
    SessionService.validateSession(req.body.sessionToken, function(err, userId) {
        if (err) {
            res.json(err);
        } else {
            Document.findOne({
                    _id: req.params.id,
                    userId: userId
                })
                .remove(function(err, document) {
                    if (err) {
                        return res.status(500).json({
                            msg: "Document DB error!"
                        });
                    } else if (!document) {
                        res.status(409).json({
                            msg: "No document with that ID!"
                        });
                    } else {
                        res.status(200).json({
                            msg: "Deleted"
                        });
                    }
                });
        }
    });
});

module.exports = router;
