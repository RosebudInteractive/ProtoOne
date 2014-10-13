
// создаем БД
var MemDBController = require('./public/memDBController');
var MDb = require('./public/memDataBase');
var MemMetaObj = require('./public/memMetaObj');
var MemMetaObjFields = require('./public/memMetaObjFields');
var MemMetaObjCols = require('./public/memMetaObjCols');
var MemObj = require('./public/memObj');

function createController(){
    var dbc = new MemDBController();
    return dbc;
}

function createDb(dbc, options){

    var db = dbc.newDataBase(options);

    var par = { obj: db.getMeta(), colName: "Children" };
//return;
    var myMetaControl = new MemMetaObj({ db: db }, {fields: {typeName: "Control", parentClass: null}});

    var myMetaButton = new MemMetaObj({ db: db }, {fields: {typeName: "Button", parentClass: myMetaControl.getGuid()}});
    var myMetaContainer = new MemMetaObj({ db: db }, {fields: {typeName: "Container", parentClass: myMetaControl.getGuid()}});
    var flds = myMetaControl.getCol("fields");
    var cls = myMetaControl.getCol("cols");
    new MemMetaObjFields({"obj": myMetaControl}, {fields: {"fname": "Id", "ftype": "int"}});
    new MemMetaObjFields({"obj": myMetaControl}, {fields: {"fname": "Name", "ftype": "string"}});
    new MemMetaObjFields({"obj": myMetaButton}, {fields: {"fname": "Caption", "ftype": "string"}});
    new MemMetaObjFields({"obj": myMetaButton}, {fields: {"fname": "Left", "ftype": "integer"}});
    new MemMetaObjFields({"obj": myMetaButton}, {fields: {"fname": "Top", "ftype": "integer"}});
    new MemMetaObjFields({"obj": myMetaButton}, {fields: {"fname": "HorCells", "ftype": "integer"}});
    new MemMetaObjFields({"obj": myMetaButton}, {fields: {"fname": "VerCells", "ftype": "integer"}});
    new MemMetaObjFields({"obj": myMetaContainer}, {fields: {"fname": "containerType", "ftype": "enum"}});
    new MemMetaObjCols({"obj": myMetaContainer}, {fields: {"cname": "Children", "ctype": "control"}});
    myMetaControl._bldElemTable(); // temp
    myMetaButton._bldElemTable();
    myMetaContainer._bldElemTable();

    var myRootButton = new MemObj(myMetaButton, { "db": db, "mode": "RW" }, {"Id": 22, "Name": "MyFirstButton", "Caption": "OK", "Left":"30", "Top":"50"});
    var myRootCont = db.newRootObj(myMetaContainer, {fields: {"Id": 11, "Name": "MainContainer"}});
    var myButton = new MemObj(myMetaButton, { obj: myRootCont, colName: "Children"}, {fields: {"Id": 22, "Name": "MyFirstButton1", "Caption": "OK", "Left":"30", "Top":"50"}});
    var myButton2 = new MemObj(myMetaButton, { obj: myRootCont, colName: "Children"}, {fields: {"Id": 23, "Name": "MySecondButton", "Caption": "Cancel", "Left":30, "Top":"70"}});
    return {dbc:dbc, db: db, myRootCont:myRootCont, myButton:myButton};
}

// ----------------------------------------------------------------------------------------------------------------------

var http = require('http');
var express = require('express');
var app = express();
var WebSocketServer = new require('ws');
var Socket = require('./public/socket');
var Session = require('./public/session');
var Connect = require('./public/connect');

// обработчик файлов html будет шаблонизатор ejs
app.engine('html', require('ejs').renderFile);

// обработка /test
app.get('/test', function(req, res){
    res.render('test.html');
});

// статические данные и модули для подгрузки на клиент
app.use("/public", express.static(__dirname + '/public'));


// хранилище коннектов и сессий
var SessionController = require('./public/sessionController.js');
var sessionController = new SessionController();

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
            var connect = sessionController.getConnect(connectId);
            if (connect)
                connect.closeConnect();
            console.log("отключился клиент: " + connectId);
        },
        router: function(data, connectId, socket) {
            console.log('сообщение с клиента '+connectId+':', data);
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
                    var connect = new Connect(connectId, socket,  {sessionID:sessionID, userAgent:data.agent, stateReady:1});
                    sessionController.addConnect(connect);
                    var session = sessionController.getSession(sessionID);
                    if (!session) {
                        var dbc = createController();
                        session = new Session(sessionID, createDb(dbc, {name: "Master", kind: "master"}));
                        sessionController.addSession(session);
                    }
                    session.addConnect(connect);

                    console.log(sessionController);

                    // обработка события закрытия коннекта
                    connect.event.on({
                        type: 'socket.close',
                        subscriber: this,
                        callback: function(args){
                            session.getData().dbc.onDisconnect(args.connId);
                            sessionController.removeConnect(args.connId);
                        }
                    });

                    result =  {connectId:connectId};
                    break;

                case 'subscribe':
                    var connect = sessionController.getConnect(connectId);
                    var session = connect.getSession();
                    var dbc = session.getData().dbc;

                    result = {data:dbc.onSubscribe({connect:connect, guid:data.slaveGuid}, data.masterGuid)};
                    break;

                case 'subscribeRoot':
                    var connect = sessionController.getConnect(connectId);
                    var session = connect.getSession();
                    var dbc = session.getData().dbc;

					var masterdb=dbc.getDB(data.masterGuid);
                    if (!masterdb.isSubscribed(data.slaveGuid)) // если клиентская база еще не подписчик
                        dbc.onSubscribe({connect:connectId, guid:data.slaveGuid}, data.masterGuid );
                    result = {data:masterdb.onSubscribeRoot(data.slaveGuid, data.objGuid)};
                    break;

                case 'getGuids':
                    var sessionData = sessionController.getConnect(connectId).getSession().getData();
                    var db = sessionData.db;
                    var myRootCont = sessionData.myRootCont;
                    var myButton = sessionData.myButton;
                    result = {masterGuid:db.getGuid(), myRootContGuid:myRootCont.getGuid(), myButtonGuid:myButton.getGuid()};
                    break;

                case 'changeObj':
                    var sessionData = sessionController.getConnect(connectId).getSession().getData();
                    var myRootCont = sessionData.myRootCont;
                    myRootCont.getLog().applyDelta(data.delta);
                    break;

                case 'sendDelta':
                    var dbc = sessionController.getConnect(connectId).getSession().getData().dbc;
                    dbc.applyDeltas(data.dbGuid, data.srcDbGuid, data.delta);
                    break;

                case 'getSessions':
                    var sessions = sessionController.getSessions();
                    result = {sessions:[]};
                    for(var i in sessions) {
                        var session = {id:i, date:sessions[i].date, connects:[]};
                        var connects = sessions[i].item.getConnects();
                        for(var j in connects) {
                            var connect = {id:j, date:sessionController.getConnectDate(j)};
                            session.connects.push(connect);
                        }
                        result.sessions.push(session);
                    }
                    break;

                case 'changeCaption':
                    var sessionData = sessionController.getConnect(connectId).getSession().getData();
                    var dbc = sessionData.dbc;
                    var db = sessionData.db;
                    var myButton = sessionData.myButton;
                    var myRootCont = sessionData.myRootCont;

                    myButton.set('Caption', data.caption);
                    var delta = myRootCont.getLog().genDelta();
                    console.log('delta:', delta);

                    dbc.applyDelta(db.getGuid(), db.getGuid(), myRootCont.getGuid(), delta);
                    break;

                case 'isLogged':
                    var session = sessionController.getConnect(connectId).getSession();
                    var sessionData = session.getData();
                    if (sessionData.user)
                        result = {user:sessionData.user};
                    break;

                case 'login':
                    var session = sessionController.getConnect(connectId).getSession();
                    var sessionData = session.getData();
                    if (data.name == 'user' && data.pass == '123') {
                        var user = {user:data.name};
                        sessionData.user = user;
                        session.setData(sessionData);
                        result = {user:user};
                    }
                    break;

                case 'logout':
                    var session = sessionController.getConnect(connectId).getSession();
                    var sessionData = session.getData();
                    if (sessionData.user) {
                        delete sessionData.user;
                        session.setData(sessionData);
                    }
                    break;

            }
            return result;
        }
    });
});

// запускаем http сервер
http.createServer(app).listen(1325);
console.log('Сервер запущен на http://127.0.0.1:1325/');