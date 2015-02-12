var fs = require('fs');
var mysql = require('mysql');
var async = require('async');

var conn = mysql.createConnection({
    host:     'localhost',
    user:     'rudenko',
    password: 'vrWSvr05',
    database: 'uccello'
    /*host:     '54.93.99.65',
     user:     'rudenko',
     password: 'vrWSvr05',
     database: 'uccello'*/
});

conn.query('SELECT * FROM sys WHERE name="dbver"', function(err, rows) {
    if (err) throw err;
    var dbver = 0;
    if (rows.length>0)
        dbver = parseInt(rows[0].value) + 1;

    var tasksIndex = [];
    while(fs.existsSync('./update/'+(dbver)+'.sql')) {
        var sql = fs.readFileSync('./update/'+(dbver)+'.sql', 'utf8');
        (function(dbver, sql) {
            tasksIndex.push(function (callback) {
                conn.query(sql.toString(), function(err, rows) {
                    if (err) throw err;
                    callback(err, rows);
                });
            });
        })(dbver, sql);
        dbver++;
    }

    async.series(tasksIndex, function (err, results) {
        conn.query('UPDATE sys SET value=? WHERE name="dbver"', [dbver-1], function(err, rows) {
            if (err) throw err;
            console.log(results);
        });
    });

});