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

DataHandler.prototype.save = function(id, data, callback) {
  this.cb.set(id.toString(), data, callback);
};

DataHandler.prototype.findByID = function(id, callback) {
  this.cb.get(id.toString(), callback);
}

exports.DataHandler = DataHandler;
