if (typeof define !== 'function') {
    var define = require('amdefine')(module);
    var Class = require('class.extend');
}

define(
	['./memDataBase', '../system/event'],
	function(MemDataBase, Event) {
		var MemDBController = Class.extend({
		
			init: function(router){
				this.pvt = {};
				this.pvt.dbCollection = {};
                this.event = new Event();

                if (router) {
                    var that = this;
                    router.add('subscribe', function(){ return that.routerSubscribe.apply(that, arguments); });
                    router.add('unsubscribe', function(){ return that.routerUnsubscribe.apply(that, arguments); });
                    router.add('subscribeRoot', function(){ return that.routerSubscribeRoot.apply(that, arguments); });
                    router.add('sendDelta', function(){ return that.routerSendDelta.apply(that, arguments); });
                }
			},
			
			createLocalProxy: function(db) {
				var dbInfo = {};
				dbInfo.db = db;
				dbInfo.kind = "local";
				dbInfo.guid = db.getGuid();
				this.pvt.dbCollection[db.getGuid()] = dbInfo;
				return dbInfo;
			},

			findOrCreateProxy: function(proxy) {
				var p=this.getProxy(proxy.guid);
				if (p)  return p;
				
				var dbInfo = {};
				dbInfo.db = null;
				dbInfo.kind = "remote";
				dbInfo.guid = proxy.guid;
				dbInfo.connect = proxy.connect;
				this.pvt.dbCollection[proxy.guid] = dbInfo;
				return dbInfo;
			},			
	


            routerSubscribe: function(data, done) {
                var result = {data: this.onSubscribe({connect:data.connect, guid:data.slaveGuid}, data.masterGuid)};
                done(result);
            },

            routerUnsubscribe: function(data, done) {
                this.getDB(data.masterGuid).onUnsubscribe(data.connectId, data.slaveGuid);
                done({});
            },

            routerSubscribeRoot: function(data, done) {
                var masterdb = this.getDB(data.masterGuid);
                if (!masterdb.isSubscribed(data.slaveGuid)) // если клиентская база еще не подписчик
                    dbc.onSubscribe({connect:data.connectId, guid:data.slaveGuid}, data.masterGuid );
                var result = {data:masterdb.onSubscribeRoot(data.slaveGuid, data.objGuid)};
                done(result);
            },

            routerSendDelta: function(data, done) {
                console.time('applyDeltas');
                this.applyDeltas(data.dbGuid, data.srcDbGuid, data.delta);
                console.timeEnd('applyDeltas');
				console.log("VALID:"+this.getDB(data.dbGuid).getVersion("valid")+"draft:"+this.getDB(data.dbGuid).getVersion()+"sent:"+this.getDB(data.dbGuid).getVersion("sent"));
                done({data: {dbVersion: this.getDB(data.dbGuid).getVersion() }});
            },
			
			// сгенерировать guid
			guid: function () {
			
				function s4() {
				  return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
				};
				
					return s4() + s4() +'-'+ s4()  +'-'+ s4() +'-'+
						 s4() +'-'+ s4() + s4() + s4();
			},
			
			
			// создать новую базу данных в данном контроллере
			newDataBase: function(init,cb) {
				return  new MemDataBase(this,init,cb);
			},
			
			// удалить базу из коллекции
			delDataBase: function(guid, cb) {
				var db = this.getDB(guid);

				if (db!=undefined) {
					if (db.isMaster()) {
						// TODO отписать форсированно подписанных клиентов!
						delete this.pvt.dbCollection[guid];
					}
					else {
						var master = db.getProxyMaster();
                        var that=this;
                        if (master.kind == "remote")
                            master.connect.send({action:'unsubscribe', type:'method', slaveGuid:guid, masterGuid:master.guid},function(){
                                delete that.pvt.dbCollection[guid];
                                if (cb !== undefined && (typeof cb == "function")) cb();
                            });
                        else {
                            this.onUnsubscribe(p.connect, guid);
                            delete this.pvt.dbCollection[guid];
                            if (cb !== undefined && (typeof cb == "function")) cb();
                        }
						// TODO если есть подписчики - отписать их тоже
					}
				}
				
			},

			// подписать базу данных на ее мастер (только из инит)
            _subscribe: function(db,proxyMaster,cb) {
				var p=this.findOrCreateProxy(proxyMaster);
				if (p.kind == "remote")
					p.connect.send({action:'subscribe', type:'method', slaveGuid:db.getGuid(), masterGuid: p.guid},cb);
					//db.getConnection().send({action:'subscribe', guid:db.getGuid()});
				else {
					this.onSubscribe(this.getProxy(db.getGuid()),p.db.getGuid());
					if (cb !== undefined && (typeof cb == "function")) cb();
				}				
				// TODO обработать асинхронность
            },
			
			// подписать proxy на базу данных с гуидом dbGuid, относящуюся к данному контроллеру
			// proxy - прокси базы, которая подписывается
			// masterGuid - база данных, на которую подписываем
            onSubscribe: function(proxy,masterGuid) {
				var p=this.findOrCreateProxy(proxy);				
				db=this.getDB(masterGuid);
				db.onSubscribe(p);
				return { dbVersion: db.getVersion() };
            },

            /**
             * подписать базу db на рутовый элемент с гуидом rootGuid
			 * @param {MemDataBase} db - база данных
             * @param rootGuid
             * @param cb - вызывается после того, как подписка произошла и данные сериализовались в базе
			 * @param cb2 - вызывается по ходу создания объектов
             */
			subscribeRoot: function(db,rootGuid, cb, cb2) {

				
				var p = db.getProxyMaster();
				if (p.kind == "local") { // мастер-база доступна локально
					var newObj = p.db.onSubscribeRoot(db.getGuid(),rootGuid);
					db.deserialize(newObj,{db:db, mode:"RW"},cb2);
					if (cb2!==undefined)  // запомнить коллбэк
						db._cbSetNewObject(rootGuid,cb2);
					if (cb !== undefined && (typeof cb == "function")) cb();
				}
				else { // мастер-база доступна удаленно
					callback2 = function(obj) {
						db.deserialize(obj.data,{db:db, mode:"RW"},cb2);
						//console.log(JSON.stringify(obj.data));
						if (cb2!==undefined)  // запомнить коллбэк
							db._cbSetNewObject(rootGuid,cb2);
						if (cb !== undefined && (typeof cb == "function")) cb();
					}
					p.connect.send({action:'subscribeRoot', type:'method', slaveGuid:db.getGuid(), masterGuid: p.guid, objGuid:rootGuid},callback2);

					// TODO обработать асинхронность
				}
			},
			
			//onSubscribeRoot: function(proxy,dbGuid
			
			// отписать либо все базы данного коннекта либо БД с гуидом guid
			onUnsubscribe: function(connect, dbGuid) {
				if (dbGuid==undefined) {
					
				}
				else {
					
				}
			},
			
            getDB: function(guid){

                // поиск по гуиду
				var dbInfo = this.pvt.dbCollection[guid];
				if (dbInfo) {
					if (dbInfo.kind == "local")
						return dbInfo.db;
					else return null;
				}

                return null;
            },
			
			getProxy: function(dbGuid) {
				return this.pvt.dbCollection[dbGuid];
			},

            /**
             * Отключение коннекта
             * @param connectId
             */
            onDisconnect: function(connectId) {
                for(var i in this.pvt.dbCollection) {
                    if (this.pvt.dbCollection[i].db)
                        this.pvt.dbCollection[i].db.onUnsubscribe(connectId);
                }
            },

			// пока только 1 дельта!!!!
            applyDeltas: function(dbGuid, srcDbGuid, delta) {
			
				console.log("incoming delta");
				console.log(delta);
			
                // находим рутовый объект к которому должна быть применена дельта
                var db  = this.getDB(dbGuid);
                var root = db.getRoot(delta.rootGuid);
				
                // вызывает у лога этого объекта applyDelta(delta)
				console.log("applydeltas");

				var lval = db.getVersion("valid");
				var ldraft = db.getVersion();
				var dval = delta.content.dbVersion;
				if (db.isMaster()) {
					if (lval == dval - 1) {
						//  на сервере сразу валидируется версия при изменениях.
					}
					else {
						console.log("cannot sync server -  valid version:"+lval+"delta version:"+dval);
						console.log("VALID:"+db.getVersion("valid")+"draft:"+db.getVersion()+"sent:"+db.getVersion("sent"));
						return;				
					}				
				}
				else {

					if (lval == dval - 1) { // нормальная ситуация, на клиент пришла дельта с подтвержденной версией +1
						if (ldraft>lval) db.undo(lval);
					}
					else {
						console.log("cannot sync client -  valid version:"+lval+"delta version:"+dval);
						console.log("VALID:"+db.getVersion("valid")+"draft:"+db.getVersion()+"sent:"+db.getVersion("sent"));
						return;
					}

						// TODO подписчикам передать если  делать тему с N базами

				}
				console.log(" DELTA VER:"+delta.content.dbVersion);

                root.obj.getLog().applyDelta(delta.content);
				db.setVersion("draft",delta.content.dbVersion);
				db.setVersion("sent",delta.content.dbVersion);
				db.setVersion("valid",delta.content.dbVersion);

				console.log("VALID:"+db.getVersion("valid")+"draft:"+db.getVersion()+"sent:"+db.getVersion("sent"));

				
				var deltas = [];
				deltas.push(delta);
			
				this.propagateDeltas(dbGuid,srcDbGuid,deltas);

                this.event.fire({
                    type: 'applyDeltas',
                    target: this
                });
            },
			
            /**
             * Сгенерировать и разослать "дельты" 
             * @param dbGuid - гуид базы данных, для которой генерим дельты
             */
			genDeltas: function(dbGuid) {
				var db  = this.getDB(dbGuid);
				var deltas = db.genDeltas();
				if (deltas.length>0) {
					this.propagateDeltas(dbGuid,null,deltas);
					if (db.getVersion("sent")<db.getVersion()) db.setVersion("sent",db.getVersion());
				}
			},
			
			
			// послать подписчикам и мастеру дельты которые либо сгенерированы локально либо пришли снизу либо сверху
			propagateDeltas: function(dbGuid, srcDbGuid, deltas) {

				function cb(result) {
					if (db.getVersion("valid")<result.data.dbVersion) 
						db.setVersion("valid", result.data.dbVersion); 
						
					if (db.getVersion("valid")>result.data.dbVersion) {
						// откатить до версии сервера
						db.undo(result.data.dbVersion);
					}
				}
				//var db = this.getDB(dbGuid);
				//var deltas = db.genDeltas();
				var db  = this.getDB(dbGuid);
				for (var i=0; i<deltas.length; i++) {
								
					var delta = deltas[i];
					if (srcDbGuid != db.getGuid()) {
						// послать в мастер
						var proxy = db.getProxyMaster();
						if (proxy != undefined && proxy.guid != srcDbGuid) {
							if (proxy.kind == "local") {
								//TODO
								db.getRoot(proxy.guid).obj.getLog().applyDelta(delta.content);
								// TODO валидировать версию
								}
							else {
								//var cb = this._receiveResponse; //function(result) { if (db.getVersion("valid")<result.data.dbVersion) db.newVersion("valid", result.data.dbVersion - db.getVersion("valid")); };
								proxy.connect.send({action:"sendDelta", type:'method', delta:delta, dbGuid:proxy.guid, srcDbGuid: db.getGuid()},cb);
								}
						}
					}
										
					var root = db.getRoot(delta.rootGuid);
					
					// распространить по подписчикам
					for(var guid in root.subscribers) {
						var subscriber = root.subscribers[guid];
						console.log('subscriber', subscriber);
						// удаленные
						if (subscriber.kind == 'remote' && srcDbGuid != guid) {
							subscriber.connect.send({action:"sendDelta", delta:delta, dbGuid:subscriber.guid, srcDbGuid: db.getGuid()});
							console.log("sent to DB : "+subscriber.guid);
							}
					}
					for(var guid in root.subscribers) {
						var subscriber = root.subscribers[guid];
						// локальные
						if (subscriber.kind == 'local' && srcDbGuid != guid)
							subscriber.db.getObj(delta.rootGuid).getLog().applyDelta(delta.content);
							// TODO валидировать версию
					}
					
					
				}
			}
			
			
        });
		return MemDBController;
	}
);