if (typeof define !== 'function') {
    var define = require('amdefine')(module);
    var Class = require('class.extend');
}

define(
	[],
	function() {
		var MemProtoObj = Class.extend({
			_objType: null,	
			_parent: null,
			_col: null,
			_db: null,
				
			// objType - ссылка на объект-тип
			// parent - ссылка на объект и имя коллекции либо db, null для корневых  (obj и colname)
			init: function(objType, parent){
				this._objType = objType;
				this._fields = [];			// значения полей объекта
				this._collections = [];		// массив дочерних коллекций
				
										
			},
			
			
			addChild: function(colName,obj) {
				
			},
			
			
			get: function(field) {
				//this._objType.getCol(
				//var 
				//this._fields[i];
			},
			
			getDB: function() {
				if (!this._col) return this._db;
				else return this._col.getDB();
			}
			
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