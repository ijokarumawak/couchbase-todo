var util = require('util'),
    marked = require('marked'),
    moment = require('moment'),
    rc = require('./response-check.js'),
    async = require('async'),
    DataHandler = require('../db/couchbase.js').DataHandler;
var db = new DataHandler();

function createUser(userID, user, callback){
  // TODO: use hash and salt instead of storing password.
  // https://github.com/bnoguchi/everyauth
  // I failed to install bcrypt module, so let's postpone for now.
  // delete user.password;
  console.log('Adding new user:' + userID); 
  user.type = 'user';
  user.createdAt = new Date().getTime();
  delete user.login;
  user.id = userID;
  db.add(userID, user, function(err, cas){
    if(rc.err(err, callback)) return;
    callback(null, user, cas);
    return;
  });
}

exports.validateRegistration = function(user, errors){
  console.log('Validating registration:' + user);
  return errors;
}

exports.registerUser = function(user) {
  var userID = user[this.loginKey()];
  var promise = this.Promise();
 
  console.log('Adding new user:' + userID); 
  createUser(userID, user, function(err, createdUser){
    if(err) return promise.fail(err);
    console.log('Fullfilling promise:' + userID); 
    return promise.fulfill(createdUser);
  });
  return promise;
}

exports.findUserByID = function(userID, callback){
  db.findByID(userID, function(err, user){
    callback(err, user);
  });
}

exports.authenticate = function(login, password) {
    var promise = this.Promise();
    var errors = [];
    if (!login) errors.push('Missing login');
    if (!password) errors.push('Missing password');
    if (errors.length) return errors;
    exports.findUserByID(login, function(err, user){
      if (err) return promise.fulfill(err);
      if (!user) return promise.fulfill(['Login failed']);
      if (user.password !== password) return promise.fulfill(['Login failed.']);
      promise.fulfill(user);
    });
    return promise;
}