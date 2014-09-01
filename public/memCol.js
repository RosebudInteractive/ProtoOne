if (typeof define !== 'function') {
    var define = require('amdefine')(module);
    var Class = require('class.extend');
}

define(
	[],
	function() {
		var MemCol = Class.extend({
		
			_name: null,
			_obj: null,
			_elems: [],		// массив элементов коллекции
		
			init: function(name,obj){
				this._name = name;
				this._obj = obj;
			},
			
			
			// добавить объект в коллекцию
			_add: function(obj) {
				// TODO проверить корректность типа
				this._elems.push(rec);
			},
			

		});
		return MemCol;
	}
);