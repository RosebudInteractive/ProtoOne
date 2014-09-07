if (typeof define !== 'function') {
    var define = require('amdefine')(module);
    var Class = require('class.extend');
}

define(
	['./memProtoObj'],
	function(MemProtoObj) {
		var MemMetaObjCols = MemProtoObj.extend({
		
			init: function(parent, flds){
			
				this._super(null,parent); 
				this._fields.push(flds.cname);
				this._fields.push(flds.ctype);
				
				this._col = parent.obj.getCol(parent.colName);
				this._parent = parent.obj;
				this._col._add(this);
				
			},
			
			get: function(name) {
				if (name=="cname") return this._fields[0];
				// TODO другие поля тоже
			}
			
			
			


		});
		return MemMetaObjCols;
	}
);