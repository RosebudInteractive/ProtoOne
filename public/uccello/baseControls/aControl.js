if (typeof define !== 'function') {
    var define = require('amdefine')(module);
    var Class = require('class.extend');
}



define(
	['../baseControls/aComponent'],
	function(AComponent) {
		var AControl = AComponent.extend({
		
			className: "AControl",
			classGuid: "c576cb6e-cdbc-50f4-91d1-4dc3b48b0b59",
            metaFields: [ {fname:"Top",ftype:"int"}, {fname:"Left",ftype:"int"} ],
				
			init: function(cm,objGuid){
				this._super(cm,objGuid);
			}


		});
		return AControl;
	}
);