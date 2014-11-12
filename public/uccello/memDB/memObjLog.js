if (typeof define !== 'function') {
    var define = require('amdefine')(module);
    var Class = require('class.extend');
}

define(
	[],
	function() {
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
						// удаление объекта из иерархии
						case "del":
							var par = c.obj.getParent();
							curd.parentGuid = par.getGuid();
							curd.parentColName = c.obj.getColName();
							curd.deleted = 1;
							break;
					}
				}
				delta.rootGuid = this.getObj().getRoot().getGuid();
				delta.dbVersion = this.getObj().getDB().getVersion();
				this.truncate();
				return delta;
			},
			
			// применить "дельту" изменений к объекту
			applyDelta: function(delta) {
				this.setActive(false);
				var db = this.getObj().getDB();
				for (var i=0; i<delta.items.length; i++) {
					var c = delta.items[i];
					if ("deleted" in c) {
						var o = db.getObj(c.parentGuid);
						// TODO коллбэк на удаление 
						o.getCol(c.parentColName)._del(db.getObj(c.guid));
					}
					else {
						if ("add" in c) {					
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
				}
				this.setActive(true);
				db.newVersion();
			},
			
			add: function(item) {
				if (this.getActive()) {
					item.idx = this.getObj().getDB().getNewCounter();
					this.pvt.log.push(item);				// добавить в лог корневого объекта
				}
				var db = this.getObj().getDB();
				var sver = db.getVersion("sent");
				var ver = db.getVersion();
				if (ver==sver) db.newVersion();
			}
		});
		return MemObjLog;
	}
);