if (typeof define !== 'function') {
    var define = require('amdefine')(module);
    var Class = require('class.extend');
}

define(
    ['../memDB/memMetaObj', '../memDB/memMetaObjFields'],
    function(MemMetaObj, MemMetaObjFields) {
        var AComponent = Class.extend({
		
			className: "AComponent",
			classGuid: "",
		
			metaFields: [ {fname:"Id",ftype:"int"}, {fname:"Name",ftype:"string"} ],

            init: function(){
				
                //this.typeName = "Control";
            },

            /**
             * Cоздает метаинформацию своего класса в базе данных db
             * @param db
             */
            buildMetaInfo: function(db){
                if (!db.getObj(this.classGuid)) {
                    var c =  new MemMetaObj({db: db}, {fields: {typeName: this.className, parentClass: null}});
					for (var i=0; i<this.metaFields.length; i++)
						new MemMetaObjFields({"obj": c}, {fields: this.metaFields[i]});
				}
            }
        });
        return AComponent;
    }
);