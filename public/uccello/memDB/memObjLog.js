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
			
			getObj: function() {
				return this.pvt.obj;
			},
						
			// сгенерировать "дельту" изменений по логу объекта
			genDelta: function() {
				var delta = {};
				var deltaIdx = {};
				delta.items = [];
				var log = this.pvt.log;
				if (log.length == 0) return null;
				for (var i=0; i<log.length; i++) {
					var c = log[i];
					var s = c.obj.getGuid();
                    if (!(s in deltaIdx)) {
						var curd = {};
						curd.guid = c.obj.getGuid();
						deltaIdx[s] = delta.items.length;
                        delta.items.push(curd); 
						// TODO добавить элемент для идентификации
					}
                    else 
                        curd = delta.items[deltaIdx[s]];
								
					switch(c.type) {
						// изменение поля (свойства)
						case "mp":
							if (!("fields" in curd)) curd.fields = {};
							for (var fld in c.flds) {
								/*curd[fld] = {};
								curd[fld].old = c.flds[fld].old;
								curd[fld].new = c.flds[fld].new;*/
								curd.fields[fld] = c.flds[fld].new;
							}
							break;
						// добавление объекта в иерархию
						case "add":
							curd.add = c.adObj;
							var par = c.obj.getParent();
							if (par) {
								curd.parentGuid = par.getGuid();
								curd.parentColName = c.obj.getColName();
							}
							else
								curd.parentGuid = "";
							break;
					}
				}
				delta.rootGuid = this.getObj().getRoot().getGuid();
				this.truncate();
				return delta;
			},
			
			// применить "дельту" изменений к объекту
			applyDelta: function(delta) {
				this.setActive(false);
				for (var i=0; i<delta.items.length; i++) {
					var c = delta.items[i];
					if ("add" in c) {
						var db = this.getObj().getDB();
						var o = db.getObj(c.parentGuid);
						var cb = db._cbGetNewObject(db.getObj(c.parentGuid).getRoot().getGuid());
						o.getDB().deserialize(c.add, { obj: o, colName: c.parentColName }, cb ); 
					}
					o2 = this.getObj().getDB().getObj(c.guid);
					if (o2) {
						for (var cf in c.fields) {
							// TODO проверить наличие полей с таким именем в метаинфо
							o2.set(cf,c.fields[cf]);
						}
						
					}
				}
				this.setActive(true);				
			},
			

			add: function(item) {
				if (this.getActive()) {
					item.idx = this.getObj().getDB().getNewCounter();
					this.pvt.log.push(item);				// добавить в лог корневого объекта
				}
			}
			
			/*
			_objModif: function(field, logItem) {
                if (this.pvt.active) {
                    //var fldMeta = modifData.target.fields[modifData.property];
                    var changes = {};
                    changes.flds = {};
                    changes.flds[field] = {};
                    changes.flds[field].old = modifData.oldValue;
                    changes.flds[field].new = modifData.newValue;
                    changes.type = "mp";
                    changes.obj = modifData.target;
                    this.pvt.log.push(changes); // записываем изменение в лог
                    //switch (fldMeta.type.toUpperCase()) {
                        case LogicalType.Enum:
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
                            break;
                        //default:

                }		
			},*/
			
			
			

		});
		return MemObjLog;
	}
);