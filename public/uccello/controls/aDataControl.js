if (typeof define !== 'function') {
    var define = require('amdefine')(module);
    var Class = require('class.extend');
}

define(
	['./aControl'],
	function(AControl) {
		var ADataControl = AControl.extend({
		
			className: "ADataControl",
			classGuid: "b2c132fd-c6bc-b3c7-d149-27a926916216",
            metaFields: [],
				
			init: function(cm,params){
				this._super(cm,params);
			}
		});
		return ADataControl;
	}
);