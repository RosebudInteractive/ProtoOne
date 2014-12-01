if (typeof define !== 'function') {
    var define = require('amdefine')(module);
    var Class = require('class.extend');
}

define(
	[],
	function() {
		var Dataman = Class.extend({

			init: function(router){
				this.pvt = {};
				this.pvt.router = router;
				var that = this;
				router.add('query', function(expr) { return that.query(expr); });
			},


            query: function(expr) {
				var result = {};

            }


		});
		return Dataman;
	}
);