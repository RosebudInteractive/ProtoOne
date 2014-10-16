if (typeof define !== 'function') {
    var define = require('amdefine')(module);
    var Class = require('class.extend');
}



define(
	['uccello/baseControls/aComponent'],
	function(AComponent) {
		var AControl = AComponent.extend({
		
			className: "AControl",
			classGuid: "c576cb6e-cdbc-50f4-91d1-4dc3b48b0b59",
				
			init: function(db){
				this._super(db);
			}
						

		});
		return AControl;
	}
);