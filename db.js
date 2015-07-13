var pg = require("pg");

var conectionString = "pg://USER:PASSWORD@localhost:5432/postgres";

var client = new pg.Client(conectionString);
client.connect();

exports.getData = function (data, cb) {
  var query = client.query(data);

  query.on("row", function (row, result) {
    result.addRow(row);
  });

  query.on("end", function (result) {
    cb(result);
  });
};