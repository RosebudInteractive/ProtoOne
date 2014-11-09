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
var PropEditor = require('./public/ProtoControls/propEditor');
var DBNavigator = require('./public/ProtoControls/dbNavigator');

// Коммуникационные модули
var Socket = require('./public/uccello/connection/socket');
var Router = require('./public/uccello/connection/router');
var UserSessionMgr = require('./public/uccello/connection/userSessionMgr');
var Logger = require('./public/uccello/system/logger');

// Модули nodejs
var http = require('http');
var express = require('express');
var app = express();
var WebSocketServer = new require('ws');

// Обработчики express
// ----------------------------------------------------------------------------------------------------------------------

// обработчик файлов html будет шаблонизатор ejs
app.engine('html', require('ejs').renderFile);

// обработка /test
app.get('/test', function(req, res){
    res.render('proto1.html');
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
    if (user=='user' && pass=='123')
        row = {user_id:1, email:'user@user.com'};
    done(err, row);
}

// один контроллер на сервер
// var dbc = new MemDBController();

// хранилище коннектов и сессий

var myServerApp = {}; // тут все данные


var router = new Router();
var logger = new Logger();
//var userSessionMgr = new UserSessionMgr(router, {authenticate:fakeAuthenticate, dbc:dbc});
myServerApp.userSessionMgr = new UserSessionMgr(router, {authenticate:fakeAuthenticate});

// прикладные методы
router.add('getGuids', function(data, done) {
    var user = myServerApp.userSessionMgr.getConnect(data.connectId).getSession().getUser();
    var userData = user.getData();
    var db = userData.db;
    result = {
        masterGuid:db.getGuid(),
        myRootContGuid:userData.myRootCont.getGuid(),
        masterSysGuid:myServerApp.userSessionMgr.dbsys.getGuid(),
        sysRootGuid:user.getObj().getGuid()
    };
    done(result);
    return result;
});
router.add('getSessions', function(data, done) {
    var sessions = myServerApp.userSessionMgr.getSessions();
    result = {sessions:[]};
    for(var i in sessions) {
        var session = {id:i, date:sessions[i].date, connects:[]};
        var connects = sessions[i].item.getConnects();
        for(var j in connects) {
            var connect = {id:j, date:myServerApp.userSessionMgr.getConnectDate(j)};
            session.connects.push(connect);
        }
        result.sessions.push(session);
    }
    done(result);
    return result;
});




/**
 * Создать базу данных
 * @param dbc
 * @param options
 * @returns {object}
 */
function createDb(dbc, options){
    var db = myServerApp.userSessionMgr.getController().newDataBase(options);
	var cm = new ControlMgr(db);

    var component = new AComponent(cm);
    var control = new AControl(cm);
    var rootCont = new AContainer(cm);
    var button = new AButton(cm);
    var matrixGrid = new AMatrixGrid(cm);
    var propEditor = new PropEditor(cm);
    var dbNavigator = new DBNavigator(cm);


	var hehe = {"$sys":{"guid":"ac949125-ce74-3fad-5b4a-b943e3ee67c6","typeGuid":"1d95ab61-df00-aec8-eff5-0f90187891cf"},"fields":{"Id":11,"Name":"MainContainer"},"collections":{"Children":{"0":{"$sys":{"guid":"65704a87-4310-30ef-7b31-b8fe8bffa211","typeGuid":"af419748-7b25-1633-b0a9-d539cada8e0d"},"fields":{"Id":22,"Name":"MyFirstButton1","Top":"50","Left":"30","Caption":"OK"},"collections":{}},"1":{"$sys":{"guid":"5b6b203a-6ba3-b4e9-e153-01c104e699f9","typeGuid":"827a5cb3-e934-e28c-ec11-689be18dae97"},"fields":{"Id":33,"Name":"Grid","Top":"60","Left":"50","HorCells":3,"VerCells":4},"collections":{}},"2":{"$sys":{"guid":"6acec0b4-6601-545c-6f55-7c38b3f73089","typeGuid":"a0e02c45-1600-6258-b17a-30a56301d7f1"},"fields":{"Id":44,"Name":"PropEditor","Top":"10","Left":"700"},"collections":{}},"3":{"$sys":{"guid":"3bdd191f-b188-069f-9736-b578140984b7","typeGuid":"38aec981-30ae-ec1d-8f8f-5004958b4cfa"},"fields":{"Id":55,"Name":"DbNavigator","Top":"240","Left":"20"},"collections":{}}}}};
	db.deserialize(hehe, {db: db});
    return {cm:cm, db:db, myRootCont: db.getObj("ac949125-ce74-3fad-5b4a-b943e3ee67c6")};

   /* var myRootCont = db.newRootObj(db.getObj(rootCont.classGuid), {fields: {"Id": 11, "Name": "MainContainer"}});
    var myButton = new MemObj(db.getObj(button.classGuid), { obj: myRootCont, colName: "Children"}, {fields: {"Id": 22, "Name": "MyFirstButton1", "Caption": "OK", "Left":"30", "Top":"50"}});
    var myMatrixGrid = new MemObj(db.getObj(matrixGrid.classGuid), { obj: myRootCont, colName: "Children"}, {fields: {Id:33, HorCells:3, VerCells:4, Name:"Grid", "Left":"50", "Top":"60"}});
    var myPropEditor = new MemObj(db.getObj(propEditor.classGuid), { obj: myRootCont, colName: "Children"}, {fields: {Id:44,  Name:"PropEditor", "Left":"700", "Top":"10"}});
    var myDbNavigator = new MemObj(db.getObj(dbNavigator.classGuid), { obj: myRootCont, colName: "Children"}, {fields: {Id:55,  Name:"DbNavigator", "Left":"20", "Top":"240"}});
    return {cm:cm, db:db, myRootCont:myRootCont, myButton:myButton, myMatrixGrid:myMatrixGrid, myPropEditor:myPropEditor, myDbNavigator:myDbNavigator};*/
}

// вызывается по событию при создании нового пользователя
function createUserContext(args) {
	var userData = args.target.getData();
	userData.controller = myServerApp.userSessionMgr.getController();
	var r = createDb(myServerApp.userSessionMgr.getController(), {name: "Master", kind: "master"});
	userData.db = r.db;
	userData.cm = r.cm;	
	userData.myRootCont = r.myRootCont;
    console.log(userData);
};
myServerApp.userSessionMgr.event.on({
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
            var connect = myServerApp.userSessionMgr.getConnect(connectId);
            if (connect)
                connect.closeConnect();
            console.log("отключился клиент: " + connectId);
        },
        router: function(data, connectId, socket, done) {
            console.log('сообщение с клиента '+connectId+':', data);

            // логирование входящих запросов
            logger.addLog(data);

            // обработчик
            if (data.action!='subscribe' && data.action!='subscribeRoot' && data.action!='sendDelta') {
                data.connectId = connectId;
                data.socket = socket;
                router.exec(data, done);
				// TODO? Почему нет done ?
                return;
            }

            var result = {};
            switch (data.action) {

                case 'subscribe':
                    var connect = myServerApp.userSessionMgr.getConnect(connectId);
                    var u = connect.getSession().getUser();
                    var dbc = u.getData().controller;

                    result = {data:dbc.onSubscribe({connect:connect, guid:data.slaveGuid}, data.masterGuid)};
                    break;

                case 'subscribeRoot':
                    var connect = myServerApp.userSessionMgr.getConnect(connectId);
                    var u = connect.getSession().getUser();
                    var dbc = u.getData().controller;

					var masterdb = dbc.getDB(data.masterGuid);
                    if (!masterdb.isSubscribed(data.slaveGuid)) // если клиентская база еще не подписчик
                        dbc.onSubscribe({connect:connectId, guid:data.slaveGuid}, data.masterGuid );
                    result = {data:masterdb.onSubscribeRoot(data.slaveGuid, data.objGuid)};
                    break;

                case 'sendDelta':
                    var dbc = myServerApp.userSessionMgr.getConnect(connectId).getSession().getUser().getData().controller;
                    dbc.applyDeltas(data.dbGuid, data.srcDbGuid, data.delta);
                    break;


            }
            done(result);
            return result;
        }
    });
});

// запускаем http сервер
http.createServer(app).listen(1325);
console.log('Сервер запущен на http://127.0.0.1:1325/');