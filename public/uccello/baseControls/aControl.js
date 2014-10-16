if (typeof define !== 'function') {
    var define = require('amdefine')(module);
    var Class = require('class.extend');
}



define(
	['uccello/baseControls/aComponent'],
	function(AComponent) {
		var AControl = AComponent.extend({
				
			init: function(){										
			}
						

		});
		return AControl;
	}
);