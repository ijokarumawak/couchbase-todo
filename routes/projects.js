var util = require('util'),
    marked = require('marked'),
    async = require('async'),
    rc = require('./response-check.js'),
    _tasks = require('./tasks.js'),
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

  var arrayNames = ['administrators', 'collaborators'];
  arrayNames.forEach(function(name){
    var p = req.param(name);
    if(p) {
      project[name] = [];
      var ps = p.split(',');
      ps.forEach(function(v){
        if(v)project[name].push(v.trim());
      });
    } else {
      delete(p);
    }
  });

  return project;
}

exports.showAddPage = function(req, res){
  res.render('add-project.jade', {title: 'add project', project: {}});
};

function doNotHaveEditPrivilege(user, project, res){
  if(project.administrators
    && project.administrators.indexOf(user.id) == -1) {
    res.send(403, 'You don\'t have privilege to edit this project.');
    return true;
  }
  return false;
}

function doNotHaveBrowsePrivilege(user, project, res){
  // If there is no administrator, then everyone can see it.
  if(!project.administrators) return false;
  // An administrator can see it.
  if(project.administrators.indexOf(user.id) > -1) return false;
  // A collaborator can see it.
  if(project.collaborators
    && project.collaborators.indexOf(user.id) > -1) return false;
  res.send(403, 'You don\'t have privilege to browse this project.');
  return true;
}

exports.showEditPage = function(req, res){
  var id = req.param('id');
  db.findByID(id, function(err, project){
    if(rc.isErr(err, res)
       || rc.isNotFound(id, project, res)) return;
    if(doNotHaveEditPrivilege(req.user, project, res)) return;
    res.render('edit-project.jade', {
      title: 'edit project', id: id, project:project});
  });
};

exports.put = function(id, _project, next){
  _project.type = 'project';
  if(typeof(_project.createdAt) === 'undefined'){
    _project.createdAt = new Date().getTime();
  } else {
    _project.updatedAt = new Date().getTime();
  }
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

exports.delete = function(id, next){
  db.remove(id, function(err){
    if(rc.err(err, next)) return;
    db.findTasksByProject(id, function(err, tasks){
      if(rc.err(err, next)) return;
      async.each(tasks, function(task, callback){
        _tasks.delete(task.id.toString(), function(err){
          console.log('deleting task:' + task.id);
          if(rc.err(err, callback)) return;
          callback();
        });
      }, function(err){
        if(rc.err(err, next)) return;
        next(null);
      });
    });
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
    if(doNotHaveEditPrivilege(req.user, project, res)) return;
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

    if(doNotHaveBrowsePrivilege(req.user, project, res)) return;
    findTasks(project);
  });
}
