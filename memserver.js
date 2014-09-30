
// создаем БД
var MemDBController = require('./public/memDBController');
var MDb = require('./public/memDataBase');
var MemMetaObj = require('./public/memMetaObj');
var MemMetaObjFields = require('./public/memMetaObjFields');
var MemMetaObjCols = require('./public/memMetaObjCols');
var MemObj = require('./public/memObj');

var dbc = new MemDBController();
var db = dbc.newDataBase({name:"PROTO", kind : "master"}); // new MDb(controller,{name:"PROTO", master : "1"});
//var myCol = myMemDb.newCol();
var myMetaControl = new MemMetaObj(db,{"typeName": "Control", "parentClass":null});
var myMetaButton = new MemMetaObj(db,{"typeName": "Button", "parentClass":myMetaControl});
var flds = myMetaControl.getCol("fields");
var cls = myMetaControl.getCol("cols");
new MemMetaObjFields({"obj": myMetaControl, "colName": "fields"}, {"fname":"Id","ftype":"int"});
new MemMetaObjFields({"obj": myMetaControl, "colName": "fields"}, {"fname":"Name","ftype":"string"});

new MemMetaObjFields({"obj": myMetaButton, "colName": "fields"}, {"fname":"Caption","ftype":"string"});

myMetaControl._bldElemTable(); // temp
myMetaButton._bldElemTable();

//var myRootButton = new MemObj(myMetaButton,{ "db": db, "mode":"RW" },{"Id":22,"Name":"MyFirstButton","Caption":"OK"});
myRootButton = db.newRootObj(myMetaButton,{"Id":22,"Name":"MyFirstButton","Caption":"OK"});
myRootButton.set("Caption","Cancel");

// myRootButton свойства Caption и Name
// клиент должен подписаться на этот объект, он его получает и должен у себя его создать
// сервере должен вернуть клиенту структуру объекта и на клиенте он должен его создать
// ты можешь менять на клиенте либо на сервере и он синхронизирует отправками дельт

// ----------------------------------------------------------------------------------------------------------------------

var http = require('http');
var express = require('express');
var app = express();
var WebSocketServer = new require('ws');
var Socket = require('./public/socket');

// обработчик файлов html будет шаблонизатор ejs
app.engine('html', require('ejs').renderFile);

// обработка /test
app.get('/test', function(req, res){
    res.render('test.html');
});

// статические данные и модули для подгрузки на клиент
app.use("/public", express.static(__dirname + '/public'));

// WebSocket-сервер на порту 8081
var connId = 0;
var wss = new WebSocketServer.Server({port: 8081});
wss.on('connection', function(ws) {
    // id подключения
    connId++;
    var socket = new Socket(ws, {
        side: 'server',
        router: function(data) {
            console.log('сообщение с клиента:', data);
            var result = {};
            switch (data.action) {
                case 'subscribe':
                    result = dbc.onSubscribe(ws, data.guid);
                    break;
                case 'subscribeRoot':
                    result = dbc.onSubscribeRoot(data.dbGuid, data.objGuid);
                    break;
            }
            return result;
        }
    });
});

// запускаем http сервер
http.createServer(app).listen(1325);
console.log('Сервер запущен на http://127.0.0.1:1325/');