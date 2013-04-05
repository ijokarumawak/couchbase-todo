
/**
 * Module dependencies.
 */

var express = require('express'),
  routes = require('./routes'),
  user = require('./routes/user'),
  auth = require('./routes/auth'),
  tasks = require('./routes/tasks');
  http = require('http'),
  path = require('path'),
  config = require('config');

var app = express();

app.configure(function(){
  app.set('port', config.Express.port || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser(config.Express.cookieSecret));
  app.use(express.session());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

app.get('/', routes.index);
app.get('/login', function(req, res){
  res.render('login.jade', {title: 'login'});
});
app.get('/auth', auth.auth);
app.get('/users', user.list);
app.get('/add-task', tasks.addTask);
app.post('/tasks', tasks.post);
app.get('/tasks/:id', tasks.get);
app.get('/edit-task/:id', tasks.editTask);
app.post('/tasks/:id', tasks.put);

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
