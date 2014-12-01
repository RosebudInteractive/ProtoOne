if (typeof define !== 'function') {
    var define = require('amdefine')(module);
    var Class = require('class.extend');
}

define(
    ['./connection/socket', './system/logger', './dataman/dataman', 'ws', './connection/router', './connection/userSessionMgr'],
    function(Socket, Logger, Dataman, WebSocketServer, Router, UserSessionMgr) {
        var UccelloServ = Class.extend({
            init: function(options){
                var that = this;
                this._connectId = 0;
				this.pvt = {};
                this.pvt.logger = new Logger();
                this.pvt.router = new Router();
                this.pvt.userSessionMgr = new UserSessionMgr(this.getRouter(), {authenticate:options.authenticate});
                this.pvt.dataman = new Dataman(this.getRouter(), that.getUserMgr().getController());

                this.getRouter().add('getGuids', function(data, done) {
                    var user = that.getUserMgr().getConnect(data.connectId).getSession().getUser();
                    var userData = user.getData();
                    result = {
                        masterSysGuid:that.getUserMgr().dbsys.getGuid(),
                        sysRootGuid:user.getObj().getGuid()
                    };
                    done(result);
                    return result;
                });

                this.getRouter().add('getRootGuids', function(data, done) {
                    console.log(that.getUserMgr().getController().getDB(data.db))
                    var result = {
                        roots: that.getUserMgr().getController().getDB(data.db).getRootGuids(data.rtype)
                    };
                    done(result);
                    return result;
                });

                this.getRouter().add('getSessions', function(data, done) {
                    var sessions = that.getUserMgr().getSessions();
                    result = {sessions:[]};
                    for(var i in sessions) {
                        var session = {id:i, date:sessions[i].date, connects:[]};
                        var connects = sessions[i].item.getConnects();
                        for(var j in connects) {
                            var connect = {id:j, date:that.getUserMgr().getConnectDate(j)};
                            session.connects.push(connect);
                        }
                        result.sessions.push(session);
                    }
                    done(result);
                    return result;
                });

                this.getRouter().add('loadRes', function(data, done) {
                    var result = {res:this.getUserMgr().loadRes(this.getUserMgr().getController().guid())};
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
                            var connect = that.getUserMgr().getConnect(that._connectId);
                            if (connect)
                                connect.closeConnect();
                            console.log("отключился клиент: " + that._connectId);
                        },
                        router: function(data, connectId, socket, done) {
                            console.log('сообщение с клиента '+that._connectId+':', data);

                            // логирование входящих запросов
                            that.pvt.logger.addLog(data);

                            // обработчик
                            data.connect = that.getUserMgr().getConnect(that._connectId);
                            data.connectId = that._connectId;
                            data.socket = socket;
                            that.getRouter().exec(data, done);
                        }
                    });
                });
            },
			
			getUserMgr: function() {
				return this.pvt.userSessionMgr;
			},
			
			getRouter: function() {
				return this.pvt.router;
			}
        });
        return UccelloServ;
    }
);