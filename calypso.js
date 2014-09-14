var http = require('http');
var express = require('express');
//var session = require('cookie-session');
var app = express();
var WebSocketServer = new require('ws');
var Session = require('./public/session');
var Connect = require('./public/connect');

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
    'i1i2':'' // вычисляемое на клиенте
};

// WebSocket-сервер на порту 8081
var webSocketServer = new WebSocketServer.Server({port: 8081});

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

webSocketServer.on('connection', function(ws) {

    // id подключения
    var connId = Math.random();

    ws.on('message', function(message) {
        var data = JSON.parse(message);
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
                if (!sessions[sessionID]) {
                    sessions[sessionID] = new Session(sessionID);
                }
                sessions[sessionID].addConnect(conn);

                // отправляем клиенту номер коннекта
                ws.send(JSON.stringify({error:null, action:'connect', connId:connId}));

                console.log("новое соединение: " + sessionID);
                break;
            case 'ping':
                var conn = findConnection(connId);
                if (conn)
                    conn.setLastPing();
                break;
            case 'sessions':
                ws.send(JSON.stringify({error:null, action:'sessions', sessions:sessObj}));
                break;
            case 'send':
                var session = findSession(data.sid);
                if (session){
                    var connects = session.getConnects();
                    for(var j in connects)
                        if (connects[j].getId() != connId) // отправляем остальным клиентам текущей сессии
                            connects[j].getConnection().send(JSON.stringify({error:null, action:'send', str:data.str, time:Date.now(), timedelta:Date.now()-data.time}));
                }
                break;


           case 'init':
                ws.send(JSON.stringify({error:null, action:'init', values:inputValues}));
                break;
            case 'changed':
                // Если oldValue ХОТЯ БЫ
                // одного из полей не равно значениям тех полей что заполнены сервером,
                // он не применяет это и не рассылает, а отвечает клиенту ошибкой
                console.log(data.values, inputValues);
                for(var i in data.values) {
                    if (data.values[i].oldValue != inputValues[i]){
                        ws.send(JSON.stringify({error:'Ошибка в поле '+i, action:'error'}));
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
                        connects[j].getConnection().send(JSON.stringify({error:null, action:'changed', values:values, time:Date.now(), timedelta:Date.now()-data.time}));
                }
                break;
        }

        // сохраняем все команды кроме пинга и сохранения лога
        if (data.action != 'ping' && data.action != 'savelog') {
            logger.info(JSON.stringify({session:data.sid, connect:connId, command:data.action, params:data.str?data.str:''}));
        }

    });

    ws.on('close', function() {
        for(var i in sessions) {
            if (sessions[i].removeConn(connId)) {
                if (sessions[i].getConnects().length == 0)
                    delete sessions[i];
                break;
            }
        }
        console.log("отключился клиент: " + connId);
    });
});

// проверка коннектов на пинг
setInterval(function(){
    var now = Date.now()/1000;
    for(var i in sessions) {
        var connects = sessions[i].getConnects();
        for(var j in connects) {
            //  не пинговались дольше 5 секунд
            if (connects[j].params.stateReady == 1 && now - connects[j].params.lastPingTime/1000 > 5)
                connects[j].setStateReady(0);
        }
    }
}, 5000);

// запускаем http сервер
http.createServer(app).listen(1325);
console.log('Сервер запущен на http://127.0.0.1:1325/');