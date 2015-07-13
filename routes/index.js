
/*
 * GET home page.
 */

 var server = require('../server');

exports.index = function(req, res){
  res.render('index', { title: 'Time Series Visualization' , dataGraph: JSON.stringify(server.dataJSON)});
};

exports.dataset = function(req, res){
  var query = "select * from timeseriesuropaccidents";
  var local = req.query.region;
  var type = req.query.types;
  query += " where region='"+local+"' and name='"+type+"'";
  server.connectDB(query, function (data, maxVal, minVal, maxDate, minDate, rowCount){
    res.json({data:data, maxVal:maxVal, minVal:minVal, maxDate:maxDate, minDate:minDate, rowCount:rowCount});
  });
};
