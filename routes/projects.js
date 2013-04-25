var util = require('util'),
    marked = require('marked'),
    async = require('async'),
    rc = require('./response-check.js'),
    DataHandler = require('../db/couchbase.js').DataHandler;
var db = new DataHandler();

function reqToProject(req, project) {
  if(!project) project = {type: 'project'};
  var names = ['name', 'desc', 'body'];
  names.forEach(function(name){
    var p = req.param(name);
    if(p) project[name] = p;
    else delete(project[name]);
  });
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

exports.put = function(id, _project, next){
  _project.type = 'project';
  var locals = {project: _project};
  async.series({
    save: function(callback){
      console.log('Saving the project: ' + id);
      db.save(id, locals.project, function(err, project){
        if(rc.err(err, callback)) return;
        callback();
      });
    }
  }, function(err){
    if(rc.err(err, next)) return;
    next(null, locals);
  });
}

exports.get = function(id, next){
  db.findByID(id, function(err, doc){
    if(rc.err(err, next)) return;
    next(null, doc);
  });
}

exports.add = function(req, res){
  // do some validation.
  var project = reqToProject(req);
  var id = req.param('id');
  exports.put(id, project, function(err, project){
    if(rc.isErr(err, res)) return;
    res.redirect('/project?id=' + id);
  });
};

exports.edit = function(req, res){
  var id = req.param('id');
  exports.get(id, function(err, project) {
    if(rc.isErr(err, res)
      || rc.isNotFound(id, project, res)) return;
    reqToProject(req, project);
    exports.put(id, project, function(err, locals){
      if(rc.isErr(err, res)) return;
      res.redirect('/project?id=' + id);
    });
  });

}

exports.show = function(req, res){
  var id = req.param('id');
  var findTasks = function(project) {
    db.findTasksByProject(id, function(err, tasks){
      if(rc.isErr(err, res)) return;
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
