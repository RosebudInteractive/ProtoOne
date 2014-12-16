if (typeof define !== 'function') {
    var define = require('amdefine')(module);
    var Class = require('class.extend');
}

define(
    ['./connection/socket', './system/logger', './dataman/dataman', 'ws', './connection/router', './connection/userSessionMgr',
	'./system/rpc'],
    function(Socket, Logger, Dataman, WebSocketServer, Router, UserSessionMgr, Rpc) {
	
		var guidServer = "d3d7191b-3b4c-92cc-43d4-a84221eb35f5";
	
		var interface1 = {
		
			className: "Interfsrv",
			classGuid: "ef9bfa83-8371-6aaa-b510-28cd83291ce9",

			loadResources: "function",
			queryDatas: "function"
		}
	
        var UccelloServ = Class.extend({
            init: function(options){
                var that = this;
                this._connectId = 0;
				this.pvt = {};
                this.pvt.logger = new Logger();
                this.pvt.router = new Router();
				var rpc = this.pvt.rpc = new Rpc( { router: this.pvt.router } );
				
				this.pvt.proxyServer = rpc._publ(this, interface1); //


                this.pvt.userSessionMgr = new UserSessionMgr(this.getRouter(), {authenticate:options.authenticate, rpc:this.pvt.rpc, proxyServer: this.pvt.proxyServer});
                this.pvt.dataman = new Dataman(this.getRouter(), that.getUserMgr().getController());

                this.getRouter().add('getGuids', function(data, done) {
                    var user = that.getUserMgr().getConnect(data.connectId).getSession().getUser();
                    var userData = user.getData();
                    var result = {
                        masterSysGuid:that.getUserMgr().dbsys.getGuid(),
                        sysRootGuid:user.getObj().getGuid()
                    };
                    done(result);
                    return result;
                });
				
				
				this.getRouter().add('testIntf', function(data, done) { console.log("interface get"); done({ intf: interface1 }); }); 

                this.getRouter().add('getRootGuids', function(data, done) {
                    console.log(that.getUserMgr().getController().getDB(data.db))
                    var result = {
                        roots: that.getUserMgr().getController().getDB(data.db).getRootGuids(data.rootKind)
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
			},
			
			getGuid: function() {
				return guidServer;
			},

            /**
             * Загрузить ресурсы по их гуидам
			 * @param rootGuids - массив гуидов ресурсов
             * @returns {obj} - массив ресурсов в result.resources
             */
			loadResources: function(rootGuids, done) {
				var result = [];
				for (var i=0; i<rootGuids.length; i++) 
					result.push(this.pvt.userSessionMgr.loadRes(rootGuids[i]));
				console.log("load resources");
				if (done !== undefined && (typeof done == "function")) done({ resources: result });
				return { resources: result };// временная заглушка
			},

            /**
             * Загрузить данные по их гуидам - ???
			 * @param rootGuids - массив гуидов данных
             * @returns {obj} - массив ресурсов в result.datas
             */			
			queryDatas: function(rootGuids,done) {
				var result = { datas: [this.pvt.dataman.loadQuery(rootGuids[0])] };
				if (done !== undefined && (typeof done == "function")) done(result);
				return result;
			}
			
			
			
        });
        return UccelloServ;
    }
);