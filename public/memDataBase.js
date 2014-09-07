if (typeof define !== 'function') {
    var define = require('amdefine')(module);
    var Class = require('class.extend');
}

define(
	["./memCol", "./memObj"],
	function(MemCollection,MemObject) {
		var MemDataBase = Class.extend({
		
			log: [],
			_robjs: [],
		
			init: function(name){
				this._name = name;
				
				
				
			},
			
			// Вернуть название БД
			getName: function() {
				return this._name;
			},
			
			// Добавить корневой объект в БД
			_addRoot: function(obj) {
				this._robjs.push(obj);
			},
			
			// Сгенерировать "дельты" по логу изменений
			// (для сервера нужно будет передавать ИД подписчика)
			// возможно, надо сделать отдельный служебный класс для этого функционала
			genDeltas: function() {
				
			},
			
			// применить дельты к БД для синхронизации
			applyDeltas:function(data) {
				
			},
			
			
			/*
			// новая коллекция
			newCol: function() {
				return new MemCollection("POPO",this);
			},
			
			// удалить коллекцию
			delCol: function() {
			}*/
			
			

		});
		return MemDataBase;
	}
);