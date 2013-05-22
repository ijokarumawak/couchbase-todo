var assert = require('assert');
var projects = require('../../routes/projects');
var tasks = require('../../routes/tasks');
var async = require('async');

/* An utility function used for catching assertion exceptions within an async it(). */
function check(asserts, done) {
  try {
    asserts();
  } catch(e) {
    done(e);
    return false;
  }
  return true;
}

var deleteIDs = [];
describe('tasks', function(){

  before(function(done) {
    console.log('waiting for the database connection is established');
    setTimeout(function(){
      // create sample documents.
      projects.put('todo', {name: 'todo application'}, function(){
        done();
      });
    }, 1000);
  });

  describe('existance', function() {
    it('should exist.', function(){
      assert(tasks);
    });
  });

  var publishedID;
  describe('#post()', function() {
    it('should save a task without error.', function(done) {
      var task = {subject: 'Submit from unit test'};
      tasks.post(task, function(err, locals){
        publishedID = locals.id;
        deleteIDs.push(publishedID);
        if(err) throw err;
        if(!check(function(){
          assert(typeof(locals.id) !== 'undefined',
            'should return the published ID');
          assert.equal(locals.task.type, 'task',
            'should set type automatically');
          assert(locals.task.createdAt);
          assert(!locals.task.updatedAt);
          assert.equal(locals.task.rev, 0, 'rev should be 0');
        }, done)) return;
        done();
      });
    });

    it('should save a task without error.', function(done) {
      var task = {
        subject: 'Belongs to a project.',
        project: 'todo'
      };
      tasks.post(task, function(err, locals){
        if(err) throw err;
        // Use this document to test PUT.
        publishedID = locals.id;
        deleteIDs.push(publishedID);
        if(!check(function(){
          assert(locals.project,
            'should return the project which the task is related to..');
        }, done)) return;
        done();
      });
    });
  });

  describe('#put()', function() {
    it('should update an existing task without error.', function(done) {
      var _id = publishedID;
      console.log('publishedID=' + publishedID);
      tasks.get(_id, function(err, task){
        if(err) throw err;
        tasks.put(_id, task, function(err, locals) {
          if(err) throw err;
          if(!check(function(){
            assert(locals.task.updatedAt > locals.task.createdAt);
            assert.equal(locals.task.rev, 1, 'rev should be increased.');
          }, done)) return;
          done();
        });
      });
    });
    it('should create a revision with old state.', function(done) {
      tasks.get(publishedID + '-0', function(err, revTask){
        if(err) throw err;
        if(!check(function() {
          assert(revTask, 'should create a revision.');
          assert.equal(revTask.rev, 0, 'should remain revision\'s values.');
          assert.equal(revTask.type, 'taskRev', 'should be saved as a taskRev.');
        }, done));
        done();
      });
    });
  });

  describe('#edit()', function() {
    it('should update an existing task without error.', function(done) {
      var param = {id: publishedID,
        subject: 'Belongs to a project.',
        desc: 'Updated description.'};
      var req = {param: function(name){return param[name]}};
      var res = {redirect: function(path){
        console.log('redirect is called.');
        if(!check(function(){
          assert.equal(path, '/task?id=' + publishedID,
            'should redirect to the task view.');
        }, done)) return;
        done();
      }};
      tasks.edit(req, res);
    });
    it('should update the specified fields only.', function(done) {
      tasks.get(publishedID, function(err, task){
        if(err) throw err;
        if(!check(function(){
          assert.equal(task.subject, 'Belongs to a project.');
          assert.equal(task.desc, 'Updated description.');
        }, done)) return;
        done();
      });
    });
  });

  after(function(done){
    async.each(deleteIDs, function(id, callback) {
      tasks.delete(id, function(err){
        callback(err);
      });
    }, function(err){
      done(err);
    });
  });

});
