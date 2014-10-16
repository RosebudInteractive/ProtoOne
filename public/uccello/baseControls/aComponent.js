if (typeof define !== 'function') {
    var define = require('amdefine')(module);
    var Class = require('class.extend');
}

define(
    ['../memDB/memMetaObj', '../memDB/memMetaObjFields','../memDB/memMetaObjCols'],
    function(MemMetaObj, MemMetaObjFields, MemMetaObjCols) {
        var AComponent = Class.extend({
		
			className: "AComponent",
			classGuid: "5b8c93e7-350d-de2a-e2b4-1025a03b17db",
			metaFields: [ {fname:"Id",ftype:"int"}, {fname:"Name",ftype:"string"} ], // TODO? гуиды для полей?
			metaCols: [],

            init: function(db){
				this._buildMetaInfo(db);
            },

            /**
             * Cоздает метаинформацию своего класса в базе данных db
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
                    for (i=0; i<this.metaCols.length; i++)
                        new MemMetaObjCols({"obj": c}, {fields: this.metaCols[i]});
					db._buildMetaTables();
                }
            }
			
        });
        return AComponent;
    }
);