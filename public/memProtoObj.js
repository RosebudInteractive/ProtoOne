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
			
			
				this._objType = objType;
				this._fields = [];				// значения полей объекта
				this._collections = [];			// массив дочерних коллекций
				this._log = null; 
				
				if (!parent.obj) {	// корневой объект
					this._db = parent.db;
					if (flds && (flds.$sys) && (flds.$sys.lid))
						this.$id = flds.$sys.lid;
					else
						this.$id = this.getDB().getNewLid();		// локальный идентификатор
					this._db._addRoot(this,parent.mode);
					this._log = new MemObjLog();	// создать лог записи изменений
					if (parent.mode == "RW")
						this._log.setActive(true); // лог активен только для корневого объекта, который создан в режиме ReadWrite
				}
				else { 				// объект в коллекции (не корневой)
					this._col = parent.obj.getCol(parent.colName);
					this._parent = parent.obj;
					if (flds && (flds.$sys) && (flds.$sys.lid))
						this.$id = flds.$sys.lid;
					else
						this.$id = this.getDB().getNewLid();		// локальный идентификатор
					this._col._add(this);
				}
										
			},
			
			// Добавляем логгер
			
			
			addChild: function(colName,obj) {
				
			},
						
			getDB: function() {
				if (!this._col) return this._db;
				else return this._col.getDB();
			},
			
			// получить локальный идентификатор объекта
            getLid: function() {
                return this.$id;
            },
			
			getObjType: function() {
				return this._objType;
			},
			
			getLog: function() {
				return this._log; // TODO вернуть корневой лог (ссылку на корневой объект?)
			}

		});
		return MemProtoObj;
	}
);