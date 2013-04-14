var util = require('util'),
    marked = require('marked'),
    moment = require('moment'),
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
  var id = req.params.commentID;
  db.findByID(id, function(err, comment){
    if(rc.isErr(err, res)
       || rc.isNotFound(id, comment, res)) return;
    var reqComment = reqToComment(req);
    comment.body = reqComment.body;
    comment.updatedAt = new Date().getTime();
    db.save(id, comment, function(err, comment){
      if(rc.isErr(err, res)) return;
      res.send(comment);
    });
  });
}

exports.findComments = function(req, res){
  var taskID = req.params.taskID;
  db.findComments(taskID, function(err, comments){
    if(rc.isErr(err, res)) return;
    res.render('comments.jade', {comments: comments, marked: marked, moment: moment});
  });
}

exports.findByID = function(req, res){
  var commentID = req.params.commentID;
  db.findByID(commentID, function(err, comment){
    if(rc.isErr(err, res)
       || rc.isNotFound(commentID, comment, res)) return;
    res.send(comment);
  });
}
