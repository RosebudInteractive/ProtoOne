if (typeof define !== 'function') {
    var define = require('amdefine')(module);
    var Class = require('class.extend');
}

define(
	['./memDataBase'],
	function(MemDataBase) {
		var MemDBController = Class.extend({

			_attachLocalDataBase: function(db) {
				var dbInfo = {};
				dbInfo.db = db;
				dbInfo.kind = "local";
				dbInfo.guid = db.getGuid();
				this.pvt.dbCollection[db.getGuid()] = dbInfo;
			},

			_attachRemoteDataBase: function(proxy) {
				var dbInfo = {};
				dbInfo.db = null;
				dbInfo.kind = "remote";
				dbInfo.guid = proxy.guid;
				dbInfo.connect = proxy.connect;
				this.pvt.dbCollection[proxy.guid] = dbInfo;
			},			
	
			init: function(){
				this.pvt = {};
				this.pvt.dbCollection = {};
			},
			
			addRemote: function(proxy) {
				this._attachRemoteDataBase(proxy);
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
            _subscribe: function(db) {
				var p=db.getProxyMaster();
				if (p.kind == "remote")
					db.getConnection().send({action:'subscribe', guid:db.getGuid()});
				else {
					this.onSubscribe(this.getProxy(db.getGuid()),p.db.getGuid());
				}				
				// TODO обработать асинхронность
            },
			
			// подписать  базу данных с гуидом guid, относящуюся к данному контроллеру
			// db - база данных, которую подписываем
			// proxy - прокси базы, которая подписывается
            onSubscribe: function(proxy,dbGuid) {
				db=this.getDbByGuid(dbGuid);
				db.onSubscribe(proxy);
                /*var db = this.getDbByGuid(proxy.guid);
                if (db)
                    db.getProxyMaster().db.onSubscribe(proxy);*/
            },
			
			// подписать базу db на рутовый элемент с гуидом rootGuid
			subscribeRoot: function(db,rootGuid, callback) {
				var p = db.getProxyMaster();
				if (p.kind = "local") { // мастер-база доступна локально
					var newObj = p.db.onSubscribeRoot(db.getGuid(),rootGuid);
					db.deserialize(newObj);
				}
				else { // мастер-база доступна удаленно
					callback2 = function(newObj) {
						db.deserialize(newObj.data);
					}
					p.connect.send({action:'subscribeRoot', type:'method', dbGuid:db.getGuid(), objGuid:rootGuid},callback2);
					// TODO обработать асинхронность
				}
			},


			
			// отписать либо все базы данного коннекта либо БД с гуидом guid
			onUnsubscribe: function(connect, dbGuid) {
				if (dbGuid==undefined) {
					
				}
				else {
					
				}
			},
			
            getDbByGuid: function(guid){

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



        });
		return MemDBController;
	}
);