﻿if (typeof define !== 'function') {
    var define = require('amdefine')(module);
    var Class = require('class.extend');
}

define(
	[],
	function() {
		var MemCol = Class.extend({
		
			init: function(name,obj){
				this._elems = [];			// массив элементов коллекции
				this._elemsByName = {};
				this._name = name;
				this._obj = obj;
				this._db = obj.getDB();
				obj._addCol(this);
			},
			
			
			// добавить объект в коллекцию
			_add: function(obj) {
				// TODO проверить корректность типа
				this._elems.push(obj);
				// TODO ВРЕМЕННО
				var cname = obj.get("cname");
				if (cname!==undefined)
					this._elemsByName[cname]=this._elems.length-1;
				var fname = obj.get("fname");
				if (fname!==undefined)
					this._elemsByName[fname]=this._elems.length-1;				
				// ВРЕМЕННО КОНЕЦ
			},
			
			getName: function() {
				return this._name;
			},
			
			// вернуть количество элементов коллекции
			count: function() {
				return this._elems.length;
			},
			
			get: function(i) {
				return this._elems[i]; // TODO проверить диапазон
			},
			
			getIdxByName: function(name) {
				return this._elemsByName[name];
			},
			
			getDB: function() {
				return this._db;
			}
			

		});
		return MemCol;
	}
);