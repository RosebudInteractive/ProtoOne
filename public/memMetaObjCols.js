﻿if (typeof define !== 'function') {
    var define = require('amdefine')(module);
    var Class = require('class.extend');
}

define(
	['./memProtoObj'],
	function(MemProtoObj) {
		var MemMetaObjCols = MemProtoObj.extend({
		
			init: function(parent, flds){
				this._super(null,{obj : parent.obj, colName : "cols" },flds ); 			
				//this._super(null,parent); 
				this.pvt.fields.push(flds.fields.cname);
				this.pvt.fields.push(flds.fields.ctype);
				this.finit();
				
				/*this.pvt.col = parent.obj.getCol("cols");
				this.pvt.parent = parent.obj;
				this.pvt.col._add(this);*/
				
			},
			
			// ПОЛЯ
			
			get: function(field) {

				if (typeof field == "string") { // ищем по имени			
					if (field=="cname") return this.pvt.fields[0];
					if (field=="ctype") return this.pvt.fields[1];
				}
				
				if (typeof field == "number")  // ищем по индексу
					return this._super(field);
			},
			
			// получить имя поля по индексу
			getFieldName: function(i) {
				if (i==0) return "cname";
				if (i==1) return "ctype";
			},			
			


		});
		return MemMetaObjCols;
	}
);