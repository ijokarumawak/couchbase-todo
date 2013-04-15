var util = require('util');

exports.isErr = function(err, res) {
  if(err) {
    res.send(util.inspect(err), 500);
    return true;
  }
  return false;
}

exports.isNotFound = function(id, obj, res) {
  if(!obj) {
    res.send(id + " was not found.", 404);
    return true;
  }
  return false;
}

exports.err = function(err, callback) {
  if(err) {
    callback(err);
    return true;
  }
  return false;
}

exports.none = function(obj, msg, callback) {
  if(!obj) {
    callback(new Error(msg));
    return true;
  }
  return false;
}
