if (typeof define !== 'function') {
    var define = require('amdefine')(module);
    var Class = require('class.extend');
}

define(
	['./memProtoObj'],
	function(MemProtoObj) {
		var MemObj = MemProtoObj.extend({

			init: function(objTypeId, parent, flds){
				this._super(objTypeId, parent, flds);
				/*
				this._objTypeId = objTypeId;

				if (!parent.obj) {			// корневой объект
					this._db = parent.db;
					this._db._addRoot(this);					
				}
				else { 						// объект в коллекции (не корневой)
					this._col = parent.obj.getCol(parent.colname);
					this._parent = parent.obj;
					this._col._add(this);
				}
				// TODO создать коллекции в наследнике memTypedObj
				*/			
			},
			
			// получить коллекцию по
			getCol: function(col) {
				if (typeof col == "number")
					return this._collections[col]; 
				else 
					return this._collections[this._objType.getCol(2).getObjIdx(col)];
			},
			
			

		});
		return MemObj;
	}
);