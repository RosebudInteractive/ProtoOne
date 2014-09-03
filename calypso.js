var http = require('http');
var express = require('express');
//var session = require('cookie-session');
var app = express();
var WebSocketServer = new require('ws');
var Session = new require('./public/session');
var Connect = new require('./public/connect');

// Подключение сессий
//app.use(session({keys: ['sid']}));

// обработчик файлов html будет шаблонизатор ejs
app.engine('html', require('ejs').renderFile);

// обработка главной, возвращает случайное число
app.get('/', function(req, res){
    res.render('calypso.html');
    //res.end(module1.getRandomInt(0, 1000).toString());
});

// статические данные и модули для подгрузки на клиент
app.use("/public", express.static(__dirname + '/public'));



// подключенные клиенты
var clients = {};
// сохраненные сессии
var sessions = {};

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

webSocketServer.on('connection', function(ws) {

    // id подключения
    var connId = Math.random();

    // получаем сессию
   /* var sessionID = null;
    parseCookie(ws.upgradeReq, null, function(err) {
        sessionID = ws.upgradeReq.cookies['sid'];
        store.get(sessionID, function(err, session) {
            // session
        });
    });*/

    ws.on('message', function(message) {
        var data = JSON.parse(message);
        switch (data.action) {
            case 'connect':

                // сессионный номер
                var sessionID = data.sid;
                if (!sessionID) {
                    console.log('не указан sid'); break;
                }

                // запоминаем клиента подключенного
                var conn = new Connect(connId, {ws:ws, time:Date.now(), agent:data.agent});
                if (!sessions[sessionID]) {
                    sessions[sessionID] = new Session(sessionID);
                }
                sessions[sessionID].addConnect(conn, ws);
                console.log("новое соединение: " + sessionID);
                console.log(sessions);
                break;
            case 'ping':
                var conn = findConnection(connId);
                if (conn)
                    conn.setLastPing();
                break;
            case 'sessions':
                var sesStr = [];
                for(var i in sessions)
                    sesStr.push(i);
                ws.send(JSON.stringify({error:null, action:'sessions', sessions:sesStr.join(',')}));
                break;
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
        console.log(sessions);
    });

});

// запускаем http сервер
http.createServer(app).listen(1325);
console.log('Сервер запущен на http://127.0.0.1:1325/');