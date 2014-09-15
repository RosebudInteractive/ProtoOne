if (typeof define !== 'function') {
    var define = require('amdefine')(module);
    var Class = require('class.extend');
}

define(
	["./memCol", "./memObj"],
	function(MemCollection,MemObject) {
		var MemDataBase = Class.extend({

			// Добавить корневой объект в БД
			_addRoot: function(obj,mode) {
				var root = {};
				root.obj = obj;
				root.mode = mode; 
				this.pvt.robjs.push(root);
			},
		
			init: function(controller, init){
				var pvt = this.pvt = {};
				pvt.name = init.name;
				pvt.robjs = [];	// корневые объекты базы данных
				pvt.log = [];
				pvt.$idCnt = 0;
								
				if ("master" in init)
					pvt.masterDBGuid = init.master;
				else
					pvt.masterDBGuid = undefined;				

				pvt.controller = controller; //TODO  если контроллер не передан, то ДБ может быть неактивна				
				pvt.controller._attachDataBase(this);				
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
			
			// добавить новый объект в корень
			newRootObj: function(obj) {
				if (this.isMaster()) {
					
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