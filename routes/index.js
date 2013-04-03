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
  console.log('AccessToken=' + req.session.accessToken);
  if(req.session.accessToken) {
    googleCalendar.sendRequest('get', 'https://www.googleapis.com/oauth2/v1/userinfo', req.session.accessToken, function(err, result) {
      console.log("result=" + result);
      res.send(result);
    });
  }

  /*
  if(req.session.logged) res.send('Welcom back!');
  else {
    req.session.logged = true;
    res.send('Welcome!');
  }
  */
  // res.render('index', { title: 'Express' });
};
