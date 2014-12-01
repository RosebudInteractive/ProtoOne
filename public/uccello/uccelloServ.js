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
                this.pvt = {};
                this.pvt.userSessionMgr = options.userSessionMgr;
                this.pvt.router = options.router;

                this.pvt.router.add('getGuids', function(data, done) {
                    var user = that.pvt.userSessionMgr.getConnect(data.connectId).getSession().getUser();
                    var userData = user.getData();
                    result = {
                        masterSysGuid:that.pvt.userSessionMgr.dbsys.getGuid(),
                        sysRootGuid:user.getObj().getGuid()
                    };
                    done(result);
                    return result;
                });

                this.pvt.router.add('getRootGuids', function(data, done) {
                    console.log(that.pvt.userSessionMgr.getController().getDB(data.db))
                    var result = {
                        roots: that.pvt.userSessionMgr.getController().getDB(data.db).getRootGuids()
                    };
                    done(result);
                    return result;
                });

                this.pvt.router.add('getSessions', function(data, done) {
                    var sessions = that.pvt.userSessionMgr.getSessions();
                    result = {sessions:[]};
                    for(var i in sessions) {
                        var session = {id:i, date:sessions[i].date, connects:[]};
                        var connects = sessions[i].item.getConnects();
                        for(var j in connects) {
                            var connect = {id:j, date:that.pvt.userSessionMgr.getConnectDate(j)};
                            session.connects.push(connect);
                        }
                        result.sessions.push(session);
                    }
                    done(result);
                    return result;
                });

                this.pvt.router.add('loadRes', function(data, done) {
                    var result = {res:this.pvt.userSessionMgr.loadRes(this.pvt.userSessionMgr.getController().guid())};
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
                            var connect = that.pvt.userSessionMgr.getConnect(that._connectId);
                            if (connect)
                                connect.closeConnect();
                            console.log("отключился клиент: " + that._connectId);
                        },
                        router: function(data, connectId, socket, done) {
                            console.log('сообщение с клиента '+that._connectId+':', data);

                            // логирование входящих запросов
                            that.logger.addLog(data);

                            // обработчик
                            data.connect = that.pvt.userSessionMgr.getConnect(that._connectId);
                            data.connectId = that._connectId;
                            data.socket = socket;
                            that.pvt.router.exec(data, done);
                        }
                    });
                });
            }
        });
        return UccelloServ;
    }
);