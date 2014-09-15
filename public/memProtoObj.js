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
			init: function(objType, parent){
				this._objType = objType;
				this._fields = [];				// значения полей объекта
				this._collections = [];			// массив дочерних коллекций
				this._log = null; 
				
				if (!parent.obj) {	// корневой объект
					this._db = parent.db;
					this._db._addRoot(this,parent.mode);
					this._log = new MemObjLog();	// создать лог записи изменений
					if (parent.mode == "RW")
						this._log.setActive(true); // лог активен только для корневого объекта, который создан в режиме ReadWrite
				}
				else { 				// объект в коллекции (не корневой)
					this._col = parent.obj.getCol(parent.colName);
					this._parent = parent.obj;
					this._col._add(this);
				}

				
				this.$id = this.getDB().getNewLid();		// локальный идентификатор
										
			},
			
			// Добавляем логгер
			
			
			addChild: function(colName,obj) {
				
			},
			
			
			get: function(field) {
				//this._objType.getCol(
				//var 
				//this._fields[i];
			},
			
			getDB: function() {
				if (!this._col) return this._db;
				else return this._col.getDB();
			},
			
			// получить локальный идентификатор объекта
            getLid: function() {
                return this.$id;
            },
			
			getLog: function() {
				return this._log; // TODO вернуть корневой лог (ссылку на корневой объект?)
			}
			
			/*getCol: function(col) {
				if (typeof col == "number")
					return this._collections[col]; 
				else 
					return this._collections[this._objType.getCol(2).getObjIdx(col)];
			},
			*/
			

		});
		return MemProtoObj;
	}
);