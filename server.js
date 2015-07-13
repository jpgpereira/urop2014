
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var http = require('http');
var path = require('path');
var db = require('./db.js');

var app = express();
var fires_data, accidents_data;

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);
app.get('/dataset', routes.dataset);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

function connectDB (query, cb) {
  db.getData(query, function (dbData) {
    var rowCount = dbData.rowCount;
    var maxVal, minVal, maxDate, minDate;
    var graphData = {};
    for (var i = 0; i < rowCount; i++) {
      var key = dbData.rows[i].date.getTime()/1000;
      var value = dbData.rows[i].value;
      graphData[key] = value;
      if(i===0){
        maxVal = value;
        minVal = value;
        maxDate = key;
        minDate = key;
      }
      if (value > maxVal)
        maxVal = value;
      else if (value < minVal)
        minVal = value;
      if (key > maxDate)
        maxDate = key;
      else if (key < minDate)
        minDate = key;
    };
    cb(graphData, maxVal, minVal, maxDate, minDate, rowCount);
  });
}
exports.connectDB = connectDB;
