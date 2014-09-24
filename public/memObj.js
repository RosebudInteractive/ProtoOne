if (typeof define !== 'function') {
    var define = require('amdefine')(module);
    var Class = require('class.extend');
}

define(
	['./memProtoObj'],
	function(MemProtoObj) {
		var MemObj = MemProtoObj.extend({

			init: function(objType, parent, flds){
				this._super(objType, parent, flds);
				
				// заполнить поля по метаинформации
				//var fcol = this._objType.getCol("fields");
				//this._fields[fcol.count()-1]=null;
				for (var f in flds) {
					var i=this._objType._fieldsTable[f].cidx;
					if (i>=0) this._fields[i] = flds[f]; // TODO проверять типы?
				}
				// TODO создать коллекции 
			},
			
			// получить коллекцию по имени
			getChildCol: function(colName) {
				var i=this._objType.getCol("cols").getIdxByName(colName);
				return this._collections[i];				
				//return this._collections[this._objType.getCol(2).getObjIdx(col)];
			},
			
			
			// получить значение поля по имени или по названию
			get: function(field) {
				if (typeof field == "string") { // ищем по имени
					var i=this._objType._fieldsTable[field].cidx;
					return this._fields[i];
				}
				if (typeof field == "number") { // ищем по индексу
					return this._fields[field];
				}	
				return undefined;				
			},
			
			set: function(field,value) {
				var i=this._objType._fieldsTable[field].cidx;
				var oldValue = this._fields[i];
				this._fields[i] = value;
				if (this.getLog().getActive()) 
					this.getLog()._objModif({"property":field,"oldValue":oldValue,"newValue":value, "target":this});
			},
			
			// вернуть количество полей объекта
			count: function() {
				return this._fields.length;
			},
			
			getFieldName: function(i) {
				return this._objType._fieldsArr[i];
			}
			
			

		});
		return MemObj;
	}
);