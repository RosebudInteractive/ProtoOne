// Модули MEM
var MemDBController = require('./public/uccello/memDB/memDBController');
var MemObj = require('./public/uccello/memDB/memObj');

// Модули компонентов
var AComponent = require('./public/uccello/baseControls/aComponent');
var ControlMgr = require('./public/uccello/baseControls/controlMgr');
var AControl = require('./public/uccello/baseControls/aControl');
var AContainer = require('./public/ProtoControls/container');
var AButton = require('./public/ProtoControls/button');
var AMatrixGrid = require('./public/ProtoControls/matrixGrid');

// Коммуникационные модули
var Socket = require('./public/uccello/connection/socket');
var Router = require('./public/uccello/connection/router');
var UserSessionMgr = require('./public/uccello/connection/userSessionMgr.js');

// Модули nodejs
var http = require('http');
var express = require('express');
var app = express();
var WebSocketServer = new require('ws');

// ----------------------------------------------------------------------------------------------------------------------

// обработчик файлов html будет шаблонизатор ejs
app.engine('html', require('ejs').renderFile);

// обработка /test
app.get('/test', function(req, res){
    res.render('test.html');
});

// апдейт
app.get("/update", function(req, res){
    var shell = require('shelljs');
    res.writeHead(200,{"Content-Type" : "text/html"});
    res.write('$ cd /var/www/sites/node/ProtoOne/<br>');
    res.write(shell.exec('cd /var/www/sites/node/ProtoOne/').output+'<br><br>');
    res.write('$ git pull<br>');
    res.write(shell.exec('git pull').output+'<br><br>');
    res.write('$ jsdoc public -r -d public/docs<br>');
    res.write(shell.exec('jsdoc public -r -d public/docs').output+'<br><br>');
    res.write('$ forever restart calypso.js<br>');
    res.write(shell.exec('forever restart memserver.js').output+'<br><br>');
    res.end();
});

// статические данные и модули для подгрузки на клиент
app.use("/public", express.static(__dirname + '/public'));

// хранилище коннектов и сессий
var router = new Router();
var userSessionMgr = new UserSessionMgr(router);

// прикладные методы
router.add('getGuids', function(data) {
    var userData = userSessionMgr.getConnect(data.connectId).getSession().getUser().getData();
    var db = userData.db;
    return {masterGuid:db.getGuid(), myRootContGuid:userData.myRootCont.getGuid()};
});
router.add('getSessions', function(data) {
    var sessions = userSessionMgr.getSessions();
    result = {sessions:[]};
    for(var i in sessions) {
        var session = {id:i, date:sessions[i].date, connects:[]};
        var connects = sessions[i].item.getConnects();
        for(var j in connects) {
            var connect = {id:j, date:userSessionMgr.getConnectDate(j)};
            session.connects.push(connect);
        }
        result.sessions.push(session);
    }
    return result;
});


/**
 * Создать базу данных
 * @param dbc
 * @param options
 * @returns {object}
 */
function createDb(dbc, options){
    var db = dbc.newDataBase(options);
	var cm = new ControlMgr(db);

    var component = new AComponent(cm);
    var control = new AControl(cm);
    var rootCont = new AContainer(cm);
    var button = new AButton(cm);
    var matrixGrid = new AMatrixGrid(cm);

    var myRootCont = db.newRootObj(db.getObj(rootCont.classGuid), {fields: {"Id": 11, "Name": "MainContainer"}});
    var myButton = new MemObj(db.getObj(button.classGuid), { obj: myRootCont, colName: "Children"}, {fields: {"Id": 22, "Name": "MyFirstButton1", "Caption": "OK", "Left":"30", "Top":"50"}});
    var myMatrixGrid = new MemObj(db.getObj(matrixGrid.classGuid), { obj: myRootCont, colName: "Children"}, {fields: {Id:33, HorCells:3, VerCells:4, Name:"Grid", "Left":"50", "Top":"60"}});

    return {cm:cm, db:db, myRootCont:myRootCont, myButton:myButton, myMatrixGrid:myMatrixGrid};
}

// вызывается по событию при создании нового пользователя
function createUserContext(args) {
	var userData = args.target.getData();
	userData.controller = new MemDBController();
	var r = createDb(userData.controller,{name: "Master", kind: "master"});
	userData.db = r.db;
	userData.cm = r.cm;	
	userData.myRootCont = r.myRootCont;
};
userSessionMgr.event.on({
	type: 'newUser',
	subscriber: this,
	callback: createUserContext
});


// WebSocket-сервер на порту 8081
var _connectId = 0;
var wss = new WebSocketServer.Server({port: 8081});
wss.on('connection', function(ws) {
    // id подключения
    _connectId++;
    new Socket(ws, {
        side: 'server',
        connectId: _connectId,
        close: function(event, connectId) { // при закрытии коннекта
            var connect = userSessionMgr.getConnect(connectId);
            if (connect)
                connect.closeConnect();
            console.log("отключился клиент: " + connectId);
        },
        router: function(data, connectId, socket) {
            console.log('сообщение с клиента '+connectId+':', data);

            // обработик методов connect authenticate deauthenticate getGuids getSessions
            if (data.action=='connect' || data.action=='authenticate' || data.action=='deauthenticate' || data.action=='getGuids' || data.action=='getSessions') {
                data.connectId = connectId;
                data.socket = socket;
                var result = router.exec(data);
                return result? result: {};
            }

            var result = {};
            switch (data.action) {

                case 'subscribe':
                    var connect = userSessionMgr.getConnect(connectId);
                    var u = connect.getSession().getUser();
                    var dbc = u.getData().controller;

                    result = {data:dbc.onSubscribe({connect:connect, guid:data.slaveGuid}, data.masterGuid)};
                    break;

                case 'subscribeRoot':
                    var connect = userSessionMgr.getConnect(connectId);
                    var u = connect.getSession().getUser();
                    var dbc = u.getData().controller;

					var masterdb = dbc.getDB(data.masterGuid);
                    if (!masterdb.isSubscribed(data.slaveGuid)) // если клиентская база еще не подписчик
                        dbc.onSubscribe({connect:connectId, guid:data.slaveGuid}, data.masterGuid );
                    result = {data:masterdb.onSubscribeRoot(data.slaveGuid, data.objGuid)};
                    break;

                case 'sendDelta':
                    var dbc = userSessionMgr.getConnect(connectId).getSession().getUser().getData().controller;
                    dbc.applyDeltas(data.dbGuid, data.srcDbGuid, data.delta);
                    break;


            }
            return result;
        }
    });
});

// запускаем http сервер
http.createServer(app).listen(1325);
console.log('Сервер запущен на http://127.0.0.1:1325/');