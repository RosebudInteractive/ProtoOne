// модуль сервера
var UccelloServ = require('./public/uccello/uccelloServ');

// Коммуникационные модули
var Router = require('./public/uccello/connection/router');
var UserSessionMgr = require('./public/uccello/connection/userSessionMgr');

// Модули nodejs
var http = require('http');
var express = require('express');
var app = express();

// Обработчики express
// ----------------------------------------------------------------------------------------------------------------------

// обработчик файлов html будет шаблонизатор ejs
app.engine('html', require('ejs').renderFile);

// обработка /tests
app.get('/test', function(req, res){
    res.render('proto1.html');
});

// апдейт
app.get("/update/:what", function(req, res){

    var shell = require('shelljs');

    switch (req.params.what){
        case 'uccello':
            res.writeHead(200,{"Content-Type" : "text/html"});
            res.write('$ cd /var/www/sites/node/ProtoOne/<br>');
            res.write(shell.exec('cd /var/www/sites/node/ProtoOne/').output+'<br><br>');
            res.write('$ git pull<br>');
            res.write(shell.exec('git pull').output+'<br><br>');
            res.write('$ jsdoc public -r -d public/docs<br>');
            res.write(shell.exec('jsdoc public -r -d public/docs').output+'<br><br>');
            res.write('$ forever restart calypso.js<br>');
            res.write(shell.exec('forever restart memserver.js').output+'<br><br>');
            break;
        case 'mobimed':
            res.writeHead(200,{"Content-Type" : "text/html"});
            res.write('$ cd /var/www/sites/mobimed/docs/MobiDoc/<br>');
            res.write(shell.exec('cd /var/www/sites/mobimed/docs/MobiDoc/').output+'<br><br>');
            res.write('$ git pull<br>');
            res.write(shell.exec('git pull').output+'<br><br>');
            break;

    }

    res.end();
});

// статические данные и модули для подгрузки на клиент
app.use("/public", express.static(__dirname + '/public'));
app.use("/tests", express.static(__dirname + '/tests'));

// ----------------------------------------------------------------------------------------------------------------------
// база данных
/*
var Mysql = require('./db/mysql');
var mysql = new Mysql();
var mysqlConnection = mysql.connect({
    host:     'localhost',
    user:     'root',
    password: '111111',
    database: 'mobimed_test'
});
function mysqlAuthenticate(user, pass, done) {
    mysqlConnection.queryRow(
        'SELECT user_id, email FROM user WHERE username=? AND password=MD5(?)', [user, pass],
        function(err, row) {
            done(err, row);
        }
    );
}
*/

/**
 * Функция заглушка для аутентификации
 * @param user
 * @param pass
 * @param done
 */
function fakeAuthenticate(user, pass, done) {
    var err = null, row = null;
    if (user.substring(0, 1)=='u' && pass.substring(0, 1)=='p')
        row = {user_id:1, email:'user@user.com'};
    done(err, row);
}

var myServerApp = {}; // тут все данные
var router = new Router();
myServerApp.userSessionMgr = new UserSessionMgr(router, {authenticate:fakeAuthenticate});

// запускаем вебсокетсервер
var ucelloApp = new UccelloServ({port:8081, userSessionMgr:myServerApp.userSessionMgr});

// запускаем http сервер
http.createServer(app).listen(1325);
console.log('Сервер запущен на http://127.0.0.1:1325/');