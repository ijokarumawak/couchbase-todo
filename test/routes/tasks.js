var assert = require('assert');
var projects = require('../../routes/projects');
var tasks = require('../../routes/tasks');

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

describe('tasks', function(){

  before(function(done) {
    console.log('waiting for the database connection is established');
    setTimeout(function(){
      // create sample documents.
      // projects.post();
      done();
    }, 1000);
  });

  describe('existance', function() {
    it('should exist.', function(){
      assert(tasks);
    });
  });

  describe('#post()', function() {
    it('should save a task without error.', function(done) {
      var task = {subject: 'Submit from unit test'};
      tasks.post(task, function(err, locals){
        if(err) throw err;
        if(!check(function(){
          assert(locals.id, 'should return the published ID');
          assert.equal(locals.task.type, 'task',
            'should set type automatically');
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
      var _id = '10';
      var _task = {subject: 'Subject'};
      tasks.put(_id, _task, function(err, locals) {
        if(err) throw err;
        done();
      });
    });
  });

  describe('#edit()', function() {
    it('should update an existing task without error.', function(done) {
      var param = {id: '10', desc: 'Updated description.'};
      var req = {param: function(name){return param[name]}};
      var res = {redirect: function(path){
        console.log('redirect is called.');
        if(!check(function(){
          assert.equal(path, '/task?id=10',
            'should redirect to the task view.');
        }, done)) return;
        done();
      }};
      tasks.edit(req, res);
    });
    it('should update the specified fields only.', function(done) {
      tasks.get('10', function(err, task){
        if(err) throw err;
        if(!check(function(){
          assert.equal(task.subject, 'Subject');
          assert.equal(task.desc, 'Updated description.');
        }, done)) return;
        done();
      });
    });
  });


});
