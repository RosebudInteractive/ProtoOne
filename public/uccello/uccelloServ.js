if (typeof define !== 'function') {
    var define = require('amdefine')(module);
    var Class = require('class.extend');
}

define(
    ['./connection/socket', './system/logger', './dataman/dataman','ws'],
    function(Socket, Logger, Dataman, WebSocketServer) {
        var UccelloServ = Class.extend({
            init: function(options){
				this.pvt = {};

                var that = this;
                this._connectId = 0;
                this.logger = new Logger();
                this.userSessionMgr = options.userSessionMgr;
				
				
				
                this.router = options.router;
				
				this.pvt.dataman = new Dataman(this.router);
				
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

                this.router.add('getRootGuids', function(data, done) {
                    console.log(that.userSessionMgr.getController().getDB(data.db))
                    var result = {
                        roots: that.userSessionMgr.getController().getDB(data.db).getRootGuids()
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
                    var result = {res:this.userSessionMgr.loadRes(this.userSessionMgr.getController().guid())};
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
            },
			
			getRouter: function() {
				return this.router;
			}
        });
        return UccelloServ;
    }
);