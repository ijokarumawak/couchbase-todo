var util = require('util'),
    marked = require('marked'),
    rc = require('./response-check.js'),
    DataHandler = require('../db/couchbase.js').DataHandler;
var db = new DataHandler();

function reqToTask(req, task) {
  if(!task) task = {type: 'task'};
  task.project = req.param('project');
  task.subject = req.param('subject');
  task.status = req.param('status');
  task.desc = req.param('desc');
  task.startDate = req.param('startDate');
  task.startTime = req.param('startTime');
  task.endDate = req.param('endDate');
  task.endTime = req.param('endTime');
  task.body = req.param('body');
  return task;
}

function checkProject(projectID, callback) {
  db.findByID(projectID, function(err, project) {
    if(err) callback(err);
    else callback(null, project);
  });
}

exports.add = function(req, res){
  res.render('add-task.jade', {
    title: 'add task', task: {project: req.param('project')}
  });
};

exports.edit = function(req, res){
  var id = req.params.id;
  db.findByID(id, function(err, task){
    if(rc.isErr(err, res)
       || rc.isNotFound(id, task, res)) return;
    res.render('edit-task.jade', {
      title: 'edit task', id: id, task:task});
  });
};

exports.post = function(req, res){
  // do some validation.
  db.publishUID(function(err, id){
    if(rc.isErr(err, res)) return;
    var task = reqToTask(req);
    db.add(id, task, function(err, task){
      if(rc.isErr(err, res)) return;
      res.redirect('/tasks/' + id);
    });
  });
};

exports.put = function(req, res){
  var id = req.params.id;
  db.findByID(id, function(err, task){
    if(rc.isErr(err, res)
       || rc.isNotFound(id, task, res)) return;
    reqToTask(req, task);
    checkProject(task.project, function(err, project){
      if(rc.isErr(err, res)
        || rc.isNotFound(task.project, project, res)) return;
      db.save(id, task, function(err, task){
        if(rc.isErr(err, res)) return;
        res.redirect('/tasks/' + id);
      });
    });
  });
}

exports.get = function(req, res){
  var id = req.params.id;
  db.findByID(id, function(err, task){
    if(rc.isErr(err, res)
       || rc.isNotFound(id, task, res)) return;
    res.render('task.jade', {
      title: 'task:' + id, marked: marked, id: id, task: task
    });
  });
}
