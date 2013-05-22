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
          assert(locals.project.createdAt, 'should set createdAt automatically');
          assert(!locals.project.updatedAt, 'should not set createdAt automatically');
        }, done)) return;
        done();
      });
    });
  });

  describe('#edit()', function() {
    it('should update an existing project without error.', function(done) {
      var param = {id: 'UT', name: 'Unit test project',
        desc: 'Updated description.',
        administrators: 'foo, bar',
        collaborators: 'baz'};
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
    it('should update the input fields only.', function(done) {
      projects.get('UT', function(err, project){
        if(err) throw err;
        if(!check(function(){
          assert.equal(project.name, 'Unit test project');
          assert.equal(project.desc, 'Updated description.');
          assert(project.createdAt < project.updatedAt, 'Update date');
          assert(project.administrators, 'Administrators should be set');
          assert.equal(project.administrators.length, 2);
          assert.deepEqual(project.administrators, ['foo', 'bar']);
          assert(project.collaborators, 'Collaborators should be set');
          assert.equal(project.collaborators.length, 1);
          assert.deepEqual(project.collaborators, ['baz']);
        }, done)) return;
        done();
      });
    });
  });

});
