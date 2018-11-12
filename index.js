"use strict";
var express = require('express');
var MongoClient = require('mongodb');
var bodyParser = require('body-parser');
var cors = require('cors');
var actors = require('./actors');
var app = express();
var port = process.env.PORT || 1337;
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
 
// parse application/json
app.use(bodyParser.json())
app.use(cors());

app.use('/actors',actors)
app.listen(port);