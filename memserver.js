// дирректория где лежит Uccello
var uccelloDir = process.argv[2]&&process.argv[2]!='-'?process.argv[2]:'Uccello';
console.log('Using folder: '+uccelloDir);
// порт web
var uccelloPortWeb = process.argv[3]&&process.argv[3]!='-'?process.argv[3]:null;
// порт websocket
var uccelloPortWs = process.argv[4]&&process.argv[4]!='-'?process.argv[4]:null;

// Модули nodejs
var http = require('http');
var express = require('express');
var app = express();

// Обработчики express
// ----------------------------------------------------------------------------------------------------------------------

// обработчик файлов html будет шаблонизатор ejs
app.engine('html', require('ejs').renderFile);

// обработка /tests
app.get('/', function(req, res){
    res.render('proto1.html', { webSocketServerPort: UCCELLO_CONFIG.webSocketServer.port});
});
app.get('/test', function(req, res){
    res.render('proto1.html', { webSocketServerPort: UCCELLO_CONFIG.webSocketServer.port});
});
app.get('/build', function(req, res){
    res.render('proto1build.html');
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
    controls: [
        { className: 'DataContact', component: '../DataControls/dataContact', guid: '73596fd8-6901-2f90-12d7-d1ba12bae8f4' },
        { className: 'DataTstContact', component:'../DataControls/dataTstContact', guid:'27ce7537-7295-1a45-472c-a422e63035c7'},
        { className: 'DataContract', component: '../DataControls/dataContract', guid: '08a0fad1-d788-3604-9a16-3544a6f97721' },
        { className: 'DataCompany', component: '../DataControls/dataCompany', guid: '59583572-20fa-1f58-8d3f-5114af0f2c51' },
        { className: 'DataTstCompany', component:'../DataControls/dataTstCompany', guid:'34c6f03d-f6ba-2203-b32b-c7d54cd0185a'},
        { className: 'DataAddress', component: '../DataControls/dataAddress', guid: '16ec0891-1144-4577-f437-f98699464948' },
        //{ className: 'DataLead', component: '../DataControls/dataLead', guid: '86c611ee-ed58-10be-66f0-dfbb60ab8907' },
        { className: 'DataLeadLog', component:'../DataControls/dataLeadLog', guid:'c4fa07b5-03f7-4041-6305-fbd301e7408a'},
        { className: 'DataOpportunity', component: '../DataControls/dataOpportunity', guid: '5b64caea-45b0-4973-1496-f0a9a44742b7' },
        { className: 'DataIncomeplan', component: '../DataControls/dataIncomeplan', guid: '56cc264c-5489-d367-1783-2673fde2edaf' },
        { className: 'RootAddress', component: '../DataControls/rootAddress', guid: '07e64ce0-4a6c-978e-077d-8f6810bf9386' },
        { className: 'RootCompany', component: '../DataControls/rootCompany', guid: '0c2f3ec8-ad4a-c311-a6fa-511609647747' },
        { className: 'RootTstCompany', component:'../DataControls/rootTstCompany', guid:'c4d626bf-1639-2d27-16df-da3ec0ee364e'},
        { className: 'RootContact', component: '../DataControls/rootContact', guid: 'ad17cab2-f41a-36ef-37da-aac967bbe356' },
        { className: 'RootTstContact', component:'../DataControls/rootTstContact', guid:'de984440-10bd-f1fd-2d50-9af312e1cd4f'},
        { className: 'RootContract', component: '../DataControls/rootContract', guid: '4f7d9441-8fcc-ba71-2a1d-39c1a284fc9b' },
        { className: 'RootIncomeplan', component: '../DataControls/rootIncomeplan', guid: '194fbf71-2f84-b763-eb9c-177bf9ac565d' },
        { className: 'RootLead', component: '../DataControls/rootLead', guid: '31c99003-c0fc-fbe6-55eb-72479c255556' },
        { className: 'RootLeadLog', component:'../DataControls/rootLeadLog', guid:'bedf1851-cd51-657e-48a0-10ac45e31e20'},
        { className: 'DbNavigator', component: 'dbNavigator', guid: '38aec981-30ae-ec1d-8f8f-5004958b4cfa' },
        { className: 'MatrixGrid', component: 'matrixGrid', guid: '827a5cb3-e934-e28c-ec11-689be18dae97' },
        { className: 'PropEditor', component: 'propEditor', guid: 'a0e02c45-1600-6258-b17a-30a56301d7f1' }
    ],
    
    controlsPath: __dirname + '/../ProtoOne/public/ProtoControls/',
    dataPath: __dirname + '/../ProtoOne/data/',
    uccelloPath: __dirname + '/../' + uccelloDir + '/',
    masaccioPath: __dirname + '/../Masaccio/wfe/',
    
    wfe : {
        processStorage  : __dirname + '/../ProtoOne/data/wfeData/',
        scriptsPath     : __dirname + '/../ProtoOne/data/wfeUserScripts/',
        idleTimeout     : 10000
    }
};

// модуль настроек
var UccelloConfig = require('../'+uccelloDir+'/config/config');
UCCELLO_CONFIG = new UccelloConfig(config);
if (uccelloPortWeb) UCCELLO_CONFIG.webServer.port = uccelloPortWeb;
if (uccelloPortWs) UCCELLO_CONFIG.webSocketServer.port = uccelloPortWs;
DEBUG = false;

// логирование
logger = require('../'+uccelloDir+'/system/winstonLogger');

// очищаем файл лога при старте
if (UCCELLO_CONFIG.logger.clearOnStart) {
    var fs = require('fs');
    fs.writeFileSync(UCCELLO_CONFIG.logger.file, '');
}

// модуль сервера
var UccelloServ = require('../'+uccelloDir+'/uccelloServ');
var CommunicationServer = require('../' + uccelloDir + '/connection/commServer');
var EngineSingleton;

if (fs.existsSync(UCCELLO_CONFIG.masaccioPath + 'engineSingleton.js'))
    EngineSingleton = require(UCCELLO_CONFIG.masaccioPath + 'engineSingleton');

// комуникационный модуль
var communicationServer = new CommunicationServer.Server(UCCELLO_CONFIG.webSocketServer);
var uccelloServ = new UccelloServ({
    authenticate: fakeAuthenticate,
    commServer: communicationServer,
    engineSingleton: EngineSingleton
});

// запускаем http сервер
http.createServer(app).listen(UCCELLO_CONFIG.webServer.port, '0.0.0.0');
console.log('Web server started http://127.0.0.1:'+UCCELLO_CONFIG.webServer.port+'/');

// зщапускаем коммуникационный сервер
communicationServer.start();
console.log("Communication Server started (port: " + UCCELLO_CONFIG.webSocketServer.port + ").");