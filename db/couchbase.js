var driver = require('couchbase');
var config = require('config');
var async = require('async');
var fs = require('fs');

DataHandler = function(){};

driver.connect(config.Couchbase.connection, function(err, cb){
  if(err) throw (err);
  console.log('Connecting to Couchbase.');
  DataHandler.prototype.cb = cb;
  console.log('Established a connection to Couchbase.');
});

DataHandler.prototype.publishUID = function(callback) {
  this.cb.incr('uid', function(err, id){
    if(err) {
      callback(err);
      return;
    }
    callback(null, id);
  });
};

DataHandler.prototype.add = function(id, data, callback) {
  this.cb.add(id.toString(), data, callback);
};

DataHandler.prototype.save = function(id, data, callback) {
  this.cb.set(id.toString(), data, callback);
};

DataHandler.prototype.remove = function(id, callback) {
  this.cb.remove(id.toString(), callback);
};

DataHandler.prototype.findByID = function(id, callback) {
  this.cb.get(id.toString(), function(err, doc){
    console.log('err=' + err);
    console.log('doc=' + doc);
    if(err) {
      if(err.code == driver.errors.keyNotFound) {
        console.log('document was not found: ' + id);
        callback(null, null);
        return;
      }
      else {
        callback(err, null);
        return;
      }
    }
    callback(null, doc);
  });
}

DataHandler.prototype.findProjects = function(callback) {
  var q = {reduce: 'true', group: true, group_level: 1};
  this.cb.view('dev_project', 'summary', q, function(err, res){
    if(err){
      callback(err);
      return;
    }
    var projects = new Array();
    for(var i = 0; i < res.length; i++){
      projects[i] = {
        id: res[i].key,
        summary: res[i].value
      };
    }
    callback(null, projects);
  });
}

DataHandler.prototype.findTasksByProject = function(projectId, callback) {
  var q = {'key': projectId, 'stale': false};
  this.cb.view('dev_task', 'by_project', q, function(err, res){
    if(err){
      callback(err);
      return;
    }
    var tasks = new Array();
    for(var i = 0; i < res.length; i++){
      tasks[i] = res[i].value;
      tasks[i].id = res[i].id;
    }
    callback(null, tasks);
  });
}

DataHandler.prototype.findComments = function(taskID, callback) {
  var q = {'stale': false,
    'descending': true,
    'startkey' : [Number(taskID), "X"],
    'endkey' : [Number(taskID)]
  };
  var cb = this.cb;
  cb.view('dev_comment', 'by_task', q, function(err, res){
    if(err){
      callback(err);
      return;
    }
    var comments = new Array();
    async.eachIndex(res, function(r, i, callback) {
      cb.get(r.id, function(err, doc){
        if(err) {
          callback(err);
          return;
        }
        comments[i] = doc;
        comments[i].id = r.id;
        callback();
      });
    }, function(err) {
      // Call outer callback with retrieved comments or raised error.
      if(err){
        callback(err);
        return;
      }
      callback(null, comments);
    });
  });
}

DataHandler.prototype.saveDesignDoc = function(name, callback){
  var file = config.Couchbase.designDocs.localDir + '/' + name + '.json';
  this.cb.getDesignDoc(name, function(err, data){
    if(err) {
      callback(err);
      return;
    }
    fs.writeFile(file, JSON.stringify(data), function(err){
      if(err) {
        callback(err);
        return;
      }
      callback();
    });
  });
}

DataHandler.prototype.uploadDesignDoc = function(name, callback){
  var file = config.Couchbase.designDocs.localDir + '/' + name + '.json';
  var cb = this.cb;
  fs.readFile(file, 'utf-8', function(err, data){
    console.log(data);
    if(err){
      callback(err);
      return;
    }
    cb.setDesignDoc(name, data, function(err) {
      if(err) {
        callback(err);
        return;
      }
      callback();
    });
  });
}

exports.DataHandler = DataHandler;
