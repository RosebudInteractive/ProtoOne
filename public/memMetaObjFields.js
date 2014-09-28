if (typeof define !== 'function') {
    var define = require('amdefine')(module);
    var Class = require('class.extend');
}

define(
	['./memProtoObj'],
	function(MemProtoObj) {
		var MemMetaObjFields = MemProtoObj.extend({
		
			init: function(parent, flds){
				this._super(null,{obj : parent.obj, colName : "fields" }, flds ); 
				this.pvt.fields.push(flds.fields.fname);
				this.pvt.fields.push(flds.fields.ftype);
				this.finit();

			},
			
			// ПОЛЯ
			
			get: function(field) {

				if (typeof field == "string") { // ищем по имени			
					if (field=="fname") return this.pvt.fields[0];
					if (field=="ftype") return this.pvt.fields[1];
				}
				
				if (typeof field == "number")  // ищем по индексу
					return this._super(field);
			},
			
			// получить имя поля по индексу
			getFieldName: function(i) {
				if (i==0) return "fname";
				if (i==1) return "ftype";
			},
			

		});
		return MemMetaObjFields;
	}
);