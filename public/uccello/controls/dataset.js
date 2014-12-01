if (typeof define !== 'function') {
    var define = require('amdefine')(module);
    var Class = require('class.extend');
}



define(
	['./aComponent'],
	function(AComponent) {
		var Dataset = AComponent.extend({
		
			className: "Dataset",
			classGuid: "f116cb6e-cdbc-50f4-91d1-4dc3b48b0b59", // todo сгенерировать новый
            metaFields: [ {fname:"Dataobject",ftype:"string"}, {fname:"Cursor",ftype:"number"}],
				
			init: function(cm,params){
				this._super(cm,params);
			},

            dataobject: function(value) {
                return this._genericSetter("Dataobject", value);
            },
			
			cursor: function(value) {
				return this._genericSetter("Dataobject", value);
			}
			
		});
		return AControl;
	}
);