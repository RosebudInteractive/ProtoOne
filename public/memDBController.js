if (typeof define !== 'function') {
    var define = require('amdefine')(module);
    var Class = require('class.extend');
}

define(
	['./memDataBase'],
	function(MemDataBase) {
		var MemDBController = Class.extend({

			_attachDataBase: function(db) {
				this.dbCollection.push(db);
			}
			
		
			init: function(){
				this.dbCollection = [];
				
			},
			
			// создать новую базу данных в данном контроллере
			newDataBase: function(init) {
				var db = new MemDataBase(this,init);
			}



		});
		return MemDBController;
	}
);