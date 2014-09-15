if (typeof define !== 'function') {
    var define = require('amdefine')(module);
    var Class = require('class.extend');
}

define(
	['./memObj'],
	function(MemObj) {
		var MemObjLog = Class.extend({

			init: function(){
				this._log = [];
				this._active = false;
				
			},
			
			truncate: function() {
				this._log = [];
			},
			
			setActive: function(active) {
				if (active)
					this._active = true;
				else 
					this._active = false;
			},
			
			getActive: function() {
				return this._active;
			},
			
			
			// сгенерировать "дельту" изменений по логу объекта
			genDelta: function() {
				var delta = {};
				var deltaIdx = {};
				delta.items = [];
				var log = this._log;
				for (var i=0; i<log.length; i++) {
					var c = log[i];
					var s = c.obj.getLid();
                    if (!(s in deltaIdx)) {
						var curd = {};
						curd.Lid = c.obj.getLid(); // вообще нужен гуид
						deltaIdx[s] = delta.items.length;
                        delta.items.push(curd); 
						// TODO добавить элемент для идентификации
					}
                    else
                        curd = delta.items[deltaIdx[s]];
					
					switch(c.type) {
						// изменение поля (свойства)
						case "mp":
							for (var fld in c.flds) {
								curd[fld] = {};
								curd[fld].old = c.flds[fld].old;
								curd[fld].new = c.flds[fld].new;
							}
							break;
					}
				}
				return delta;
			},
			
			// применить "дельту" изменений к объекту
			applyDelta: function() {
				
			},
			
			
			// логировать изменение свойств объекта
			// objModif.target
			// objModif.property
			// objModif.oldValue
			// objModif.newValue
			_objModif: function(modifData) {
                if (this._active) {
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
                    this._log.push(changes); // записываем изменение в лог
                }				
			},
			
			
			

		});
		return MemObjLog;
	}
);