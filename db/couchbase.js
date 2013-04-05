var driver = require('couchbase');
var config = require('config');

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
  this.cb.get(id.toString(), function(err, doc){
    if(err) {
      if(err.code == 13) {
        console.log('document was not found: ' + id);
        callback(null, null);
      }
      else callback(err, null);
    }
    else callback(null, doc);
  });
}

exports.DataHandler = DataHandler;
