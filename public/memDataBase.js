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
		
			init: function(controller, init){
				var pvt = this.pvt = {};
				pvt.name = init.name;
				pvt.robjs = [];				// корневые объекты базы данных
				pvt.log = [];
				pvt.$idCnt = 0;
				pvt.subscribers = {}; 		// все базы-подписчики
								
				if ("master" in init)
					pvt.masterDBGuid = init.master;
				else
					pvt.masterDBGuid = undefined;				

				pvt.controller = controller; //TODO  если контроллер не передан, то ДБ может быть неактивна				
				pvt.controller._attachDataBase(this);				
			},
			
			// Стать подписчиком базы данных
			subscribeDB: function(subProxy) {
				this.pvt.subscribers[subProxy.guid] = subProxy;
				var rootDelta = {};
				// TODO сгенерировать дельту со списком корневых объектов rootDelta и вернуть подписчику
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
					return true;
				}
				else	
					return false;
			},
			
			// Сгенерировать "дельты" по логу изменений
			// (для сервера нужно будет передавать ИД подписчика)
			// возможно, надо сделать отдельный служебный класс для этого функционала
			genDeltas: function() {
				
			},
			
			// применить дельты к БД для синхронизации
			applyDeltas:function(data) {
				
			},
						

		});
		return MemDataBase;
	}
);