
// создаем БД
var MemDBController = require('./public/memDBController');
var MDb = require('./public/memDataBase');
var MemMetaObj = require('./public/memMetaObj');
var MemMetaObjFields = require('./public/memMetaObjFields');
var MemMetaObjCols = require('./public/memMetaObjCols');
var MemObj = require('./public/memObj');

var dbc = new MemDBController();

console.log(dbc.guid());
console.log(dbc.guid());
console.log(dbc.guid());
console.log(dbc.guid());

var db = dbc.newDataBase({name:"Master", kind : "master"});


//var myMetaField = new MemMetaField(db);
//var myMetaXObj = new MemMetaXObj(db); // должен создаваться автоматом при инициализации базы

var par = { obj: db.getMeta(), colName: "Children" };
//return;
var myMetaControl = new MemMetaObj( { db: db },{fields: {typeName: "Control", parentClass:null}});

var myMetaButton = new MemMetaObj({ db: db },{fields: {typeName: "Button", parentClass:myMetaControl.getGuid()}});
var myMetaContainer = new MemMetaObj({ db: db },{fields: {typeName: "Container", parentClass:myMetaControl.getGuid()}});
var flds = myMetaControl.getCol("fields");
var cls = myMetaControl.getCol("cols");
new MemMetaObjFields({"obj": myMetaControl}, {fields: {"fname":"Id","ftype":"int"}});
new MemMetaObjFields({"obj": myMetaControl}, {fields: {"fname":"Name","ftype":"string"}});
new MemMetaObjFields({"obj": myMetaButton}, {fields: {"fname":"Caption","ftype":"string"}});
new MemMetaObjFields({"obj": myMetaContainer}, {fields: {"fname":"containerType","ftype":"enum"}});
new MemMetaObjCols({"obj": myMetaContainer}, {fields: {"cname":"Children","ctype":"control"}});
myMetaControl._bldElemTable(); // temp
myMetaButton._bldElemTable();
myMetaContainer._bldElemTable();

var myRootButton = new MemObj(myMetaButton,{ "db": db, "mode":"RW" },{"Id":22,"Name":"MyFirstButton","Caption":"OK"});
var myRootCont = db.newRootObj(myMetaContainer, {fields: {"Id":11,"Name":"MainContainer"}});
var myButton = new MemObj(myMetaButton,{ obj: myRootCont, colName: "Children"},{fields: {"Id":22,"Name":"MyFirstButton","Caption":"OK"}});
var myButton2 = new MemObj(myMetaButton,{ obj: myRootCont, colName: "Children"},{fields: {"Id":23,"Name":"MySecondButton","Caption":"Cancel"}});


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

// сохраненные сессии
var sessions = {};

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
var connId = 0;
var wss = new WebSocketServer.Server({port: 8081});
wss.on('connection', function(ws) {
    // id подключения
    connId++;
    var socket = new Socket(ws, {
        side: 'server',
        close: function() { // при закрытии коннекта
            var connect = findConnection(connId);
            if (connect)
                connect.closeConnect();
            console.log("отключился клиент: " + connId);
        },
        router: function(data) {
            console.log('сообщение с клиента:', data);
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
                case 'subscribe':
                    result = {data:dbc.onSubscribe(ws, data.guid)};
                    break;
                case 'subscribeRoot':
                    if (!db.isSubscribed(data.dbGuid)) // если клиентская база еще не подписчик
                        db.onSubscribe(ws);
                    result = {data:db.onSubscribeRoot(data.dbGuid, data.objGuid)};
                    break;
                case 'getGuids':
                    result = {masterGuid:db.getGuid(), myRootContGuid:myRootCont.getGuid(), myButtonGuid:myButton.getGuid()};
                    break;
                case 'changeObj':
                    myRootCont.getLog().applyDelta(data.delta);
                    break;
            }
            return result;
        }
    });
});

// запускаем http сервер
http.createServer(app).listen(1325);
console.log('Сервер запущен на http://127.0.0.1:1325/');