﻿if (typeof define !== 'function') {
    var define = require('amdefine')(module);
    var Class = require('class.extend');
}

define(
	["./memCol", "./memObj"],
	function(MemCollection,MemObj) {
		var MemDataBase = Class.extend({

			// Добавить корневой объект в БД
			_addRoot: function(obj,mode) {
				var root = {};
				root.obj = obj;
				root.mode = mode;
				root.subscribers = {};	// подписчики корневого объекта
				root.master = null;		// мастер
				this.pvt.robjs.push(root);
				this.pvt.rcoll[obj.getGuid()] = root;
			},

			// params.kind - "master" - значит мастер-база, другое значение - подчиненная база
			// params.local - true, тогда мастер-база локальная и masterConnect не передается
			// params.masterGuid - гуид мастер-базы
			// params.masterConnection - коннект к серверу с мастер-базой
			init: function(controller, params){
				var pvt = this.pvt = {};
				pvt.name = params.name;
				pvt.robjs = [];				// корневые объекты базы данных
				pvt.rcoll = {};
				pvt.log = [];
				pvt.$idCnt = 0;
				pvt.subscribers = {}; 		// все базы-подписчики
                pvt.guid = controller.guid();
							
				if (params.kind != "master") {
						pvt.masterGuid = params.masterGuid;
						if (params.local) {
							// TODO найти базу по гуиду через контроллер
							pvt.masterGuid = params.masterGuid;
							pvt.masterDB = controller.getDbByGuid(params.masterGuid);
						}
						else {
							pvt.masterGuid = params.masterGuid;
							pvt.masterConnection = params.masterConnection;
                            controller._subscribe(this);
                        }
					}
				else
					pvt.masterGuid = undefined;				

				pvt.controller = controller; //TODO  если контроллер не передан, то ДБ может быть неактивна				
				pvt.controller._attachDataBase(this);				
			},
			
			// Стать подписчиком базы данных
			subscribe: function(subProxy) {
				this.pvt.subscribers[subProxy.guid] = subProxy;
			},
			
			// Стать подписчиком корневого объекта с гуидом rootGuid
			onSubscribeRoot: function(subProxy, rootGuid) {
				// TODO проверить что база подписана на базу
				var obj = null;
				if (this.pvt.robjs.length > 0) 
					obj = this.pvt.rcoll[rootGuid].obj; // ВРЕМЕННО

				if (!obj) return null;
				
				// добавляем подписчика
				var g = (subProxy.dataBase) ? subProxy.dataBase.getGuid() : subProxy.guid;
				this.pvt.rcoll[rootGuid].subscribers[g] = subProxy;  // TODO из списка общих подписчиков
				
				return this.serialize(obj);
				/*
				var newObj = {};
				newObj.$sys = {};
				newObj.$sys.guid = obj.getGuid();
				newObj.$sys.typeGuid = obj.getObjType().getGuid();
				for (var i=0; i<obj.count(); i++) 
					newObj[obj.getFieldName(i)] = obj.get(i);		
				
				return newObj;
				*/
			},
			
			// сериализация объекта базы
			serialize: function(obj) {
				if (!("getDB" in) || (obj.getDB()!=this)) return null;
				
				var newObj = {};
				newObj.$sys = {};
				newObj.$sys.guid = obj.getGuid();
				newObj.$sys.typeGuid = obj.getObjType().getGuid();
				// поля
				newObj.fields = {};
				for (var i=0; i<obj.count(); i++) 
					newObj.fields[obj.getFieldName(i)] = obj.get(i);		
				// коллекции
				newObj.collections = {};
				// TODO сделать то же с коллекциями
					
				return newObj;				
				
			},
			
			// подписаться у мастер-базы на корневой объект, идентифицированный гуидом rootGuid
			// методы вызывается у подчиненной базы.
			subscribeRoot: function(rootGuid) {
				this.pvt.controller.subscribeRoot(this,rootGuid);
			},
			
			// создать подписанный рутовый объект (временный вариант)
			importRoot: function(flds) {
				// TODO пока предполагаем что такого объекта нет, но если он есть что делаем?	
				var typeObj = this.getRoot(flds.$sys.typeGuid).obj;
				var o = new MemObj( typeObj,{"db":this, "mode":"RW"},flds);
				return o;
			},
			
			// вернуть ссылку на контроллер базы данных
			getController: function() {
				return this.pvt.controller;
			},
			
			getConnection: function() {
				return this.pvt.masterConnection;
			},
			
			// Вернуть название БД
			getName: function() {
				return this.pvt.name;
			},
			
			// вернуть корневой объект по его Lid
			getRoot: function(guid) {
				return this.pvt.rcoll[guid];
			},
			
			// Является ли мастер базой
			isMaster: function() {
				if (this.pvt.masterDBGuid == undefined)
					return true;
				else
					return false;
			},
			
			// вернуть мастер-базу если локальна
			getMaster: function() {
				return this.pvt.masterDB;
			},
			
            /**
             * Получить следующий local id
             * @returns {number}
             */
			getNewLid: function() {  // TODO сделать DataBaseController и перенести туда?
				return this.pvt.$idCnt++;
			},
			
			// добавить новый корневой объект в мастер-базу
			newRootObj: function(objType,flds) {
				if (this.isMaster()) {
					var obj = new MemObj( objType,{"db":this, "mode":"RW"},flds);
					return obj;
				}
				else	
					return null;
			},
			
			// Сгенерировать "дельты" по логу изменений
			// (для сервера нужно будет передавать ИД подписчика)
			// возможно, надо сделать отдельный служебный класс для этого функционала
			genDeltas: function() {
				
			},
			
			// применить дельты к БД для синхронизации
			applyDeltas:function(data) {
				
			},

            // получить guid
            getGuid: function() {
                return this.pvt.guid;
            }

        });
		return MemDataBase;
	}
);