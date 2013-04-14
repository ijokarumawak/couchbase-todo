var util = require('util'),
    marked = require('marked'),
    rc = require('./response-check.js'),
    DataHandler = require('../db/couchbase.js').DataHandler;
var db = new DataHandler();

function reqToComment(req) {
  var comment = JSON.parse(req.param('comment'));
  comment.type = 'comment';
  return comment;
}

exports.post = function(req, res){
  // do some validation.
  db.publishUID(function(err, id){
    if(rc.isErr(err, res)) return;
    var comment = reqToComment(req);
    comment.createdAt = new Date().getTime();
    db.add(id, comment, function(err, comment){
      if(rc.isErr(err, res)) return;
      res.send(comment);
    });
  });
};

exports.put = function(req, res){
  var id = req.params.id;
  db.findByID(id, function(err, comment){
    if(rc.isErr(err, res)
       || rc.isNotFound(id, comment, res)) return;
    reqToTask(req, comment);
    checkProject(comment.project, function(err, project){
      if(rc.isErr(err, res)
        || rc.isNotFound(comment.project, project, res)) return;
      db.save(id, comment, function(err, comment){
        if(rc.isErr(err, res)) return;
        res.redirect('/comments/' + id);
      });
    });
  });
}

exports.findComments = function(req, res){
  var taskID = req.params.taskID;
  db.findComments(taskID, function(err, comments){
    if(rc.isErr(err, res)) return;
    res.render('comments.jade', {comments: comments, marked: marked});
  });
}
