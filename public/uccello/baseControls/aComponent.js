if (typeof define !== 'function') {
    var define = require('amdefine')(module);
    var Class = require('class.extend');
}

define(
    ['../memDB/memMetaObj', '../memDB/memObj', '../memDB/memMetaObjFields','../memDB/memMetaObjCols'],
    function(MemMetaObj, MemObj, MemMetaObjFields, MemMetaObjCols) {
        var AComponent = Class.extend({
		
			className: "AComponent",
			classGuid: "5b8c93e7-350d-de2a-e2b4-1025a03b17db",
			metaFields: [ {fname:"Id",ftype:"int"}, {fname:"Name",ftype:"string"} ], // TODO? гуиды для полей?
			metaCols: [],

            /**
             * @constructs
             * @param cm {ControlMgr} - менеджер контролов, к которому привязан данный контрол
			 * @param params
             */
            init: function(cm, params){
				this.pvt = {};
				this.pvt.controlMgr = cm;
				this._buildMetaInfo(cm.getDB());

				if (params==undefined) return; // в этом режиме только создаем метаинфо
				if (params.objGuid!==undefined) {
					this.pvt.obj = cm.getDB().getObj(params.objGuid);
					//cm.add(this);
					}
				else {
					//  создать новый объект
					if (!("colName" in params)) 
						var col = "Children";
					else col = params.colName;

                    params.ini = params.ini ? params.ini : {};

                    // если рутовый то указываем db
                    if (params.parent===undefined)
						// корневой компонент
                        this.pvt.obj = new MemObj(cm.getDB().getObj(this.classGuid),{db: cm.getDB(), mode: "RW"}, params.ini);
                    else
						// компонент с парентом
                        this.pvt.obj = new MemObj(cm.getDB().getObj(this.classGuid),{obj: params.parent.getObj(), "colName": col}, params.ini);
					
				}
				cm.add(this);
				
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


            /**
             * Возвращает родительский элемент или нулл
             */				
			getParent: function() {
				if (this.getObj().getParent() == null)
					return null
				else
					return this.pvt.controlMgr.getByGuid(this.getObj().getParent().getGuid());
			},
			
			getControlMgr: function() {	
				return this.pvt.controlMgr;
			},
			
			// метаинформация (properties)
			
			countProps: function() {
				return this.pvt.obj.countFields();
			},
			
			getPropName: function(i) {
			if (i>=0 && i<this.pvt.obj.countFields())
				return this.pvt.obj.getFieldName(i);
			},
			
			getPropType: function(i) {
			if (i>=0 && i<this.pvt.obj.countFields())
				return this.pvt.obj.getFieldType(i);
			},

			

            /**
             * сеттер-геттер свойств по умолчанию (дженерик) - используется если нет дополнительной логики в свойствах
             */
			
			_genericSetter: function(fldName,fldVal) {
				if (fldVal!==undefined) 
					this.pvt.obj.set(fldName,fldVal);

				return this.pvt.obj.get(fldName);					
			},			
			
			id: function(value) {
				return this._genericSetter("Id",value);
			},

			name: function(value) {
				return this._genericSetter("Name",value);
			}

        });
        return AComponent;
    }
);