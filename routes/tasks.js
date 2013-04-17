var util = require('util'),
    marked = require('marked'),
    moment = require('moment'),
    rc = require('./response-check.js'),
    async = require('async'),
    DataHandler = require('../db/couchbase.js').DataHandler;
var db = new DataHandler();
 
function reqToTask(req, task) {
  if(!task) task = {type: 'task'};
  var names = ['project', 'subject', 'status', 'desc',
        'startDate', 'startTime', 'endDate', 'endTime', 'body'];
  names.forEach(function(name){
    var p = req.param(name);
    if(p) task[name] = p;
  });
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
  task.type = 'task';
  task.rev = 0;
  task.createdAt = new Date().getTime();
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

exports.put = function(id, task, next){
  task.type = 'task';
  task.updatedAt = new Date().getTime();
  task.rev = typeof(task.rev) === 'undefined'  ? 0 : ++task.rev;
  var locals = {task: task};
  async.series({
    checkProject: function(callback) {
      exports.checkProject(locals.task, function(err, project) {
          if(rc.err(err, callback)) return;
          locals.project = project;
          callback();
      });
    },
    saveRev: function(callback){
      if(typeof(task.revs) === 'undefined') task.revs = [];
      exports.get(id, function(err, currentTask) {
        if(rc.err(err, callback)) return;
        var currentRev = typeof(currentTask.rev) === 'undefined' ?
          0 : currentTask.rev;
        // Keep revision's information within the task.
        task.revs.unshift({
          rev: currentRev,
          status: currentTask.status,
          timestamp: currentTask.updatedAt ?
            currentTask.updatedAt : currentTask.createdAt});
        var revID = id + '-' + currentRev
        currentTask.type = 'taskRev';
        console.log('Saving the task\'s rev: ' + revID);
        db.save(revID, currentTask, function(err){
          if(rc.err(err, callback)) return;
          callback();
        });
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

exports.get = function(id, next){
  db.findByID(id, function(err, doc){
    if(rc.err(err, next)) return;
    next(null, doc);
  });
}

exports.delete = function(id, next){
  var deleteIDs = [id];
  exports.get(id, function(err, task){
    if(rc.err(err, next)) return;
    if(task.revs) {
      task.revs.forEach(function(r){
        deleteIDs.push(id + '-' + r.rev);
      });
    }
    async.each(deleteIDs, function(deleteID, callback){
      db.remove(deleteID, function(err){
        if(rc.err(err, callback)) return;
        callback();
      });
    }, function(err){
      if(rc.err(err, next)) return;
      next(null);
    });
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
  exports.get(id, function(err, task) {
    if(rc.isErr(err, res)
      || rc.isNotFound(id, task, res)) return;
    reqToTask(req, task);
    exports.put(id, task, function(err, locals){
      if(rc.isErr(err, res)) return;
      res.redirect('/task?id=' + id);
    });
  });
}

exports.show = function(req, res){
  var id = req.param('id');
  var rev = -1;
  if(id.indexOf('-') > -1) {
    var ids = id.split('-');
    id = ids[0];
    rev = ids[1];
  }
  db.findByID(id, function(err, task){
    if(rc.isErr(err, res)
       || rc.isNotFound(id, task, res)) return;
    var values = {title: 'task:' + id, marked: marked, moment: moment,
     id: id, task: task};

    if(rev == -1){
      res.render('task.jade', values);
    } else {
      res.render('task-rev.jade', values);
    }
  });
}
