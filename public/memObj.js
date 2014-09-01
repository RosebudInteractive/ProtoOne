if (typeof define !== 'function') {
    var define = require('amdefine')(module);
    var Class = require('class.extend');
}

define(
	['./memProtoObj'],
	function(MemProtoObj) {
		var MemObj = MemProtoObj.extend({

			init: function(objTypeId, parent, flds){
				this._super(objTypeId, parent);

				// TODO создать коллекции 
				// TODO заполнить поля
					
			},
			
			// получить коллекцию по имени
			getCol: function(col) {
				/*if (typeof col == "number")
					return this._collections[col]; 
				else 
					return this._collections[this._objType.getCol(2).getObjIdx(col)];*/
			},
			
			

		});
		return MemObj;
	}
);