var GoogleCalendar = require('google-calendar');
var config = require('config');
var googleCalendar = new GoogleCalendar.GoogleCalendar(
  config.GoogleAPI.clientID,
  config.GoogleAPI.clientSecret,
  config.GoogleAPI.redirectURI
);
var util = require('util'),
    marked = require('marked'),
    rc = require('./response-check.js'),
    DataHandler = require('../db/couchbase.js').DataHandler;
var db = new DataHandler();

/*
 * GET home page.
 */

exports.index = function(req, res){
  db.findProjects(function(err, projects){
    if(rc.isErr(err, res)) return;
    console.log("projects=" + projects);
    res.render('index', {title: 'Todo Management', projects: projects});
  });
};
