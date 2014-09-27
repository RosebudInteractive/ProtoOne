if (typeof define !== 'function') {
    var define = require('amdefine')(module);
    var Class = require('class.extend');
}

define(
	['./memProtoObj'],
	function(MemProtoObj) {
		var MemMetaObjFields = MemProtoObj.extend({
		
			init: function(parent, flds){
				this._super(null,parent); 
				this.pvt.fields.push(flds.fname);
				this.pvt.fields.push(flds.ftype);

			},
			
			get: function(name) {
				if (name=="fname") return this.pvt.fields[0];
				// TODO другие поля тоже
			}
			

		});
		return MemMetaObjFields;
	}
);