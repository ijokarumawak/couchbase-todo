var util = require('util'),
    marked = require('marked'),
    moment = require('moment'),
    rc = require('./response-check.js'),
    async = require('async'),
    bcrypt = require('bcrypt'),
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
  var password = user.password;
  delete user.password;
  var salt = bcrypt.genSaltSync();
  user.hash = bcrypt.hashSync(password, salt);
 
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
      bcrypt.compare(password, user.hash, function(err, didSucceed){
        if(err){
          return promise.fail(err);
        }
        if(didSucceed) return promise.fulfill(user);
        errors.push('Login failed');
        return promise.fulfill(errors);
      })
    });
    return promise;
}

exports.checkAuth = function(req, res, next){
  if(!req.user){
    res.send('You are not authorized to view this page.', 403);
    return;
  }
  // Invalidate cache.
  res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
  next();
};
