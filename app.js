
/**
 * Module dependencies.
 */

var express = require('express'),
  routes = require('./routes'),
  user = require('./routes/user'),
  auth = require('./routes/auth'),
  tasks = require('./routes/tasks'),
  projects = require('./routes/projects'),
  comments = require('./routes/comments'),
  search = require('./routes/search'),
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

// tasks
app.get('/task', tasks.show);
app.get('/add-task', tasks.showAddPage);
app.get('/edit-task', tasks.showEditPage);
app.post('/add-task', tasks.add);
app.post('/edit-task', tasks.edit);

// projects
app.get('/project', projects.show);
app.get('/add-project', projects.showAddPage);
app.get('/edit-project', projects.showEditPage);
app.post('/add-project', projects.add);
app.post('/edit-project', projects.edit);

// comments
app.post('/tasks/:taskID/comments/', comments.post);
app.get('/tasks/:taskID/comments/', comments.findComments);
app.get('/tasks/:taskID/comments/:commentID', comments.findByID);
app.put('/tasks/:taskID/comments/:commentID', comments.put);

// search
app.post('/search/', search.post);
app.get('/search-result', search.showSearchResult);

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
