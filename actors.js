"use strict";
var express = require('express');
var MongoClient = require('mongodb');
var router = express.Router();
var AWS = require('aws-sdk')
var s3 = new AWS.S3({
    //
    //
});
const mongoUri = "...."
router.get('/', (req, res) => {
    console.log(req);
    let query=req.query;
    MongoClient.connect(mongoUri, (err, client) => {
        if (err) {
            console.log(err);
            res.json({ "success": false });
        }
        client.db("actorsDirectory").collection("actors").find({query}).toArray().then(result => {
            let response = { Items: result }
            res.json(response);
        });
    });
});
function updateS3(actor) {
    let image = {
        Bucket: 'cloud.actorsdirectory.online/assets/ActorPhotos',
        Key: actor['actorId'] + '.jpeg',
        Body: new Buffer(actor['actorPhoto'], 'base64')
    };
    return s3.upload(image).promise();
};
router.post('/', (req, res) => {
    console.log(req.body);
    let actor = req.body;
    actor['actorId'] = Date.now();

    MongoClient.connect(mongoUri, (err, client) => {
        if (err) {
            console.log(err);
            res.json({ "success": false });
        }
        let existing;
        client.db("actorsDirectory").collection("actors")
            .find({ "actorContactNumber": actor.actorContactNumber })
            .limit(1).hasNext().then(result => {
                existing = result;
                return result;
            });
        if (!existing) {
            addNewUser(actor, client, res);
        } else {
            res.json({ "success": false, "err": "You have already registered" })
        }

    });
});
router.post('/bulk', (req, res) => {
    console.log(req.body);
    MongoClient.connect(mongoUri, (err, client) => {
        if (err) {
            console.log(err);
            res.json(errorResponse);
        }
        client.db("actorsDirectory").collection("actors").insertMany(req.body).then(result => { res.json(result) });
    });
});
module.exports = router;

const errorResponse = { "success": false, "err": "Update failed" };
function addNewUser(actor, client, res) {
    updateS3(actor).then(upload => {
        console.log(upload);
        actor.actorPhoto = upload.Location;
        client.db("actorsDirectory").collection("actors").insertOne(actor)
            .then(result => {
                console.log(result);
                res.json({ "success": true, "data": actor.actorId });
            })
            .catch(err => {
                console.log(err);
                res.json(errorResponse);
            });
    }).catch(err => {
        console.log(err);
        res.json(errorResponse);
    });
}
