var util = require('util'),
    marked = require('marked'),
    rc = require('./response-check.js'),
    async = require('async'),
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

exports.showAddPage = function(req, res){
  res.render('add-task.jade', {
    title: 'add task', task: {project: req.param('project')}
  });
};

exports.showEditPage = function(req, res){
  var id = req.param('id');
  db.findByID(id, function(err, task){
    if(rc.isErr(err, res)
       || rc.isNotFound(id, task, res)) return;
    res.render('edit-task.jade', {
      title: 'edit task', id: id, task:task});
  });
};

exports.checkProject = function(task, callback) {
  console.log('Check project: ' + task.project);
  if(task.project) {
    db.findByID(task.project, function(err, project) {
      if(rc.err(err, callback)) return;
      console.log('Check project project=' + project);
      if(rc.none(project, 'Project was not found: ' + task.project, callback)) return;
      console.log('Check project done.');
      callback(null, project);
      return;
    })
  } else {
    callback(null, null);
  }
}

exports.post = function(task, next){
  var locals = {};
  async.series({
    publishID: function(callback){
      console.log('Publishing ID');
      db.publishUID(function(err, publishedID){
        if(rc.err(err, callback)) return;
        console.log('Published ID: ' + publishedID);
        locals.task = task;
        locals.id = publishedID;
        callback();
      });
    },
    checkProject: function(callback) {
      exports.checkProject(locals.task, function(err, project) {
          if(rc.err(err, callback)) return;
          locals.project = project;
          callback();
      });
    },
    add: function(callback){
      console.log('Adding the task: ' + locals.id);
      db.add(locals.id, locals.task, function(err, task){
        if(rc.err(err, callback)) return;
        callback();
      });
    }
  }, function(err){
    if(rc.err(err, next)) return;
    console.log('Everything has worked fine.');
    next(null, locals);
  });
}

exports.update = function(id, req, next){
  var locals = {};
  async.series({
    getTask: function(callback){
      console.log('Getting the task: ' + id);
      db.findByID(id, function(err, task){
        if(rc.err(err, callback)) return;
        if(rc.none(task, 'Task was not found: ' + id, callback)) return;
        locals.task = reqToTask(req, task);
        callback();
      })
    },
    checkProject: function(callback) {
      exports.checkProject(locals.task, function(err, project) {
          if(rc.err(err, callback)) return;
          locals.project = project;
          callback();
      });
    },
    save: function(callback){
      console.log('Saving the task: ' + id);
      db.save(id, locals.task, function(err, task){
        if(rc.err(err, callback)) return;
        callback();
      });
    }
  }, function(err){
    if(rc.err(err, next)) return;
    console.log('Everything has worked fine.');
    next(null, locals);
  });
}

exports.add = function(req, res){
  var task = reqToTask(req);
  exports.post(task, function(err, locals){
    if(rc.isErr(err, res)) return;
    res.redirect('/task?id=' + locals.id);
  });
};

exports.edit = function(req, res){
  var id = req.param('id');
  exports.update(id, req, function(err, locals){
    if(rc.isErr(err, res)) return;
    res.redirect('/task?id=' + id);
  });
}

exports.show = function(req, res){
  var id = req.param('id');
  db.findByID(id, function(err, task){
    if(rc.isErr(err, res)
       || rc.isNotFound(id, task, res)) return;
    res.render('task.jade', {
      title: 'task:' + id, marked: marked, id: id, task: task
    });
  });
}
