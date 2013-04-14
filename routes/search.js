var util = require('util'),
    marked = require('marked'),
    moment = require('moment'),
    rc = require('./response-check.js'),
    search = require('../search/elasticsearch.js');

exports.post = function(req, res){
  search.searchAll(req.param('q'), function(err, docs){
    if(rc.isErr(err, res)) return;
    res.send(docs);
  });
}

exports.showSearchResult = function(req, res) {
  search.searchAll(req.param('q'), function(err, docs){
    if(rc.isErr(err, res)) return;
    res.render('search-result.jade', {title: 'search result', docs: docs});
  });
}
