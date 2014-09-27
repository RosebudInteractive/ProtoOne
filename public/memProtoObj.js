if (typeof define !== 'function') {
    var define = require('amdefine')(module);
    var Class = require('class.extend');
}

define(
	['./memObjLog'],
	function(MemObjLog) {
		var MemProtoObj = Class.extend({
			_objType: null,	
			_parent: null,
			_col: null,
			_db: null,
				
			// objType - ссылка на объект-тип
			// parent - ссылка на объект и имя коллекции либо db, null для корневых  (obj и colname)
			init: function(objType, parent,flds){
			
				var pvt = this.pvt = {}; // приватные члены
				 
				pvt.objType = objType;
				pvt.fields = [];				// значения полей объекта
				pvt.collections = [];			// массив дочерних коллекций
				pvt.log = null; 
				
				if (!parent.obj) 	// корневой объект
					pvt.db = parent.db;
				else {				// объект в коллекции (не корневой)
					pvt.col = parent.obj.getCol(parent.colName);
					pvt.parent = parent.obj;					
				}
				
				pvt.$id = this.getDB().getNewLid();		// локальный идентификатор
				if ((flds) && (flds.$sys) && (flds.$sys.guid))	// если гуид пришел в системных полях, то используем его
					pvt.guid = flds.$sys.guid;
				else 											// если нет - генерируем динамически
					pvt.guid =  this.getDB().getController().guid();  // TODO перенести в UTILS?
				
				if (!parent.obj) {	// корневой объект				
					pvt.db._addRoot(this,parent.mode);
					pvt.log = new MemObjLog();	// создать лог записи изменений
					if (parent.mode == "RW")
						pvt.log.setActive(true); // лог активен только для корневого объекта, который создан в режиме ReadWrite
				}
				else 
					pvt.col._add(this);
										
			},
			
			// Добавляем логгер
			
			
			addChild: function(colName,obj) {
				
			},
						
			getDB: function() {
				if (!this.pvt.col) return this.pvt.db;
				else return this.pvt.col.getDB();
			},
			
			// получить локальный идентификатор объекта
            getLid: function() {
                return this.pvt.$id;
            },
			
			getGuid: function() {
				return this.pvt.guid;
			},
			
			getObjType: function() {
				return this.pvt.objType;
			},
			
			getLog: function() {
				return this.pvt.log; // TODO вернуть корневой лог (ссылку на корневой объект?)
			}

		});
		return MemProtoObj;
	}
);