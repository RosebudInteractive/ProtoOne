if (typeof define !== 'function') {
    var define = require('amdefine')(module);
    var Class = require('class.extend');
}

define(
	['./memDataBase', '../system/event'],
	function(MemDataBase, Event) {
		var MemDBController = Class.extend({

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
	
			init: function(router){
				this.pvt = {};
				this.pvt.dbCollection = {};
                this.event = new Event();

                if (router) {
                    var that = this;
                    router.add('subscribe', function(){ return that.routerSubscribe.apply(that, arguments); });
                    router.add('subscribeRoot', function(){ return that.routerSubscribeRoot.apply(that, arguments); });
                    router.add('sendDelta', function(){ return that.routerSendDelta.apply(that, arguments); });
                }
			},

            routerSubscribe: function(data, done) {
                var result = {data: this.onSubscribe({connect:data.connect, guid:data.slaveGuid}, data.masterGuid)};
                done(result);
            },

            routerSubscribeRoot: function(data, done) {
                var masterdb = this.getDB(data.masterGuid);
                if (!masterdb.isSubscribed(data.slaveGuid)) // если клиентская база еще не подписчик
                    dbc.onSubscribe({connect:data.connectId, guid:data.slaveGuid}, data.masterGuid );
                var result = {data:masterdb.onSubscribeRoot(data.slaveGuid, data.objGuid)};
                done(result);
            },

            routerSendDelta: function(data, done) {
                this.applyDeltas(data.dbGuid, data.srcDbGuid, data.delta);
                done({});
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
                /*var db = this.getDB(proxy.guid);
                if (db)
                    db.getProxyMaster().db.onSubscribe(proxy);*/
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
						console.log(JSON.stringify(obj.data));
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
				
				/*
                for(var i, len=this.dbCollection.length; i<len; i++)
                    if (this.dbCollection[i].getGuid() == guid)
                        return this.dbCollection[i];

                // первую
                if (this.dbCollection.length > 0)
                    return this.dbCollection[0];*/

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
                root.obj.getLog().applyDelta(delta.content);

				var deltas = [];
				deltas.push(delta);
			
				this.propagateDeltas(dbGuid,srcDbGuid,deltas);

                this.event.fire({
                    type: 'applyDeltas',
                    target: this
                });
            },
			
			// сгенерить и разослать дельты
			genDeltas: function(dbGuid) {
				var db  = this.getDB(dbGuid);
				var deltas = db.genDeltas();
				this.propagateDeltas(dbGuid,null,deltas);
			},
			
			// послать подписчикам и мастеру дельты которые либо сгенерированы локально либо пришли снизу либо сверху
			propagateDeltas: function(dbGuid, srcDbGuid, deltas) {
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
								}
							else
								proxy.connect.send({action:"sendDelta", delta:delta, dbGuid:proxy.guid, srcDbGuid: db.getGuid()});
						}
					}
										
					var root = db.getRoot(delta.rootGuid);
					
					for(var guid in root.subscribers) {
						var subscriber = root.subscribers[guid];
						console.log('subscriber', subscriber);
						// удаленные
						if (subscriber.kind == 'remote' && srcDbGuid != guid)
							subscriber.connect.send({action:"sendDelta", delta:delta, dbGuid:subscriber.guid, srcDbGuid: db.getGuid()});
					}
					for(var guid in root.subscribers) {
						var subscriber = root.subscribers[guid];
						// локальные
						if (subscriber.kind == 'local' && srcDbGuid != guid)
							subscriber.db.getObj(delta.rootGuid).getLog().applyDelta(delta.content);
					}
					
					
				}
			}
			
			
        });
		return MemDBController;
	}
);