var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var partials = require('express-partials');
var flash = require('connect-flash');
var session = require('express-session');

var MongoStore = require('connect-mongo')(session);
var settings = require('./settings');

var routes = require('./routes');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(partials());
// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({
	resave: false,  
    saveUninitialized: true, 
	secret: settings.cookieSecret,
	store: new MongoStore({
		url: 'mongodb://localhost/' + settings.db,
		autoRemove: 'native'
	})
}));
app.use(flash());
app.use(express.static(path.join(__dirname, 'public')));

app.use(function(req, res, next) {
	console.log("app.user local");
	res.locals.user = req.session.user;
	res.locals.post = req.session.post;
	var error = req.flash('error');
	res.locals.error = error.length ? error : null;
	var success = req.flash('success');
	res.locals.success = success.length ? success : null;
	next();
});

app.get('/', routes.index);
app.get('favicon.ico', function(req, res){
	res.send();
});
app.get('/u/:user', routes.user);
app.post('/post', routes.checkLogin);
app.post('/post', routes.post);
app.get('/reg', routes.checkNotLogin);
app.get('/reg', routes.reg);
app.post('/reg', routes.checkNotLogin);
app.post('/reg', routes.doReg);
app.get('/login', routes.checkNotLogin);
app.get('/login', routes.login);
app.post('/login', routes.checkNotLogin);
app.post('/login', routes.doLogin);
app.get('/logout', routes.checkLogin);
app.get('/logout', routes.logout);



// catch 404 and forward to error handler
app.use(function(req, res, next) {
	var err = new Error('Not Found');
	err.status = 404;
	next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
