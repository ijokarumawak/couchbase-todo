var config = require('config');
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
    var view = {title: 'Todo Management', projects: []};
    if(!req.user){
      res.render('index', view);
      return;
    }
    projects.forEach(function(project){
      if(project.summary.users
        && project.summary.users.indexOf(req.user.id) == -1) return;
      view.projects.push(project);
    });
    res.render('index', view);
  });
};
