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
			
			getName: function() {
				return this._name;
			},
			
			_addRoot: function(obj) {
				this._robjs.push(obj);
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