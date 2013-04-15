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

describe('projects', function(){

  before(function(done) {
    console.log('waiting for the database connection is established');
    setTimeout(function(){
      // create sample documents.
      // projects.post();
      done();
    }, 1000);
  });

  describe('projects', function() {
    it('should exist.', function(){
      assert(projects);
    });
  });

  describe('#put()', function() {
    it('should save a project without error.', function(done) {
      var project = {name: 'Unit test project'};
      var id = "UT";
      projects.put(id, project, function(err, locals){
        if(err) throw err;
        if(!check(function(){
          assert.equal(locals.project.type, 'project',
            'should set type automatically');
        }, done)) return;
        done();
      });
    });
  });

  describe('#edit()', function() {
    it('should update an existing project without error.', function(done) {
      var param = {id: 'UT', desc: 'Updated description.'};
      var req = {param: function(name){return param[name]}};
      var res = {redirect: function(path){
        console.log('redirect is called.');
        if(!check(function(){
          assert.equal(path, '/project?id=UT',
            'should redirect to the project view.');
        }, done)) return;
        done();
      }};
      projects.edit(req, res);
    });
    it('should update the specified fields only.', function(done) {
      projects.get('UT', function(err, project){
        if(err) throw err;
        if(!check(function(){
          assert.equal(project.name, 'Unit test project');
          assert.equal(project.desc, 'Updated description.');
        }, done)) return;
        done();
      });
    });
  });

});
