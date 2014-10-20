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

            /**
             * @constructs
             * @param {ControlMgr} cm - менеджер контролов, к которому привязан данный контрол
			 * @param memObj
             */
            init: function(cm, objGuid){
				this.pvt = {};
				this.pvt.controlMgr = cm;
				this._buildMetaInfo(cm.getDB());
				if (objGuid!==undefined) {
					this.pvt.obj = cm.getDB().getObj(objGuid);
					cm.add(this);
					}
				else {
					// TODO создать пустой объект
				}
				
            },

            /**
             * Cоздает метаинформацию своего класса в базе данных db
             * @param db
             */
            _buildMetaInfo: function(db){
                if (!db.getObj(this.classGuid)) {
					var obj = Object.getPrototypeOf(this), gobj="";
					if (obj.className != "AComponent")
						gobj = db.getObj(Object.getPrototypeOf(obj).classGuid).getGuid();
					//var obj2 = Object.getPrototypeOf(obj);
					// TODO parentClass передавать гуидом либо именем.
                    var c =  new MemMetaObj({db: db}, {fields: {typeName: this.className, parentClass: gobj},$sys: {guid: this.classGuid}});
                    for (var i=0; i<this.metaFields.length; i++)
                        new MemMetaObjFields({"obj": c}, {fields: this.metaFields[i]});
                    for (i=0; i<this.metaCols.length; i++)
                        new MemMetaObjCols({"obj": c}, {fields: this.metaCols[i]});
					db._buildMetaTables();
                }
            },

            /**
             * Возвращает локальный идентификатор
             */			
			getLid: function() {
				return this.pvt.obj.getLid();
				
			},
			
			getGuid: function() {
				return this.pvt.obj.getGuid();
			},
			
			getClassGuid: function() {
				return this.classGuid;
			},
			
			getClassName: function() {
				return this.className;
			},			
					
			getObj: function() {
				return this.pvt.obj;
			},
			
			getControlMgr: function() {	
				return this.pvt.controlMgr;
			},
			
			// метаинформация (properties)
			
			countProps: function() {
				return this.metaFields.length;
			},
			
			getPropName: function(i) {
			if (i>=0 && i<this.metaFields.length)
				return this.metaFields[i].fname;
			},
			
			getPropType: function(i) {
			if (i>=0 && i<this.metaFields.length)
				return this.metaFields[i].ftype;
			}

			
        });
        return AComponent;
    }
);