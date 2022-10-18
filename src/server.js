const express = require('express');
const fs = require('fs');
const path = require('path');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const controllers = require('./controllers');
const mintTrackerService = require('./services/MintTrackerService');

const port = process.env.PORT || 3000;
const db = require('./db/DataBase');

const app = express();

const accessLogStream = fs.createWriteStream(path.join(__dirname, '../logs/access.log'), { flags: 'a' });
app.use(morgan('combined', { stream: accessLogStream }));

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

//Pass database config settings
db.init();

Object.keys(controllers).forEach(controllerName => {
  app.use(`/api/${controllerName}`, controllers[controllerName]);
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    console.log(err.message);
    res.status(err.status || 500)
      .json({
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  console.log(err.message);
  res.status(err.status || 500)
  .json({
    message: err.message,
    error: {}
  });
});

app.listen(port, function (err) {
    console.log('[%s] Listening on http://localhost:%d', app.settings.env, port);
});

mintTrackerService.startTracking();

//*********************************************************
//    Quick and dirty way to detect event loop blocking
//*********************************************************
let lastLoop = Date.now();

function monitorEventLoop() {
    const time = Date.now();
    if (time - lastLoop > 1000) console.error('Event loop blocked ' + (time - lastLoop));
    lastLoop = time;
    setTimeout(monitorEventLoop, 200);
}

if (process.env.NODE_ENV === 'development') {
    monitorEventLoop();
}



module.exports = app;
