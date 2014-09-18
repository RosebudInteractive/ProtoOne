var http = require('http');
var express = require('express');
//var session = require('cookie-session');
var app = express();
var WebSocketServer = new require('ws');
var Session = require('./public/session');
var Connect = require('./public/connect');
var Socket = require('./public/socket');

// winston for logging
var winston = require('winston');
var logger = new (winston.Logger)({
    transports: [
        new winston.transports.File({ filename: __dirname + '/logs/protoone.log' })
    ]
});

// обработчик файлов html будет шаблонизатор ejs
app.engine('html', require('ejs').renderFile);

// обработка главной
app.get('/', function(req, res){
    res.render('calypso.html');
});

// обработка inputs
app.get('/inputs', function(req, res){
    res.render('inputs.html');
});

// апдейт
app.get("/update", function(req, res){
    var shell = require('shelljs');
    res.writeHead(200,{"Content-Type" : "text/html"});
    res.write('$ cd /var/www/sites/node/ProtoOne/<br>');
    res.write(shell.exec('cd /var/www/sites/node/ProtoOne/').output+'<br>');
    res.write('$ forever stop calypso.js<br>');
    res.write(shell.exec('forever stop calypso.js').output+'<br>');
    res.write('$ git pull<br>');
    res.write(shell.exec('git pull').output+'<br>');
    res.write('$ forever start calypso.js<br>');
    res.write(shell.exec('forever start calypso.js').output+'<br>');
    res.end();
});

// статические данные и модули для подгрузки на клиент
app.use("/public", express.static(__dirname + '/public'));
app.use("/docs", express.static(__dirname + '/docs'));
app.use("/logs", express.static(__dirname + '/logs'));



// сохраненные сессии
var sessions = {};

// сохраненные данные полей
var inputValues = {
    'i1':'1',
    'i2':'2',
    'i3':'3',
    'i4':'4',
    'i5':'5',
    'i6':'6',
    'i7':'7',
    'i8':'8',
    'i9':'9',
    'i10':'10',
    'i1i2':'12' // вычисляемое на клиенте
};

// id подключения
var connId = 0;



function findConnection(id){
    for(var i in sessions) {
        var connects = sessions[i].getConnects();
        for(var j in connects) {
            if (id == connects[j].getId())
                return connects[j];
        }
    }
    return null;
}

function findSession(id){
    for(var i in sessions) {
        if (sessions[i].getId() == id) {
            return sessions[i];
        }
    }
    return null;
}

// WebSocket-сервер на порту 8081
var wss = new WebSocketServer.Server({port: 8081});
wss.on('connection', function(ws) {
    // id подключения
    connId++;
    var socket = new Socket(ws, {
        side: 'server',
        router: function(data) {

            // результат обработки возвратится клиенту
            var result = {};

            switch (data.action) {
                case 'connect':
                    // сессионный номер
                    var sessionID = data.sid;
                    if (!sessionID) {
                        console.log('не указан sid');
                        break;
                    }
                    // запоминаем клиента подключенного
                    var conn = new Connect(connId, ws,  {userAgent: data.agent, stateReady:1});
                    if (!sessions[sessionID])
                        sessions[sessionID] = new Session(sessionID);
                    sessions[sessionID].addConnect(conn);
                    console.log("новое соединение: " + sessionID);
                    result =  {connId:connId};
                    break;

                case 'init': // инициализационные данные
                    result = {values:inputValues, connId:connId};
                    break;

                case 'changed':
                    // Если oldValue ХОТЯ БЫ
                    // одного из полей не равно значениям тех полей что заполнены сервером,
                    // он не применяет это и не рассылает, а отвечает клиенту ошибкой
                    for(var i in data.values) {
                        if (data.values[i].oldValue != inputValues[i]){
                            result = {error:'Ошибка в поле '+i, action:'error'};
                            return;
                        }
                    }

                    // сохраняем изменения на сервере
                    var values = {};
                    for(var i in data.values) {
                        if (data.values[i].newValue != inputValues[i]) {
                            inputValues[i] = data.values[i].newValue;
                            values[i] = data.values[i].newValue;
                        }
                    }

                    // отправляем изменения клиентам текущей сессии
                    var session = findSession(data.sid);
                    if (session){
                        var connects = session.getConnects();
                        for(var j in connects)
                            connects[j].getConnection().send(JSON.stringify({action:'changed', values:values, time:Date.now(), timedelta:Date.now()-data.time, connId:connId}));
                    }
                    break;

               /* default: // выполнение серверного метода socket.send({action: 'loadTable', 'params':['tableName']}, callback);
                    var evalResult = eval("("+data.action+"('"+data.params.join('\',\'')+"'))");
                    result = {result:evalResult};
                    break;*/
            }

            return result;
        },
        close: function() {
            for(var i in sessions) {
                if (sessions[i].removeConn(connId)) {
                    if (sessions[i].getConnects().length == 0)
                        delete sessions[i];
                    break;
                }
            }
            console.log("отключился клиент: " + connId);
        }
    });

    // test server side
    /*setTimeout(function(){
        socket.send({action:'test', type:'method', value:10}, function(ddd){console.log(ddd)});
    }, 5000);*/

});

// запускаем http сервер
http.createServer(app).listen(1325);
console.log('Сервер запущен на http://127.0.0.1:1325/');