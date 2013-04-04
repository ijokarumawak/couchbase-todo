var GoogleCalendar = require('google-calendar');
var config = require('config');
var googleCalendar = new GoogleCalendar.GoogleCalendar(
  config.GoogleAPI.clientID,
  config.GoogleAPI.clientSecret,
  config.GoogleAPI.redirectURI
);

/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('index', { title: 'Todo Management' });
};
