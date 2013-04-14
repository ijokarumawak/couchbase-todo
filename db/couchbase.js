var driver = require('couchbase');
var config = require('config');
var async = require('async');
var Memcached = require('memcached');
var memcached = new Memcached('192.168.163.144:11212');

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
      calllback(err);
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

DataHandler.prototype.findByID = function(id, callback) {
  // this.cb.get(id.toString(), function(err, doc){
  console.log('trying to get the data using memcached');
  memcached.get(id.toString(), function(err, doc){
    console.log('err=' + err);
    console.log('doc=' + doc);
    if(err) {
      if(err.code == 13) {
        console.log('document was not found: ' + id);
        callback(null, null);
      }
      else callback(err, null);
    }
    else {
      callback(null, JSON.parse(doc));
    }
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
  this.cb.view('dev_task', 'project', q, function(err, res){
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
  console.log(JSON.stringify(q));
  this.cb.view('dev_comment', 'by_task', q, function(err, res){
    if(err){
      callback(err);
      return;
    }
    var comments = new Array();
    async.eachIndex(res, function(r, i, callback) {
      // Retrieve each comment asynchronouslly.
      memcached.get(r.id, function(err, doc){
        if(err) {
          callback(err);
          return;
        }
        comments[i] = JSON.parse(doc);
        callback();
      });
    }, function(err) {
      // Call outer callback with retrieved comments or raised error.
      if(err){
        callback(err);
      }
      callback(null, comments);
    });
  });
}

exports.DataHandler = DataHandler;
