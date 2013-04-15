var util = require('util'),
    marked = require('marked'),
    rc = require('./response-check.js'),
    DataHandler = require('../db/couchbase.js').DataHandler;
var db = new DataHandler();

function reqToProject(req, project) {
  if(!project) project = {type: 'project'};
  project.name = req.param('name');
  project.desc = req.param('desc');
  project.body = req.param('body');
  return project;
}

exports.showAddPage = function(req, res){
  res.render('add-project.jade', {title: 'add project', project: {}});
};

exports.showEditPage = function(req, res){
  var id = req.param('id');
  db.findByID(id, function(err, project){
    if(rc.isErr(err, res)
       || rc.isNotFound(id, project, res)) return;
    res.render('edit-project.jade', {
      title: 'edit project', id: id, project:project});
  });
};

exports.add = function(req, res){
  // do some validation.
  var project = reqToProject(req);
  var id = req.param('id');
  db.add(id, project, function(err, project){
    if(rc.isErr(err, res)) return;
    res.redirect('/project?id=' + id);
  });
};

exports.edit = function(req, res){
  var id = req.param('id');
  db.findByID(id, function(err, project){
    if(rc.isErr(err, res)
       || rc.isNotFound(id, project, res)) return;
    reqToProject(req, project);
    db.save(id, project, function(err, project){
      if(rc.isErr(err, res)) return;
      res.redirect('/project?id=' + id);
    });
  });
}

exports.show = function(req, res){
  var id = req.param('id');
  var findTasks = function(project) {
    db.findTasksByProject(id, function(err, tasks){
      res.render('project.jade', {
        title: 'project:' + id, marked: marked,
        id: id, project: project, tasks: tasks
      });
    });
  }
  db.findByID(id, function(err, project){
    if(rc.isErr(err, res))
      return;
    else 
      findTasks(project);
  });
}
