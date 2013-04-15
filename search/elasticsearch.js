var ElasticSearchClient = require('elasticsearchclient');
var config = require('config');
var async = require('async');
var DataHandler = require('../db/couchbase.js').DataHandler;
var db = new DataHandler();

var es = new ElasticSearchClient(config.ElasticSearch.connection);

exports.searchAll = function(queryString, callback){
  var q = {
    "query":{
      "bool":{
      "must":[
        {"query_string": {"default_field": "_all", "query": queryString}}
      ]
      },
      "from":0,
      "size":50
    }
  };
  
  es.search('todo', 'couchbaseDocument', q, function(err, data){
    if(err) {
      callback(err);
    }
    var res = JSON.parse(data);
    var hits = new Array();
    if(!res.hits) {
      callback(null, hits);
      return;
    }
    async.eachIndex(res.hits.hits, function(hit, i, callback) {
      db.findByID(hit._id, function(err, doc) {
        if(err) {
          callback(err);
          return;
        }
        var d;
        if(doc.type == 'task') {
          d = {id: hit._id, type: doc.type, title: doc.subject, desc: doc.desc};
        } else if(doc.type == 'comment') {
          d = {id: hit._id, task: doc.task, type: doc.type};
        } else {
          d = {id: hit._id, type: doc.type, title: doc.name, desc: doc.desc};
        }
        hits[i] = d;
        callback();
      });
    }, function(err){
      if(err){
        callback(err);
        return;
      }
      callback(null, hits);
    });
  });

}

