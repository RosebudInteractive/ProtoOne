if (typeof define !== 'function') {
    var define = require('amdefine')(module);
    var Class = require('class.extend');
}

define(
    ['../memDB/memMetaObj', '../memDB/memMetaObjFields'],
    function(MemMetaObj, MemMetaObjFields) {
        var AComponent = Class.extend({
		
			className: "AComponent",
<<<<<<< HEAD
			classGuid: "5b8c93e7-350d-de2a-e2b4-1025a03b17db",
			metaFields: [ {fname:"Id",ftype:"int"}, {fname:"Name",ftype:"string"} ], // TODO? гуиды для полей?
	
            init: function(db){
				this._buildMetaInfo(db);
            },
			
=======
			classGuid: "",
		


            init: function(){
				
                //this.typeName = "Control";
            }
        }, {

            metaFields: [ {fname:"Id",ftype:"int"}, {fname:"Name",ftype:"string"} ],

>>>>>>> origin/master
            /**
             * Cоздает метаинформацию своего класса в базе данных db
             * @static
             * @param db
             */
            _buildMetaInfo: function(db){
                if (!db.getObj(this.classGuid)) {
					var obj = Object.getPrototypeOf(this), pobj=null;
					if (obj.className != "AComponent")
						pobj = db.getObj(Object.getPrototypeOf(obj).classGuid);
					//var obj2 = Object.getPrototypeOf(obj);
					// TODO parentClass передавать гуидом либо именем.
                    var c =  new MemMetaObj({db: db}, {fields: {typeName: this.className, parentClass: pobj},$sys: {guid: this.classGuid}});
                    for (var i=0; i<this.metaFields.length; i++)
                        new MemMetaObjFields({"obj": c}, {fields: this.metaFields[i]});
                }
            }
			
        });
        return AComponent;
    }
);