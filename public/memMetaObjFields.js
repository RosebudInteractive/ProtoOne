if (typeof define !== 'function') {
    var define = require('amdefine')(module);
    var Class = require('class.extend');
}

define(
	['./memObj'],
	function(MemObject) {
		var MemMetaObjFields = MemObject.extend({
		
			init: function(flds){
			
				this._super(100001,null,flds); // TODO проинициализировать корректно коллекцию
				this._fields.push(flds.name);
				this._fields.push(flds.ftype);
				
				//this._fields. // TODO проверка наличия с пустой инициализацией
			}
			

		});
		return MemMetaObjFields;
	}
);