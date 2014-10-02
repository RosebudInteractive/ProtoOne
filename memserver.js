
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
                    result = {data:dbc.onSubscribe(ws, data.guid)};
                    break;
                case 'subscribeRoot':
                    result = {data:db.onSubscribeRoot(ws, data.objGuid)};
                    break;
                case 'getGuids':
                    result = {masterGuid:db.getGuid(), myRootContGuid:myRootCont.getGuid(), myButtonGuid:myButton.getGuid()};
                    break;
            }
            return result;
        }
    });
});

// запускаем http сервер
http.createServer(app).listen(1325);
console.log('Сервер запущен на http://127.0.0.1:1325/');