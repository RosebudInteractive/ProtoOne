// дирректория где лежит Uccello
var uccelloDir = process.argv[2]?process.argv[2]:'Uccello';
console.log('Using folder: '+uccelloDir);

// Модули nodejs
var http = require('http');
var express = require('express');
var bodyParser = require("body-parser");
var app = express();
app.use(bodyParser.urlencoded({ extended: false }));

// Обработчики express
// ----------------------------------------------------------------------------------------------------------------------

// обработчик файлов html будет шаблонизатор ejs
app.engine('html', require('ejs').renderFile);

// обработка /tests
app.get('/test', function(req, res){
    res.render('proto1.html');
});
app.get('/build', function(req, res){
    res.render('proto1build.html');
});

// апдейт
app.get("/update/:what", function(req, res){

    var shell = require('shelljs');

    switch (req.params.what){
        case 'uccelloold':
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
            res.write('$ cd /var/www/sites/genetix/Uccello/; git pull<br>');
            res.write(shell.exec('cd /var/www/sites/genetix/Uccello/; git pull').output+'<br><br>');
            break;
        case 'proto':
            res.writeHead(200,{"Content-Type" : "text/html"});
            res.write('$ cd /var/www/sites/node/ProtoOne/; git pull<br>');
            res.write(shell.exec('cd /var/www/sites/node/ProtoOne/; git pull').output+'<br><br>');
            fakeFunctionForRestart();// node restarted
            break;
        case 'uccello':
            res.writeHead(200,{"Content-Type" : "text/html"});
            res.write('$ cd /var/www/sites/node/Uccello/; git pull<br>');
            res.write(shell.exec('cd /var/www/sites/node/Uccello/; git pull').output+'<br><br>');
            fakeFunctionForRestart();// node restarted
            break;
        case 'restart':
            res.writeHead(200,{"Content-Type" : "text/html"});
            res.write('$ cd /var/www/sites/node/ProtoOne/; forever restart memserver.js<br>');
            res.write(shell.exec('cd /var/www/sites/node/ProtoOne/; forever restart memserver.js').output+'<br><br>');
            break;
    }

    res.end();
});

// админ
app.get('/admin', function(req, res){
    res.render('admin.html');
});
app.post("/admin/:what", function(req, res) {

    function execCommand(command) {
        res.write('$ '+command+'<br>');
        var output = shell.exec(command).output;
        output = output.replace(new RegExp("https://(.*?)@(.*)",'g'), 'https://$2');
        output = output?output:'Ok';
        res.write(output+'<br>');
    }

    var shell = require('shelljs');
    res.writeHead(200,{"Content-Type" : "text/html"});
    switch (req.params.what){
        case 'branch':
        case 'checkout':
        case 'merge':
            var projectPath = null;
            var branchName = req.body.branchName;
            var gitCmd = req.params.what;
            switch (req.body.branchProject){
                case 'TestProject':
                    projectPath = '/var/www/sites/node/MatrixExample/';
                    break;
                case 'Uccello':
                    projectPath = '/var/www/sites/node/Uccello/';
                    break;
                case 'ProtoOne':
                    projectPath = '/var/www/sites/node/ProtoOne/';
                    break;
                case 'Genetix':
                    projectPath = '/var/www/sites/genetix/Genetix/';
                    break;
            }
            if (projectPath && branchName) {
                var cmd = 'cd '+projectPath+'; git '+gitCmd+' '+branchName;
                execCommand(cmd);
                // publish branch
                if (req.params.what == 'branch') {
                    cmd = 'cd '+projectPath+'; git push -u origin '+branchName;
                    execCommand(cmd);
                }
            } else {
                res.write('Error: не задан проект или название ветки');
            }
            break;
        case 'update':
            var projectPath = null;
            switch (req.body.serverProject){
                case 'Uccello':
                    projectPath = '/var/www/sites/node/Uccello/';
                    break;
                case 'ProtoOneNginx':
                    projectPath = '/var/www/sites/node/ProtoOne/';
                    break;
                case 'ProtoOne':
                    projectPath = '/var/www/sites/node/ProtoOne/';
                    break;
                case 'Genetix':
                    projectPath = '/var/www/sites/genetix/Genetix/';
                    break;
            }
            if (projectPath) {
                var cmd = 'cd '+projectPath+'; git pull';
                execCommand(cmd);
            } else {
                res.write('Error: метод не поддерживается');
            }
            break;
        case 'restart':
            var projectPath = null;
            var projectFile = null;
            switch (req.body.serverProject){
                case 'ProtoOneNginx':
                    projectPath = '/var/www/sites/node/ProtoOne/';
                    projectFile = 'memservernginx.js';
                    break;
                case 'ProtoOne':
                    projectPath = '/var/www/sites/node/ProtoOne/';
                    projectFile = 'memserver.js';
                    break;
                case 'Genetix':
                    projectPath = '/var/www/sites/genetix/Genetix/';
                    projectFile = 'genetixSrv.js';
                    break;
            }
            if (projectPath && projectFile) {
                var cmd = 'cd '+projectPath+'; forever restart '+projectFile;
                execCommand(cmd);
            } else {
                res.write('Error: метод не поддерживается');
            }
            break;
    }
    res.end();
});

// компрессия статики
var compress = require('compression');
app.use(compress());

// статические данные и модули для подгрузки на клиент
app.use("/public", express.static(__dirname + '/public'));
app.use("/public/uccello", express.static(__dirname + '/../'+uccelloDir));
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
        row = {user:user, user_id:1, email:user+'@gmail.com'};
    else {
        var users = {
            'Ivan':'123',
            'Olivier':'123',
            'Plato':'123'
        };
        if (users[user] && users[user]==pass) {
            row = {user:user, user_id:1, email:user+'@gmail.com'};
        }
    }
    done(err, row);
}


var config = {
    controls:[
        {className:'DataContact', component:'../DataControls/dataContact', guid:'73596fd8-6901-2f90-12d7-d1ba12bae8f4'},
        {className:'DataContract', component:'../DataControls/dataContract', guid:'08a0fad1-d788-3604-9a16-3544a6f97721'},
        {className:'DataCompany', component:'../DataControls/dataCompany', guid:'59583572-20fa-1f58-8d3f-5114af0f2c51'},
        {className:'DataAddress', component:'../DataControls/dataAddress', guid:'16ec0891-1144-4577-f437-f98699464948'},
        {className:'DataLead', component:'../DataControls/dataLead', guid:'86c611ee-ed58-10be-66f0-dfbb60ab8907'},
        {className:'DataIncomeplan', component:'../DataControls/dataIncomeplan', guid:'56cc264c-5489-d367-1783-2673fde2edaf'},
        {className:'DbNavigator', component:'dbNavigator', guid:'38aec981-30ae-ec1d-8f8f-5004958b4cfa'},
        {className:'MatrixGrid', component:'matrixGrid', guid:'827a5cb3-e934-e28c-ec11-689be18dae97'},
        {className:'PropEditor', component:'propEditor', guid:'a0e02c45-1600-6258-b17a-30a56301d7f1'}
    ],
    controlsPath: __dirname+'/../ProtoOne/public/ProtoControls/',
    dataPath: __dirname+'/../ProtoOne/data/',
    uccelloPath: __dirname+'/../'+uccelloDir+'/'
};

// модуль настроек
var UccelloConfig = require('../'+uccelloDir+'/config/config');
UCCELLO_CONFIG = new UccelloConfig(config);
DEBUG = false;

// логирование
logger = require('../'+uccelloDir+'/system/winstonLogger');
//perfomance = {now:require("performance-now")};
// очищаем файл лога при старте
if (UCCELLO_CONFIG.logger.clearOnStart) {
    var fs = require('fs')
    fs.writeFileSync(UCCELLO_CONFIG.logger.file, '');
}

// модуль сервера
var UccelloServ = require('../'+uccelloDir+'/uccelloServ');
var CommunicationServer = require('../' + uccelloDir + '/connection/commServer');

var communicationServer = new CommunicationServer.Server(UCCELLO_CONFIG.webSocketServer);
var uccelloServ = new UccelloServ({ authenticate: fakeAuthenticate, commServer: communicationServer });

//logger.info("test;msg;1231");

// запускаем http сервер
http.createServer(app).listen(1325);
console.log('Сервер запущен на http://127.0.0.1:1325/');

communicationServer.start();
console.log("Communication Server started (port: " + UCCELLO_CONFIG.webSocketServer.port + ").");
