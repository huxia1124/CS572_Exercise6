var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var fs = require('fs');
var validator = require('express-validator');
var csrf = require('csurf');
var session = require('express-session');

var routes = require('./routes/index');
var users = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));



app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser('secret'));  //'secret' is needed by CSRF
app.use(session({}));
//CSRF
app.use(csrf());
//Validator
app.use(validator());
app.use(express.static(path.join(__dirname, 'public')));

//CSRF
app.use(function(req, res, next){
  res.locals.csrftoken = req.csrfToken();
  next();
});

app.use('/', routes);
app.use('/users', users);

//GET
app.get('/contactus', function(req, res){
  res.render('contactus', {});
});

let filename = __dirname + '/data.txt';

//POST
app.post('/contactus', function(req, res, next){
  //Validation
  req.assert('fullname', 'Full name can not be empty!').notEmpty();
  req.assert('message', 'Message can not be empty!').notEmpty();

  var errors = req.validationErrors();
  if(errors) {
     res.render('contactus', {errors: errors});
  } else {

  let donext = next;

  //Write file
    fs.appendFile(filename, JSON.stringify(req.body) + '\r\n', function(err) {
      if(err) {
        err.status = 502;
        donext(err);
      }
      res.render('thankyou', {fullname: req.body.fullname, type: req.body.type});
    });   
  }
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
