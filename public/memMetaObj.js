if (typeof define !== 'function') {
    var define = require('amdefine')(module);
    var Class = require('class.extend');
}

define(
	['./memProtoObj','./memCol'],
	function(MemProtoObj,MemCol) {
		var MemMetaObj = MemProtoObj.extend({
		
			init: function(db, flds){
			
				this._super(100000,{ "db": db },flds); // TODO проинициализировать корректно коллекцию
				this._fields.push(flds.typeName); // TODO проверка наличия с пустой инициализацией
				this._fields.push(flds.ancestor);
				
				// инициализируем коллекции для метаинфо - описание полей и описание коллекций
				this._collections.push(new MemCol("fields",this));
				this._collections.push(new MemCol("cols",this));
				
			},
			
			// получить коллекцию по имени
			getCol: function(col) {
				if (col == "fields")
					return this._collections[0]; 
				if (col == "cols")
					return this._collections[1];
			},
			

		});
		return MemMetaObj;
	}
);