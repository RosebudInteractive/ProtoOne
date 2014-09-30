if (typeof define !== 'function') {
    var define = require('amdefine')(module);
    var Class = require('class.extend');
}

define(
	['./memObj'],
	function(MemObj) {
		var MemObjLog = Class.extend({

			init: function(obj){
				this.pvt = {};
				this.pvt.obj = obj;
				this.pvt.log = [];
				this.pvt.active = false;
				
			},
			
			truncate: function() {
				this.pvt.log = [];
			},
			
			setActive: function(active) {
				if (active)
					this.pvt.active = true;
				else 
					this.pvt.active = false;
			},
			
			getActive: function() {
				return this.pvt.active;
			},
			
			
			// сгенерировать "дельту" изменений по логу объекта
			genDelta: function() {
				var delta = {};
				var deltaIdx = {};
				delta.items = [];
				var log = this.pvt.log;
				for (var i=0; i<log.length; i++) {
					var c = log[i];
					var s = c.obj.getGuid();
                    if (!(s in deltaIdx)) {
						var curd = {};
						curd.guid = c.obj.getGuid();
						deltaIdx[s] = delta.items.length;
                        delta.items.push(curd); 
						curd.fields = {};
						// TODO добавить элемент для идентификации
					}
                    else
                        curd = delta.items[deltaIdx[s]];
								
					switch(c.type) {
						// изменение поля (свойства)
						case "mp":
							for (var fld in c.flds) {
								/*curd[fld] = {};
								curd[fld].old = c.flds[fld].old;
								curd[fld].new = c.flds[fld].new;*/
								curd.fields[fld] = c.flds[fld].new;
							}
							break;
					}
				}
				return delta;
			},
			
			// применить "дельту" изменений к объекту
			applyDelta: function(delta) {
				for (var i=0; i<delta.items.length; i++) {
					var c = delta.items[i];
					var o = this.pvt.obj.getDB().getObj(c.guid);
					if (o) 
						for (var cf in c.fields) {
							// TODO проверить наличие полей с таким именем в метаинфо
							// и понять как поступать с логом (отключать?)
							o.set(cf,c.fields[cf]);
						}
				}
				
			},
			
			
			// логировать изменение свойств объекта
			// objModif.target
			// objModif.property
			// objModif.oldValue
			// objModif.newValue
			_objModif: function(modifData) {
                if (this.pvt.active) {
                    //var fldMeta = modifData.target.fields[modifData.property];
                    var changes = {};
                    changes.flds = {};
                    changes.flds[modifData.property] = {};
                    //switch (fldMeta.type.toUpperCase()) {
                        /*case LogicalType.Enum:
                            if (!(modifData.oldValue === undefined))
                                changes.flds[modifData.property].old = fldMeta.values[modifData.oldValue];
                            if (!(modifData.newValue === undefined))
                                changes.flds[modifData.property].new = fldMeta.values[modifData.newValue];
                            break;
                        case LogicalType.Date, LogicalType.Time, LogicalType.DateTime:
                            if (!(modifData.oldValue === undefined))
                                changes.flds[modifData.property].old = modifData.oldValue.getTime() + "|0";
                            if (!(modifData.newValue === undefined))
                                changes.flds[modifData.property].new = modifData.newValue.getTime() + "|0";
                            break;
                        case LogicalType.Bool:
                            if (!(modifData.oldValue === undefined))
                                changes.flds[modifData.property].old = modifData.oldValue ? "True" : "False";
                            if (!(modifData.newValue === undefined))
                                changes.flds[modifData.property].new = modifData.newValue ? "True" : "False";
                            break;*/
                        //default:
                            changes.flds[modifData.property].old = modifData.oldValue;
                            changes.flds[modifData.property].new = modifData.newValue;
                         //   break;
                    //}
                    changes.type = "mp";
                    changes.obj = modifData.target;
                    this.pvt.log.push(changes); // записываем изменение в лог
                }				
			},
			
			
			

		});
		return MemObjLog;
	}
);