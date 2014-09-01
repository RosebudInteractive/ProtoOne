if (typeof define !== 'function') {
    var define = require('amdefine')(module);
    var Class = require('class.extend');
}

define(
	['./memObj'],
	function(MemObject) {
		var MemMetaObjCols = MemObject.extend({
		
			init: function(flds){
			
				this._super(100002,null,flds); // TODO проинициализировать корректно коллекцию
				this._fields.push(flds.name);
				this._fields.push(flds.ctype);
			}
			


		});
		return MemMetaObjCols;
	}
);