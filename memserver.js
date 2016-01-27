// дирректория где лежит Uccello
var uccelloDir = process.argv[2]&&process.argv[2][0]!='-'?process.argv[2]:'Uccello';
console.log('Using folder: '+uccelloDir);
// порт web
var uccelloPortWeb = process.argv[3] && process.argv[3][0] != '-' ? process.argv[3] : null;
// порт websocket
var uccelloPortWs = process.argv[4] && process.argv[4][0] != '-' ? process.argv[4] : null;

var chTraceFlag = false;
for (var _cnt = 0; _cnt < process.argv.length; _cnt++) {
    var _arg = process.argv[_cnt];
    if (_arg==="-chTrace") {
        chTraceFlag = true;
        console.log("Low-level channel tracing is enabled.");
        break;
    };
};

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
        { className: 'DbNavigator', component: 'dbNavigator', guid: '38aec981-30ae-ec1d-8f8f-5004958b4cfa' },
        { className: 'MatrixGrid', component: 'matrixGrid', guid: '827a5cb3-e934-e28c-ec11-689be18dae97' },
        { className: 'PropEditor', component: 'propEditor', guid: 'a0e02c45-1600-6258-b17a-30a56301d7f1' },
        { className: 'GenVContainer', component:'genVContainer', viewset:true, guid:'b75474ef-26d0-4298-9dad-4133edaa8a9c'},
        { className: 'GenForm', component:'genForm', viewset:true, guid:'29bc7a01-2065-4664-b1ad-7cc86f92c177'},
        {className:'GenLabel', component:'genLabel', viewset:true, guid:'151c0d05-4236-4732-b0bd-ddcf69a35e25'},
        {className:'GenDataGrid', component:'genDataGrid', viewset:true, guid:'55d59ec4-77ac-4296-85e1-def78aa93d55'},
        {className:'GenButton', component:'genButton', viewset:true, guid:'bf0b0b35-4025-48ff-962a-1761aa7b3a7b'},
        {className:'GenDataEdit', component:'genDataEdit', viewset:true, guid:'567cadd5-7f9d-4cd8-a24d-7993f065f5f9'}
    ],
    
    classGuids: {
        "RootTstCompany": "c4d626bf-1639-2d27-16df-da3ec0ee364e",
        "DataTstCompany": "34c6f03d-f6ba-2203-b32b-c7d54cd0185a",
        "RootTstContact": "de984440-10bd-f1fd-2d50-9af312e1cd4f",
        "DataTstContact": "27ce7537-7295-1a45-472c-a422e63035c7",
        "RootContract": "4f7d9441-8fcc-ba71-2a1d-39c1a284fc9b",
        "DataContract": "08a0fad1-d788-3604-9a16-3544a6f97721",
        "RootAddress": "07e64ce0-4a6c-978e-077d-8f6810bf9386",
        "DataAddress": "16ec0891-1144-4577-f437-f98699464948",
        "RootLeadLog": "bedf1851-cd51-657e-48a0-10ac45e31e20",
        "DataLeadLog": "c4fa07b5-03f7-4041-6305-fbd301e7408a",
        "RootIncomeplan": "194fbf71-2f84-b763-eb9c-177bf9ac565d",
        "DataIncomeplan": "56cc264c-5489-d367-1783-2673fde2edaf",
        "RootOpportunity": "3fe7cd6f-b146-8898-7215-e89a2d8ea702",
        "DataOpportunity": "5b64caea-45b0-4973-1496-f0a9a44742b7",
        "RootCompany": "0c2f3ec8-ad4a-c311-a6fa-511609647747",
        "DataCompany": "59583572-20fa-1f58-8d3f-5114af0f2c51",
        "RootContact": "ad17cab2-f41a-36ef-37da-aac967bbe356",
        "DataContact": "73596fd8-6901-2f90-12d7-d1ba12bae8f4",
        "DataLead": "86c611ee-ed58-10be-66f0-dfbb60ab8907",
        "RootLead": "31c99003-c0fc-fbe6-55eb-72479c255556"
    },
    
    controlsPath: __dirname + '/../ProtoOne/public/ProtoControls/',
    dataPath: __dirname + '/../ProtoOne/data/',
    uccelloPath: __dirname + '/../' + uccelloDir + '/',
    masaccioPath: __dirname + '/../Masaccio/wfe/',
    
    wfe : {
        processStorage  : __dirname + '/../ProtoOne/data/wfeData/',
        scriptsPath     : __dirname + '/../ProtoOne/data/wfeUserScripts/',
        idleTimeout     : 10000
    },

    dataman: {
        connection: { //MSSQL
            host: "GALLO", // "SQL-SERVER"
            //port: 1435, //instanceName: "SQL2008R2"
            username: "sa",
            password: "",
            //database: "genetix_test",
            database: 'resmanager_test',
            provider: "mssql",
            connection_options: { instanceName: "SQLEXPRESS" },
            provider_options: {},
            pool: {
                max: 5,
                min: 0,
                idle: 10000
            }
        },
        //connection: { //MySql
        //    host: "localhost",
        //    username: "sa",
        //    password: "system",
        //    database: "genetix_test",
        //    provider: "mysql",
        //    connection_options: {},
        //    provider_options: {},
        //    pool: {
        //        max: 5,
        //        min: 0,
        //        idle: 10000
        //    },
        //},
        importData: {
            autoimport: true,
            //dir: "../ProtoOne/data/tables"
            dir: "./data/tables"
        },
        trace: {
            sqlCommands: true,
            importDir: true
        }
    },
    resman : {
        useDb : true
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
UCCELLO_CONFIG.webSocketServer = UCCELLO_CONFIG.webSocketServer ? UCCELLO_CONFIG.webSocketServer : {};
UCCELLO_CONFIG.webSocketServer.io_log_flag = chTraceFlag;

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