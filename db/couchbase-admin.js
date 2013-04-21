var config = require('config');
var fs = require('fs');
var DataHandler = require('./couchbase.js').DataHandler;
var db = new DataHandler();

var exitCode = 0;
process.on('exit', function(){
  process.exit(exitCode);
});
process.on('uncaughtException', function(err){
  console.error(err);
  usage();
});

var commands = {};

commands.saveDesignDoc = function(args) {
  var designDocumentName = args[0];
  db.saveDesignDoc(designDocumentName, function(err){
    if(err) throw err;
    process.exit();
  });
}

commands.uploadDesignDoc = function(args) {
  var designDocumentName = args[0];
  db.uploadDesignDoc(designDocumentName, function(err){
    if(err) throw err;
    process.exit();
  });
}

function usage(){
  console.log('node db/couchbase-admin.js command [options]',
  '\navailable commands and its options:',
  '\n  saveDesignDoc designDocName',
  '\n  uploadDesignDoc designDocName');
  exitCode = 1;
}


if(process.argv.length < 3) {
  usage();
  return;
}

var command = process.argv[2];
var options = process.argv.slice(3, process.argv.length);
setTimeout(function(){
  commands[command](options);
}, 2000);
