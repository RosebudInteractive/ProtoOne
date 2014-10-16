﻿if (typeof define !== 'function') {
    var define = require('amdefine')(module);
    var Class = require('class.extend');
}

define(
	['../memDB/memProtoObj','../memDB/memCol'],
	function(MemProtoObj,MemCol) {
		var MemObj = MemProtoObj.extend({

			init: function(objType, parent, flds){
				this._super(objType, parent, flds);
				
				// заполнить поля по метаинформации
				for (var f in flds.fields) {
						var i=this.pvt.objType.pvt.fieldsTable[f].cidx;
						if (i>=0) this.pvt.fields[i] = flds.fields[f]; // TODO проверять типы?
				}
				// создать пустые коллекции по типу
				var ccol = objType.getCol("cols");
				for (var i=0; i<ccol.count(); i++) {
					new MemCol(ccol.get(i).get("cname"),this);
				}
				
				this.finit();
			},
			
			// получить коллекцию по имени или по индексу
			getCol: function(col) {
				if (typeof col == "string") {
					var i=this.pvt.objType.getCol("cols").getIdxByName(col);
					return this.pvt.collections[i];
				}
				if (typeof col == "number") 
					return this._super(col);
				return null;
			},
			
			
			// получить значение поля по имени или по названию
			get: function(field) {
				if (typeof field == "string") { // ищем по имени
					if (this.pvt.objType.pvt.fieldsTable[field]=== undefined)
						return undefined;
					var i=this.pvt.objType.pvt.fieldsTable[field].cidx;
					return this.pvt.fields[i];
				}
				if (typeof field == "number")  // ищем по индексу
					return this._super(field);
					
				return undefined;				
			},
			
			set: function(field,value) {
				var i=this.pvt.objType.pvt.fieldsTable[field].cidx;
				var oldValue = this.pvt.fields[i];
				this.pvt.fields[i] = value;
				if (this.getLog().getActive()) {
					var o = { "flds": {}, "obj":this, "type":"mp"};
					o.flds[field] = {"old":oldValue,"new":value};
					this.getLog().add(o);
				}
					//this.getLog()._objModif(field, {"oldValue":oldValue,"newValue":value, "target":this});
			},
						
			// получить имя поля по индексу
			getFieldName: function(i) {
				return this.pvt.objType.pvt.fieldsArr[i];
			},
			
			// добавить объект obj в коллекцию colName
			addToCol: function(colName,obj) {
				var c = this.getCol(colName);
				if (c) {
					c.add(obj);
					return true;
				}
				else
					return false;
			}
			
			

		});
		return MemObj;
	}
);