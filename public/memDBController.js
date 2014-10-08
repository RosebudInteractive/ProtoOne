if (typeof define !== 'function') {
    var define = require('amdefine')(module);
    var Class = require('class.extend');
}

define(
	['./memDataBase'],
	function(MemDataBase) {
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
	
			init: function(){
				this.pvt = {};
				this.pvt.dbCollection = {};
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
			newDataBase: function(init) {
				return  new MemDataBase(this,init);
			},

			// подписать базу данных на ее мастер (только из инит)
            _subscribe: function(db,proxyMaster) {
				var p=this.findOrCreateProxy(proxyMaster);
				if (p.kind == "remote")
					p.connect.send({action:'subscribe', slaveGuid:db.getGuid(), masterGuid: p.guid});
					//db.getConnection().send({action:'subscribe', guid:db.getGuid()});
				else {
					this.onSubscribe(this.getProxy(db.getGuid()),p.db.getGuid());
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
			
			// подписать базу db на рутовый элемент с гуидом rootGuid
			subscribeRoot: function(db,rootGuid, callback) {
				var p = db.getProxyMaster();
				if (p.kind == "local") { // мастер-база доступна локально
					var newObj = p.db.onSubscribeRoot(db.getGuid(),rootGuid);
					db.deserialize(newObj);
				}
				else { // мастер-база доступна удаленно
					callback2 = function(newObj) {
						db.deserialize(newObj.data);
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
                        this.pvt.dbCollection[i].db.unSubscribe(connectId);
                }
            },

            applyDelta: function(guidDb, sendGuidDb, guidRootObj, delta) {
                // находим рутовый объект к которому должна быть применена дельта
                var db  = this.getDB(guidDb);
                var root = db.getRoot(guidRootObj);

                // вызывает у лога этого объекта applyDelta(delta)
                root.obj.getLog().applyDelta(delta);

                // пробегает по подписчикам этого корневого объекта и рассылает
                // им всем ту же самую дельту. При этом необходимо, чтобы из
                // подписчиков был исключен тот, кто эту дельту послал.
                // Самый важный момент - подписчики могут быть локальными или
                // удаленными.  про это знает контроллер, который в случае удаленного
                // подписчика должен послать сообщение подписчику, а в случае локального
                // должен непосредственно вызвать тот же метод controller.applyDelta. При этом
                // необходимо сперва сделать все отсылки удаленным подписчикам, а затем уже
                // обработать локальных.
                console.log('root.subscribers', root.subscribers);
                for(var guid in root.subscribers) {
                    var subscriber = root.subscribers[guid];
                    console.log('subscriber', subscriber);
                    // удаленные
                    if (subscriber.kind == 'remote' && sendGuidDb != guid)
                        subscriber.connect.send({action:"sendDelta", delta:delta, guidDb:subscriber.guid, guidRoot:guid});
                }
                for(var guid in root.subscribers) {
                    var subscriber = root.subscribers[guid];
                    // локальные
                    if (subscriber.kind == 'local' && sendGuidDb != guid)
                        subscriber.db.getObj(guid).getLog().applyDelta(delta);
                }
            }
        });
		return MemDBController;
	}
);