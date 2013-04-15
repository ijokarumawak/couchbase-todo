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


});
