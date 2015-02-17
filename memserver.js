// модуль сервера
var UccelloServ = require('../Uccello/uccelloServ');

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
            res.write('$ forever restart memserver.js<br>');
            //res.write(shell.exec('forever restart memserver.js').output+'<br><br>');
            fakeFunctionForRestart();// node restarted
            break;
        case 'mobimed':
            res.writeHead(200,{"Content-Type" : "text/html"});
            res.write('$ cd /var/www/sites/mobimed/docs/MobiDoc/; git pull<br>');
            res.write(shell.exec('cd /var/www/sites/mobimed/docs/MobiDoc/; git pull').output+'<br><br>');
            break;
            case 'genetix':
            res.writeHead(200,{"Content-Type" : "text/html"});
            res.write('$ cd /var/www/sites/genetix/Genetix/; git pull<br>');
            res.write(shell.exec('cd /var/www/sites/genetix/Genetix/; git pull').output+'<br><br>');
            break;
    }

    res.end();
});

// статические данные и модули для подгрузки на клиент
app.use("/public", express.static(__dirname + '/public'));
app.use("/public/uccello", express.static(__dirname + '/../Uccello'));
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


var config = {
    controls:[
        {className:'Container',component:'container', viewsets:['simpleview'], guid:'1d95ab61-df00-aec8-eff5-0f90187891cf'},
        {className:'Form', component:'form', viewsets:['simpleview'], guid:'7f93991a-4da9-4892-79c2-35fe44e69083'},
        {className:'Button', component:'button', viewsets:['simpleview'], guid:'af419748-7b25-1633-b0a9-d539cada8e0d'},
        {className:'DataGrid', component:'dataGrid', viewsets:['simpleview'], guid:'ff7830e2-7add-e65e-7ddf-caba8992d6d8'},
        {className:'DataEdit', component:'dataEdit', viewsets:['simpleview'], guid:'affff8b1-10b0-20a6-5bb5-a9d88334b48e'},
        {className:'DbNavigator', component:'dbNavigator', viewsets:['simpleview'], guid:'38aec981-30ae-ec1d-8f8f-5004958b4cfa'},
        {className:'Edit',  component:'edit', viewsets:['simpleview'], guid:'f79d78eb-4315-5fac-06e0-d58d07572482'},
        {className:'MatrixGrid', component:'matrixGrid', viewsets:['simpleview'], guid:'827a5cb3-e934-e28c-ec11-689be18dae97'},
        {className:'PropEditor', component:'propEditor', viewsets:['simpleview'], guid:'a0e02c45-1600-6258-b17a-30a56301d7f1'},
        {className:'Label', component:'label', viewsets:['simpleview'], guid:'32932036-3c90-eb8b-dd8d-4f19253fabed'}
    ],
    controlsPath: __dirname+'/../ProtoOne/public/ProtoControls/',
    uccelloPath: __dirname+'/../Uccello/'
};
var uccelloServ = new UccelloServ({port:8081, authenticate:fakeAuthenticate, config:config});

// запускаем http сервер
http.createServer(app).listen(1325);
console.log('Сервер запущен на http://127.0.0.1:1325/');