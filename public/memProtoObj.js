if (typeof define !== 'function') {
    var define = require('amdefine')(module);
    var Class = require('class.extend');
}

define(
	[],
	function() {
		var MemProtoObj = Class.extend({
			_objTypeId: 0,
			_objType: null,
			_fields: [],		// значения полей объекта
			_collections: [],	// массив дочерних коллекций
			_parent: null,
			_col: null,
		
				
			// objTypeId - идентификатор типа объекта ( или ссылка на объект-тип ?)
			// parent - ссылка на объект и имя коллекции либо db, null для корневых  (obj и colname)
			// flds - значения полей
			init: function(objTypeId, parent, flds){
				this._objTypeId = objTypeId;

				if (!parent.obj) {	// корневой объект
					this._db = parent.db;
					this._db._addRoot(this);					
				}
				else { 						// объект в коллекции (не корневой)
					this._col = parent.obj.getCol(parent.colname);
					this._parent = parent.obj;
					this._col._add(this);
				}
				// TODO создать коллекции в наследнике memTypedObj
								
			},
			
			// получить коллекцию по
			/*getCol: function(col) {
				if (typeof col == "number")
					return this._collections[col]; 
				else 
					return this._collections[this._objType.getCol(2).getObjIdx(col)];
			},
			*/
			

		});
		return MemProtoObj;
	}
);