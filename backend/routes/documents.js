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

/* Create a File */
router.post('/file', function(req, res) {
    Grid.mongo = mongoose.mongo;
    var gfs = Grid(conn.db);

    var part = req.files.file;

    var cryptoName = crypto.randomBytes(48).toString('hex');

    var writeStream = gfs.createWriteStream({
        filename: cryptoName,
        mode: 'w',
        content_type:part.mimetype
    });

    writeStream.on('close', function() {
         return res.status(200).send({
            filename: cryptoName
        });
    });

    writeStream.write(part.data);

    writeStream.end();
});

/* Fetch a File */
router.get('/file/:filename', function(req, res) {
    Grid.mongo = mongoose.mongo;
    var gfs = Grid(conn.db);

    gfs.files.find({ filename: req.params.filename }).toArray(function (err, files) {

 	    if(files.length===0){
			return res.status(400).send({
				message: 'File not found'
			});
 	    }

		res.writeHead(200, {'Content-Type': files[0].contentType});

		var readstream = gfs.createReadStream({
			  filename: files[0].filename
		});

	    readstream.on('data', function(data) {
	        res.write(data);
	    });

	    readstream.on('end', function() {
	        res.end();
	    });

		readstream.on('error', function (err) {
		  console.log('An error occurred!', err);
		  throw err;
		});
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
                getImages(document, 0, document.images.length);

                function getImages(data, i, length){
                    if(i < length){
                        gfs.files.find({ filename: data.images[i] }).toArray(function (err, files) {

                     	    if(files.length===0){
                    			return res.status(400).send({
                    				message: 'File not found'
                    			});
                     	    }

                    		var readstream = gfs.createReadStream({
                    			  filename: files[0].filename
                    		});

                    	    readstream.on('data', function(data) {
                    	        data.fileOut[i] = data;
                    	    });

                    		readstream.on('error', function (err) {
                    		  console.log('An error occurred!', err);
                    		});
                    	});
                        getImages(data, i+1, length);
                    } else {
                        finishImages(data);
                    }
                }

                function finishImages(data){
                    res.status(200).json(data);
                }
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
