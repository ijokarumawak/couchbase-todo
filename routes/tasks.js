var util = require('util'),
    marked = require('marked'),
    DataHandler = require('../db/couchbase.js').DataHandler;
var db = new DataHandler();

function reqToTask(req, task) {
  if(!task) task = {type: 'task'};
  task.subject = req.param('subject');
  task.desc = req.param('desc');
  task.startDate = req.param('startDate');
  task.endDate = req.param('endDate');
  task.body = req.param('body');
  return task;
}

function isErr(err, res) {
  if(err) {
    res.send(util.inspect(err), 500);
    return true;
  }
  return false;
}

exports.addTask = function(req, res){
  res.render('add-task.jade', {title: 'add task'});
};

exports.editTask = function(req, res){
  var id = req.params.id;
  db.findByID(id, function(err, task){
    if(isErr(err, res)) return;
    res.render('edit-task.jade', {
      title: 'edit task', id: id, task:task});
  });
};

exports.post = function(req, res){
  // do some validation.
  var task = reqToTask(req);
  db.publishUID(function(err, id){
    if(isErr(err, res)) return;
    db.save(id, task, function(err, task){
      if(isErr(err, res)) return;
      res.redirect('/tasks/' + id);
    });
  });
};

exports.put = function(req, res){
  var id = req.params.id;
  db.findByID(id, function(err, task){
    if(isErr(err, res)) return;
    reqToTask(req, task);
    db.save(id, task, function(err, task){
      if(isErr(err, res)) return;
      res.redirect('/tasks/' + id);
    });
  });
}

exports.get = function(req, res){
  var id = req.params.id;
  db.findByID(id, function(err, task){
    if(isErr(err, res)) return;
    res.render('task.jade', {
      title: 'task:' + id, marked: marked, id: id, task: task
    });
  });
}
