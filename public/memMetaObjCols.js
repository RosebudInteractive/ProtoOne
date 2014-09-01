if (typeof define !== 'function') {
    var define = require('amdefine')(module);
    var Class = require('class.extend');
}

define(
	['./memProtoObj'],
	function(MemProtoObj) {
		var MemMetaObjCols = MemProtoObj.extend({
		
			init: function(parent, flds){
			
				this._super(100002,parent); 
				this._fields.push(flds.name);
				this._fields.push(flds.ctype);
			}
			


		});
		return MemMetaObjCols;
	}
);