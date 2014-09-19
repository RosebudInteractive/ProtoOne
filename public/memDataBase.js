if (typeof define !== 'function') {
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
				root.subscribers = [];	// подписчики корневых объектов
				this.pvt.robjs.push(root);
			},

			// params.kind - "master" - значит мастер-база, другое значение - подчиненная база
			// params.local - true, тогда мастер-база локальная и masterConnect не передается
			// params.masterGuid - гуид мастер-базы
			// params.masterConnection - коннект к серверу с мастер-базой
			init: function(controller, params){
				var pvt = this.pvt = {};
				pvt.name = params.name;
				pvt.robjs = [];				// корневые объекты базы данных
				pvt.log = [];
				pvt.$idCnt = 0;
				pvt.subscribers = {}; 		// все базы-подписчики
								
				if (params.kind != "master") {
						pvt.masterGuid = params.masterGuid;
						if (params.local) {
							// TODO найти базу по гуиду через контроллер
						}
						else {
							pvt.masterGuid = params.masterGuid;
							pvt.masterConnection = params.masterConnection;
                            this.setGuid(controller.guid());
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
				var rootDelta = {};
				// TODO сгенерировать дельту со списком корневых объектов rootDelta и вернуть подписчику
				// А вообще-то наверное не надо - пусть запрашивает их явно если нужно
				return rootDelta;
			},
			
			// Стать подписчиком корневого объекта
			subscribeRoot: function(subProxy, rootGuid) {
				var obj = {};
				// TODO подписаться на корневой объект и вернуть его
				return obj;
			},
			
			// вернуть ссылку на контроллер базы данных
			getController: function() {
				return this.pvt.controller;
			},
			
			// Вернуть название БД
			getName: function() {
				return this.pvt.name;
			},
			
			// Является ли мастер базой
			isMaster: function() {
				if (this.pvt.masterDBGuid == undefined)
					return true;
				else
					return false;
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

            // запрос guid
            getGuid: function() {
                return this.guid;
            },

            // установить guid
            setGuid: function(guid) {
                this.guid = guid;
            }



        });
		return MemDataBase;
	}
);