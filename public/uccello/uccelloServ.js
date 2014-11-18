if (typeof define !== 'function') {
    var define = require('amdefine')(module);
    var Class = require('class.extend');
}

define(
    ['./connection/socket', './system/logger', 'ws'],
    function(Socket, Logger, WebSocketServer) {
        var UccelloServ = Class.extend({
            init: function(options){

                var that = this;
                this._connectId = 0;
                this.logger = new Logger();
                this.userSessionMgr = options.userSessionMgr;
                this.router = options.router;

                this.router.add('getGuids', function(data, done) {
                    var user = that.userSessionMgr.getConnect(data.connectId).getSession().getUser();
                    var userData = user.getData();
                    result = {
                        masterSysGuid:that.userSessionMgr.dbsys.getGuid(),
                        sysRootGuid:user.getObj().getGuid()
                    };
                    done(result);
                    return result;
                });

                this.router.add('getSessions', function(data, done) {
                    var sessions = that.userSessionMgr.getSessions();
                    result = {sessions:[]};
                    for(var i in sessions) {
                        var session = {id:i, date:sessions[i].date, connects:[]};
                        var connects = sessions[i].item.getConnects();
                        for(var j in connects) {
                            var connect = {id:j, date:that.userSessionMgr.getConnectDate(j)};
                            session.connects.push(connect);
                        }
                        result.sessions.push(session);
                    }
                    done(result);
                    return result;
                });

                this.router.add('loadRes', function(data, done) {
                    function loadRes() {
                        var hehe = {"$sys":{"guid":"ac949125-ce74-3fad-5b4a-b943e3ee67c6","typeGuid":"1d95ab61-df00-aec8-eff5-0f90187891cf"},"fields":{"Id":11,"Name":"MainContainer"},"collections":{"Children":{"0":{"$sys":{"guid":"65704a87-4310-30ef-7b31-b8fe8bffa211","typeGuid":"af419748-7b25-1633-b0a9-d539cada8e0d"},"fields":{"Id":22,"Name":"MyFirstButton1","Top":"50","Left":"30","Caption":"OK"},"collections":{}},"1":{"$sys":{"guid":"5b6b203a-6ba3-b4e9-e153-01c104e699f9","typeGuid":"827a5cb3-e934-e28c-ec11-689be18dae97"},"fields":{"Id":33,"Name":"Grid","Top":"60","Left":"50","HorCells":3,"VerCells":4},"collections":{}},"2":{"$sys":{"guid":"6acec0b4-6601-545c-6f55-7c38b3f73089","typeGuid":"a0e02c45-1600-6258-b17a-30a56301d7f1"},"fields":{"Id":44,"Name":"PropEditor","Top":"10","Left":"700"},"collections":{}},"3":{"$sys":{"guid":"3bdd191f-b188-069f-9736-b578140984b7","typeGuid":"38aec981-30ae-ec1d-8f8f-5004958b4cfa"},"fields":{"Id":55,"Name":"DbNavigator","Top":"240","Left":"20"},"collections":{}}}}};
                        return hehe;
                    }
                    var result = {res:loadRes()};
                    done(result);
                });


                // запускаем вебсокетсервер
                this.wss = new WebSocketServer.Server({port: options.port});
                this.wss.on('connection', function(ws) {
                    // id подключения
                    that._connectId++;
                    new Socket(ws, {
                        side: 'server',
                        connectId: that._connectId,
                        close: function(event, connectId) { // при закрытии коннекта
                            var connect = that.userSessionMgr.getConnect(that._connectId);
                            if (connect)
                                connect.closeConnect();
                            console.log("отключился клиент: " + that._connectId);
                        },
                        router: function(data, connectId, socket, done) {
                            console.log('сообщение с клиента '+that._connectId+':', data);

                            // логирование входящих запросов
                            that.logger.addLog(data);

                            // обработчик
                            data.connect = that.userSessionMgr.getConnect(that._connectId);
                            data.connectId = that._connectId;
                            data.socket = socket;
                            that.router.exec(data, done);
                        }
                    });
                });
            }
        });
        return UccelloServ;
    }
);