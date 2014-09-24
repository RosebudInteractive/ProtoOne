if (typeof define !== 'function') {
    var define = require('amdefine')(module);
    var Class = require('class.extend');
}

define(
	['./memProtoObj','./memCol'],
	function(MemProtoObj,MemCol) {
		var MemMetaField = MemProtoObj.extend({
		
			init: function(db) {
			
				this._super(null,{ "db": db }, null); 
				
				var myCol = new MemCol("fields",this);
				this._collections.push(myCol);
				
				myCol._add();
				myCol._add();
				//this._fields.push("fname");
				//this._fields.push("ftype");
				
				/*this._ancestors = [];
				this._ancestors.push(this);
				var parent = flds.parentClass;
				while (parent) {
					this._ancestors.push(parent);
					parent = parent.getParentClass();
				}*/
				
			},
			
			// вернуть количество полей
			count: function() {
				return 2;
			},
										
			// вернуть поле по имени
			get: function(field) {
				if (field=="fname") return "string";
				if (field=="ftype") return "string";
				return undefined;
			}
			

		});
		return MemMetaField;
	}
);