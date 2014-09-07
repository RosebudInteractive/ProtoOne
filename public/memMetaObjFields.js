if (typeof define !== 'function') {
    var define = require('amdefine')(module);
    var Class = require('class.extend');
}

define(
	['./memProtoObj'],
	function(MemProtoObj) {
		var MemMetaObjFields = MemProtoObj.extend({
		
			init: function(parent, flds){
			
				this._super(null,parent); 
				this._fields.push(flds.fname);
				this._fields.push(flds.ftype);

				this._col = parent.obj.getCol(parent.colName);
				this._parent = parent.obj;
				this._col._add(this);
				
			},
			
			get: function(name) {
				if (name=="fname") return this._fields[0];
				// TODO другие поля тоже
			}
			

		});
		return MemMetaObjFields;
	}
);