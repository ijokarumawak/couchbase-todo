
/**
 * Module dependencies.
 */

var express = require('express'),
  routes = require('./routes'),
  tasks = require('./routes/tasks'),
  projects = require('./routes/projects'),
  comments = require('./routes/comments'),
  search = require('./routes/search'),
  users = require('./routes/users'),
  http = require('http'),
  path = require('path'),
  config = require('config'),
  everyauth = require('everyauth');

everyauth.debug = true;
everyauth.password
  .loginWith('login')
  .getLoginPath('/login')
  .postLoginPath('/login')
  .loginView('login.jade')
  .loginLocals(function(req, res, done){
    setTimeout(function(){
      done(null, {title: 'Login'});
    }, 200);
  })
  .authenticate(users.authenticate)
  .registerUser(users.registerUser)
  .getRegisterPath('/register')
  .postRegisterPath('/register')
  .registerView('register.jade')
  .registerLocals( function (req, res, done) {
    setTimeout( function () {
      done(null, {
        title: 'Register'
      });
    }, 200);
  })
  .validateRegistration(users.validateRegistration)
  .loginSuccessRedirect('/')
  .registerSuccessRedirect('/')
  ;

everyauth.everymodule.findUserById(users.findUserByID);

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
  app.use(everyauth.middleware(app));
  app.use(function(req, res, next){
    // make user accessible from view.
    res.locals.user = req.user;
    next();
  });
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

app.get('/', routes.index);

// tasks
app.get('/task', users.checkAuth, tasks.show);
app.get('/add-task', users.checkAuth, tasks.showAddPage);
app.get('/edit-task', users.checkAuth, tasks.showEditPage);
app.post('/add-task', users.checkAuth, tasks.add);
app.post('/edit-task', users.checkAuth, tasks.edit);

// projects
app.get('/project', users.checkAuth, projects.show);
app.get('/add-project', users.checkAuth, projects.showAddPage);
app.get('/edit-project', users.checkAuth, projects.showEditPage);
app.post('/add-project', users.checkAuth, projects.add);
app.post('/edit-project', users.checkAuth, projects.edit);

// comments
app.post('/tasks/:taskID/comments/', users.checkAuth, comments.post);
app.get('/tasks/:taskID/comments/', users.checkAuth, comments.findComments);
app.get('/tasks/:taskID/comments/:commentID', users.checkAuth, comments.findByID);
app.put('/tasks/:taskID/comments/:commentID', users.checkAuth, comments.put);

// search
app.post('/search/', users.checkAuth, search.post);
app.get('/search-result', users.checkAuth, search.showSearchResult);

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
