if (typeof define !== 'function') {
    var define = require('amdefine')(module);
    var Class = require('class.extend');
}

define(
	['./memProtoObj','./memCol'],
	function(MemProtoObj,MemCol) {
		var MemMetaXObj = MemProtoObj.extend({
		
			init: function(db) {
			
				this._super(null,{ "db": db },null); 
				
				this._collections.push(new MemCol("fields",this));
				this._collections.push(new MemCol("cols",this));
				
				//this._fields.push("fname");
				//this._fields.push("ftype");
				
				/*this._ancestors = [];
				this._ancestors.push(this);
				var parent = flds.parentClass;
				while (parent) {
					this._ancestors.push(parent);
					parent = parent.getParentClass();
				}*/
				
			}
			

		});
		return MemMetaXObj;
	}
);