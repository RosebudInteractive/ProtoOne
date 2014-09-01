var http = require('http');
var express = require('express');
var app = express();
var WebSocketServer = new require('ws');

var Module1 = require('./public/module1');
var module1 = new Module1();

var User = require('./public/user');
var Admin = require('./public/admin');

var Db = require('./public/memDataBase');

// обработчик файлов html будет шаблонизатор ejs
app.engine('html', require('ejs').renderFile);

// обработка главной, возвращает случайное число
app.get('/', function(req, res){
	res.render('index1.html');
    //res.end(module1.getRandomInt(0, 1000).toString());
});

// отображаем index.html
app.get('/client', function(req, res){
    res.render('index.html');
});

// запросить значение переменной из кеша
app.get('/getcache', function(req, res){
    memcached.get(req.query.name, function( err, result ){
        if( err ) throw (err);
        res.writeHead(200, {'Content-Type': 'text/plain'});
        res.write(''+result);
        res.end();
    });
});

// установить значение переменной в кеше
app.get('/setcache', function(req, res){
    memcached.set(req.query.name, req.query.value, lifetime, function( err, result ){
        if( err ) throw (err);
        res.writeHead(200, {'Content-Type': 'text/plain'});
        res.write(''+result);
        res.end();
    });
});


// статические данные и модули для подгрузки на клиент
app.use("/public", express.static(__dirname + '/public'));


// коллекции пользователей и админов
var users=[], admins = [];

// подключенные клиенты
var clients = {};

var myDB = new Db("ServerDataBase puk");
console.log(myDB.getName());


// WebSocket-сервер на порту 8081
var webSocketServer = new WebSocketServer.Server({port: 8081});

webSocketServer.on('connection', function(ws) {

    // запоминаем клиента подключенного
    var id = Math.random();
    clients[id] = ws;
    console.log("новое соединение " + id);

    setTimeout(function(){
        for(var key in clients) {
            clients[key].send(JSON.stringify({error:null, action:'newconn', name:'новое соединение'}));;
        }
    }, 1000);

    ws.on('message', function(message) {
        console.log(message, JSON.parse(message));
        var data = JSON.parse(message);
        switch (data.action) {
            case 'addobject':
                if (data.type == 'admin') {
                    var admin = new Admin(data.name);
                    admins.push(admin);
                } else {
                    var user = new User(data.name);
                    users.push(user);
                }
                ws.send(JSON.stringify({error:null, action:data.action, type:data.type, name:data.name}));
                break;
            case 'getlistobject':
                var coll = null;
                if (data.type == 'admin')
                    coll = admins;
                else
                    coll = users;
                var names = [];
                for(var i=0; i<coll.length; i++)
                    names.push(coll[i].getName());
                ws.send(JSON.stringify({error:null, action:data.action, type:data.type, names:names.join(',')}));
                break;
        }
    });

    ws.on('close', function() {
        delete clients[id];
    });
});

// запускаем http сервер
http.createServer(app).listen(1325);
console.log('Server running at http://127.0.0.1:1325/');