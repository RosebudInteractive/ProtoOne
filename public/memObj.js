if (typeof define !== 'function') {
    var define = require('amdefine')(module);
    var Class = require('class.extend');
}

define(
	['./memProtoObj'],
	function(MemProtoObj) {
		var MemObj = MemProtoObj.extend({

			init: function(objType, parent, flds){
				this._super(objType, parent);
				
				// заполнить поля по метаинформации
				//var fcol = this._objType.getCol("fields");
				//this._fields[fcol.count()-1]=null;
				for (var f in flds) {
					var i=this._objType._fieldsTable[f].cidx;
					if (i>=0) this._fields[i] = flds[f]; // TODO проверять типы?
					//var i=fcol.getIdxByName(f);
					//if (i>=0) this._fields[i] = flds[f]; // TODO проверять типы?
				}

				// TODO создать коллекции 

				/* перенесли в прото
				if (!parent.obj) {	// корневой объект
					this._db = parent.db;
					this._db._addRoot(this);					
				}
				else { 				// объект в коллекции (не корневой)
					this._col = parent.obj.getCol(parent.colName);
					this._parent = parent.obj;
					this._col._add(this);
				}
				*/

				
				
			},
			
			// получить коллекцию по имени
			getChildCol: function(colName) {
				var i=this._objType.getCol("cols").getIdxByName(colName);
				return this._collections[i];				
				//return this._collections[this._objType.getCol(2).getObjIdx(col)];
			},
			
			get: function(field) {
				var i=this._objType._fieldsTable[field].cidx;
				//this._objType.getCol("fields").getIdxByName(field);
				return this._fields[i];
			},
			
			set: function(field,value) {
				var i=this._objType._fieldsTable[field].cidx;
				var oldValue = this._fields[i];
				this._fields[i] = value;
				if (this.getLog().getActive()) 
					this.getLog()._objModif({"property":field,"oldValue":oldValue,"newValue":value, "target":this});
			}
			
			

		});
		return MemObj;
	}
);