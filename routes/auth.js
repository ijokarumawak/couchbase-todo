var GoogleCalendar = require('google-calendar');
var config = require('config');
var googleCalendar = new GoogleCalendar.GoogleCalendar(
  config.GoogleAPI.clientID,
  config.GoogleAPI.clientSecret,
  config.GoogleAPI.redirectURI
);

/*
 * Authenticate the user.
 */
exports.auth = function(req, res){
  var scopes = [
    'https://www.googleapis.com/auth/calendar',
    'https://www.googleapis.com/auth/userinfo.profile'
  ];
  if(!req.query.code){
    googleCalendar.oauth.getGoogleAuthorizeTokenURL(scopes, function(err, redirecUrl) {
      if(err) return res.send(500, err);
      return res.redirect(redirecUrl);
    });
  } else {
    googleCalendar.getGoogleAccessToken(req.query,
    function(err, accessToken, refreshToken) {
      if(err) return res.send(500, err);
      // Keep the tokens in session.
      req.session.accessToken = accessToken;
      req.session.refreshToken = refreshToken;
      return res.redirect('/');
    });
  }
};
