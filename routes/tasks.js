var DataHandler = require('../db/couchbase.js').DataHandler;
var db = new DataHandler();

exports.post = function(req, res){
  // do some validation.
  var task = {
      subject: req.param('subject'),
      desc: req.param('desc'),
      startDate: req.param('startDate'),
      endDate: req.param('endDate')
  };
  db.publishUID(function(err, id){
    if(err) {
      res.send(util.inspect(err), 500);
      return;
    }
    db.save(id, task, function(err, task){
      if(err) {
        res.send(util.inspect(err), 500);
        return;
      }
      res.redirect('/');
    });
  });
};
