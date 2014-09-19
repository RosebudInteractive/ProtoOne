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
			},
			
		
			init: function(){
				this.dbCollection = [];
			},
			
			guid: function () {
			
				function s4() {
				  return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
				};
				
					return s4() + s4() +'-'+ s4()  +'-'+ s4() +'-'+
						 s4() +'-'+ s4() + s4() + s4();
			},
			
			
			// создать новую базу данных в данном контроллере
			newDataBase: function(init) {
				return  new MemDataBase(this,init);
			},

            subscribeTo: function(db, connect, guid) {
                connect.send({action:'subscribe', guid:guid});
            },

            getDbByGiud: function(guid){

                // поиск по гуиду
                for(var i, len=this.dbCollection.length; i<len; i++)
                    if (this.dbCollection[i].getGuid() == guid)
                        return this.dbCollection[i];

                // первую
                if (this.dbCollection.length > 0)
                    return this.dbCollection[0];

                return null;
            },

            onSubscribe: function(connect, guid) {
                var db = this.getDbByGiud(guid);
                if (db)
                    db.subscribe({connect:connect, guid:guid});
            }

        });
		return MemDBController;
	}
);